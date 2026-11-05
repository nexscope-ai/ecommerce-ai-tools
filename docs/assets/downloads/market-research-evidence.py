#!/usr/bin/env python3
"""Python 3.10+ evidence starter: one POST, no automatic retry or pagination.
Set NEXSCOPE_API_KEY locally; --from-response performs no network request.
"""
import argparse,csv,json,math,os,re
from datetime import date,datetime,timezone
from pathlib import Path
from uuid import UUID
from urllib.request import Request,HTTPRedirectHandler,build_opener
from urllib.error import HTTPError,URLError

PATHS={"meta-companies":"/social/facebook/adLibrary/search/companies",
"meta-search":"/social/facebook/adLibrary/search/ads","meta-company-ads":"/social/facebook/adLibrary/company/ads",
"meta-detail":"/social/facebook/adLibrary/ad",
"shopping-search":"/api/skill-api/v1/skills/seo-shopping-products/run",
"shopping-details":"/api/skill-api/v1/skills/seo-shopping-product-details/run",
"shopping-offers":"/api/skill-api/v1/skills/seo-shopping-seller-offers/run"}

def validate(mode,r):
    if not isinstance(r,dict):raise ValueError("Request must be an object")
    if mode=="meta-companies":
        if set(r)!={"query"} or not isinstance(r["query"],str) or not r["query"].strip() or "REPLACE" in r["query"]:raise ValueError("Set a company query")
    elif mode=="meta-search":
        if set(r)!={"query","country","language","status","trim"} or not isinstance(r["query"],str) or not r["query"].strip():raise ValueError("Use the five search starter fields")
        if r["country"]!="US" or r["language"]!="EN" or r["status"]!="ACTIVE" or r["trim"] is not True:raise ValueError("Starter scope is US/EN/ACTIVE with trim true")
    elif mode=="meta-company-ads":
        if set(r)!={"pageId","country","status","trim"} or not isinstance(r["pageId"],str) or not re.fullmatch(r"[0-9]+",r["pageId"]) or int(r["pageId"])<1:raise ValueError("Set a returned company pageId")
        if r["country"]!="US" or r["status"]!="ACTIVE" or r["trim"] is not True:raise ValueError("Starter scope is US/ACTIVE with trim true")
    elif mode=="meta-detail":
        if set(r)!={"id","trim","get_transcript","allow_long_transcription"} or not isinstance(r["id"],str) or not re.fullmatch(r"[0-9]+",r["id"]) or int(r["id"])<1:raise ValueError("Set a returned ad ID")
        if r["trim"] is not True or r["get_transcript"] is not False or r["allow_long_transcription"] is not False:raise ValueError("Starter does not enable transcription")
    elif mode=="shopping-search":
        if set(r)!={"keyword","limit"} or not isinstance(r["keyword"],str) or not 1<=len(r["keyword"].strip())<=200 or type(r["limit"]) is not int or not 1<=r["limit"]<=5:raise ValueError("Use a keyword and starter limit 1..5")
    else:
        wanted={"task_id","productRef"}|({"limit"} if mode=="shopping-offers" else set())
        if set(r)!=wanted or not isinstance(r.get("task_id"),str):raise ValueError("Use the source task_id and productRef")
        UUID(r["task_id"])
        if not isinstance(r.get("productRef"),str) or not re.fullmatch(r"[0-9a-f]{64}",r["productRef"]):raise ValueError("Use the opaque productRef returned by the prerequisite search")
        if mode=="shopping-offers" and (type(r["limit"]) is not int or not 1<=r["limit"]<=5):raise ValueError("Starter offers limit is 1..5")

def objects(v):
    if not isinstance(v,list) or any(not isinstance(x,dict) for x in v):raise ValueError("Expected object array")
    return v

def analyze(mode,r,body):
    if not isinstance(body,dict) or type(body.get("code")) is not int or body["code"]!=0:raise ValueError("Inspect outer business code")
    data=body.get("data")
    if not isinstance(data,dict):raise ValueError("Expected data object")
    if mode.startswith("meta-"):
        state=data.get("resourceStatus")
        if state not in {"AVAILABLE","PARTIAL"}:return [],{"status":"not_exported","resourceStatus":state}
        if not isinstance(data.get("data"),dict):raise ValueError("Expected supplier payload in data.data")
        return [],{"status":"raw_payload_requires_review","resourceStatus":state,"platform":data.get("platform"),"usage":data.get("usage"),"csv_created":False}
    state=data.get("status")
    if state not in {"SUCCESS","PARTIAL","EMPTY"}:return [],{"status":"not_exported","call_status":state,"callId":data.get("callId")}
    result=data.get("result")
    if not isinstance(result,dict) or not isinstance(result.get("meta"),dict):raise ValueError("Missing completed result or metadata")
    expected={"shopping-search":"DATAFORSEO_GOOGLE_SHOPPING_PRODUCTS","shopping-details":"DATAFORSEO_GOOGLE_SHOPPING_PRODUCT_INFO","shopping-offers":"DATAFORSEO_GOOGLE_SHOPPING_SELLERS"}
    if result["meta"].get("source")!=expected[mode]:raise ValueError("Shopping source mismatch")
    meta={"call_status":state,"callId":data.get("callId"),"sample_meta":result["meta"],"coverage":data.get("coverage"),"usage":data.get("usage")}
    if mode=="shopping-search":
        if result.get("keyword")!=r["keyword"]:raise ValueError("Returned keyword mismatch")
        records=objects(result.get("products"));seen=set();rows=[]
        if len(records)>r["limit"]:raise ValueError("Returned products exceed requested limit")
        for item in records:
            ref=item.get("productRef")
            if not isinstance(ref,str) or not re.fullmatch(r"[0-9a-f]{64}",ref) or ref in seen:raise ValueError("Missing or duplicate productRef")
            seen.add(ref)
            fields=["productRef","title","description","shoppingUrl","price","oldPrice","currency","installmentMonths","seller","domain","rankGroup","rankAbsolute","detailEligible"]
            rows.append({"keyword":r["keyword"],**{f:item.get(f) for f in fields},"product_match":"","review_note":""})
        return rows,dict(meta,status="exported_for_review")
    if result.get("productRef")!=r["productRef"] or not isinstance(result.get("sourceCallId"),str):raise ValueError("Product reference or source context missing")
    meta.update(sourceCallId=result["sourceCallId"],requested_task_id=r["task_id"])
    if mode=="shopping-details":
        objects(result.get("details"))
        return [],dict(meta,status="detail_payload_requires_review",csv_created=False)
    records=objects(result.get("offers"));rows=[]
    if len(records)>r["limit"]:raise ValueError("Returned offers exceed requested limit")
    fields=["sellerName","title","domain","url","details","basePrice","tax","shippingPrice","totalPrice","currency","installmentMonths","paymentBreakdown","rankGroup","rankAbsolute"]
    for item in records:
        for field in ["basePrice","tax","shippingPrice","totalPrice"]:
            v=item.get(field)
            if v is not None and (type(v) not in (int,float) or not math.isfinite(v) or v<0):raise ValueError("Invalid observed price")
        rows.append({"productRef":r["productRef"],**{f:item.get(f) for f in fields},"variant_match":"","checkout_check":"","review_note":""})
    return rows,dict(meta,status="exported_for_review")


def cell(v):
    if v is None:return ""
    text=json.dumps(v,ensure_ascii=False) if isinstance(v,(list,dict,bool)) else str(v)
    return "'"+text if isinstance(v,str) and (text.startswith(("\t","\n","\r")) or text.lstrip().startswith(("=","+","-","@"))) else text

def export(p,rows):
    fields=list(rows[0]) if rows else []
    with p.open("x",encoding="utf-8-sig",newline="") as f:
        w=csv.DictWriter(f,fieldnames=fields+["missing_fields"]);w.writeheader()
        for row in rows:w.writerow({**{k:cell(v) for k,v in row.items()},"missing_fields":";".join(k for k,v in row.items() if v is None)})

class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self,*args):raise URLError("Redirect refused")

def main(argv=None):
    p=argparse.ArgumentParser(description=__doc__);p.add_argument("mode",choices=PATHS);p.add_argument("request",type=Path);p.add_argument("--output",type=Path,required=True);p.add_argument("--from-response",type=Path);p.add_argument("--call-id");a=p.parse_args(argv)
    try:
        r=json.loads(a.request.read_text(encoding="utf-8-sig"));validate(a.mode,r)
        path=PATHS[a.mode]
        if a.call_id:
            if not a.mode.startswith("shopping-"):raise ValueError("Owner result lookup is only for Shopping modes")
            a.call_id=str(UUID(a.call_id));path=path.removesuffix("/run")+"/calls/"+a.call_id
        key="" if a.from_response else os.environ.get("NEXSCOPE_API_KEY","").strip()
        if not a.from_response and (not key or "\r" in key or "\n" in key):raise ValueError("Set NEXSCOPE_API_KEY locally")
        a.output.mkdir(parents=True,exist_ok=False)
    except (ValueError,TypeError,OSError) as e:p.error(str(e))
    meta={"mode":a.mode,"request":{k:("<redacted>" if k=="documentToken" else v) for k,v in r.items()},"endpoint":"https://api.nexscope.ai"+path,"client_observed_at_utc":datetime.now(timezone.utc).isoformat(),"automatic_retries":0,"source_mode":"offline" if a.from_response else "live"};code=1
    try:
        if a.from_response:raw=a.from_response.read_bytes()
        else:
            req=Request(meta["endpoint"],method="GET" if a.call_id else "POST",data=None if a.call_id else json.dumps(r).encode(),headers={"Authorization":"Bearer "+key,"Content-Type":"application/json"})
            try:
                with build_opener(NoRedirect).open(req,timeout=90) as res:raw=res.read();meta["http_status"]=res.status
            except HTTPError as e:raw=e.read();meta["http_status"]=e.code
        (a.output/"response.json").write_bytes(raw)
        if not a.from_response and not 200<=meta["http_status"]<300:raise ValueError("Unsuccessful HTTP response")
        body=json.loads(raw)
        if a.call_id and (not isinstance(body,dict) or not isinstance(body.get("data"),dict) or body["data"].get("callId")!=a.call_id):raise ValueError("Returned callId mismatch")
        rows,details=analyze(a.mode,r,body);meta.update(details,exported_rows=len(rows))
        if meta["status"]=="exported_for_review":export(a.output/"rows.csv",rows);code=0
        else:code=2
    except (ValueError,TypeError,KeyError,OSError,URLError) as e:meta.update(status="stopped_inspect_response",error_type=type(e).__name__)
    finally:(a.output/"manifest.json").write_text(json.dumps(meta,indent=2,ensure_ascii=False),encoding="utf-8")
    print(meta["status"]+": review local response.json and manifest.json");return code
if __name__=="__main__":raise SystemExit(main())
