#!/usr/bin/env python3
"""Python 3.10+ evidence starter: one POST, no automatic retry or pagination.
Set NEXSCOPE_API_KEY locally; --from-response performs no network request.
"""
import argparse,csv,json,math,os,re
from datetime import date,datetime,timezone
from pathlib import Path
from urllib.request import Request,HTTPRedirectHandler,build_opener
from urllib.error import HTTPError,URLError

ADS="/api/skill-api/v1/skills/amazon-ads-reporting/run"
PATHS={"instagram-profile":"/instagram/profile","instagram-posts":"/instagram/posts","traffic":"/sf/asinSummary",
       "ads-create":ADS,"ads-status":ADS,"ads-download":ADS}

def validate(mode,r):
    if not isinstance(r,dict):raise ValueError("Request must be an object")
    if mode.startswith("instagram"):
        if set(r)-{"handle","trim"} or not isinstance(r.get("handle"),str) or not re.fullmatch(r"@?[A-Za-z0-9._]{1,30}",r["handle"]) or "REPLACE" in r["handle"]:raise ValueError("Set one real public handle; starter supports handle/trim only")
        if "trim" in r and type(r["trim"]) is not bool:raise ValueError("trim must be boolean")
    elif mode=="traffic":
        if set(r)!={"searchValue","country","last7d","pageNum","pageSize"} or not isinstance(r["searchValue"],str):raise ValueError("Use the five starter fields")
        asins=r["searchValue"].split(",")
        if not 1<=len(asins)<=3 or len(set(asins))!=len(asins) or any(not re.fullmatch(r"[A-Z0-9]{10}",x) or "XXXXX" in x or "REPLACE" in x for x in asins):raise ValueError("Use 1..3 distinct uppercase ASINs without spaces")
        if r["country"]!="US" or r["last7d"] is not True or type(r["pageNum"]) is not int or r["pageNum"]!=1 or type(r["pageSize"]) is not int or r["pageSize"]!=10:raise ValueError("Starter scope: US, recent seven days, first page of ten")
    else:
        if type(r.get("connectionId")) is not int or r["connectionId"]<=0:raise ValueError("Use your own positive connectionId; zero is a placeholder")
        if mode=="ads-status":
            if set(r)!={"connectionId","reportId"} or not isinstance(r["reportId"],str) or not r["reportId"].strip() or "REPLACE" in r["reportId"]:raise ValueError("Use the original reportId")
        elif mode=="ads-download":
            if set(r)!={"connectionId","documentToken"} or not isinstance(r["documentToken"],str) or not r["documentToken"].strip() or "REPLACE" in r["documentToken"]:raise ValueError("Use a backend documentToken, never a URL")
            if re.match(r"https?://",r["documentToken"],re.I):raise ValueError("Expected opaque document token")
        else:
            fields={"connectionId","startDate","endDate","adProduct","reportTypeId","groupBy","columns"}
            if set(r)!=fields or r["adProduct"]!="SPONSORED_PRODUCTS" or r["reportTypeId"]!="spCampaigns" or r["groupBy"]!=["campaign"]:raise ValueError("Starter supports a Sponsored Products campaign report only")
            start,end=date.fromisoformat(r["startDate"]),date.fromisoformat(r["endDate"])
            if end<start or (end-start).days>30:raise ValueError("Use an ordered report window of at most 31 days")
            if not isinstance(r["columns"],list) or not r["columns"] or len(set(r["columns"]))!=len(r["columns"]) or set(r["columns"])-{"campaignId","impressions","clicks","cost"}:raise ValueError("Use supported starter columns")

def objects(v):
    if not isinstance(v,list) or any(not isinstance(x,dict) for x in v):raise ValueError("Expected an object array")
    return v

def analyze(mode,r,body):
    if not isinstance(body,dict) or type(body.get("code")) is not int or body["code"]!=0:raise ValueError("Inspect outer business code")
    data=body.get("data")
    if not isinstance(data,dict):raise ValueError("Expected data object")
    if mode.startswith("ads-"):
        if mode=="ads-status" and data.get("reportId") not in (None,r["reportId"]):raise ValueError("Returned reportId mismatch")
        meta={"status":"report_requires_review","report_status":data.get("status"),"reportId":data.get("reportId"),"contentType":data.get("contentType"),"content_present":data.get("content") is not None}
        return [],meta
    rows=[]
    if mode.startswith("instagram"):
        if data.get("platform")!="instagram":raise ValueError("Platform mismatch")
        state=data.get("resourceStatus")
        meta={"resourceStatus":state,"fetchedAt":data.get("fetchedAt"),"sourceFetchedAt":data.get("sourceFetchedAt"),"usage":data.get("usage"),"hasMore":data.get("hasMore"),"nextCursor":data.get("nextCursor")}
        if state not in {"AVAILABLE","PARTIAL"}:return [],dict(meta,status="not_exported")
        if mode=="instagram-profile":
            profile=data.get("profile")
            if not isinstance(profile,dict) or str(profile.get("handle","")).lstrip("@").casefold()!=r["handle"].lstrip("@").casefold():raise ValueError("Missing profile or handle mismatch")
            fields=["id","handle","url","name","bio","followerCount","followingCount","postCount","isPrivate"]
            rows=[{"requested_handle":r["handle"],**{f:profile.get(f) for f in fields},"product_relevance":"","review_note":""}]
        else:
            seen=set()
            for post in objects(data.get("items")):
                identity=post.get("id") or post.get("url")
                if not isinstance(identity,str) or not identity or identity in seen:raise ValueError("Missing or duplicate post identity")
                seen.add(identity)
                author=post.get("author")
                if isinstance(author,dict) and isinstance(author.get("handle"),str) and author["handle"].lstrip("@").casefold()!=r["handle"].lstrip("@").casefold():raise ValueError("Post author mismatch")
                fields=["id","url","type","caption","publishedAt","likeCount","commentCount","viewCount"]
                rows.append({"requested_handle":r["handle"],**{f:post.get(f) for f in fields},"topic_match":"","review_note":""})
        return rows,dict(meta,status="exported_for_review")
    if data.get("code") not in (None,"1"):raise ValueError("Provider business code is not successful")
    wanted=set(r["searchValue"].split(","));seen=set()
    fields=["asin","productTitle","dataPeriodStartDate","isVariantProduct","totalExposureScore","totalExposureScorePrev","totalTrafficKeywordCount","totalTrafficKeywordCountIn","totalTrafficKeywordCountOut","naturalSearchExposureScore","naturalSearchExposureRatio","sponsoredProductsExposureScore","sponsoredProductsExposureRatio","brandAdExposureScore","videoAdExposureScore","ppcTrafficSources","naturalSearchTrafficSources","amazonRecommendationSources"]
    records=objects(data.get("data"))
    if len(records)>r["pageSize"]:raise ValueError("Bounded page exceeded")
    for item in records:
        asin=item.get("asin")
        if asin not in wanted or asin in seen:raise ValueError("Unexpected or duplicate ASIN; reconcile parent/variant scope")
        seen.add(asin)
        for field in ["totalExposureScore","totalExposureScorePrev","naturalSearchExposureScore","sponsoredProductsExposureScore"]:
            value=item.get(field)
            if value is not None and (type(value) not in (int,float) or not math.isfinite(value) or value<0):raise ValueError("Malformed exposure score")
        rows.append({"country":r["country"],"requested_window":"last7d",**{f:item.get(f) for f in fields},"interpretation":"","next_check":""})
    return rows,{"status":"exported_for_review","requested_asins":sorted(wanted),"not_returned_asins":sorted(wanted-seen),"isParentAsin":data.get("isParentAsin"),"variantsNum":data.get("variantsNum"),"noKeywordVariantsNum":data.get("noKeywordVariantsNum"),"reported_total":data.get("total")}

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
    p=argparse.ArgumentParser(description=__doc__);p.add_argument("mode",choices=PATHS);p.add_argument("request",type=Path);p.add_argument("--output",type=Path,required=True);p.add_argument("--from-response",type=Path);a=p.parse_args(argv)
    try:
        r=json.loads(a.request.read_text(encoding="utf-8-sig"));validate(a.mode,r)
        key="" if a.from_response else os.environ.get("NEXSCOPE_API_KEY","").strip()
        if not a.from_response and (not key or "\r" in key or "\n" in key):raise ValueError("Set NEXSCOPE_API_KEY locally")
        a.output.mkdir(parents=True,exist_ok=False)
    except (ValueError,TypeError,OSError) as e:p.error(str(e))
    meta={"mode":a.mode,"request":{k:("<redacted>" if k=="documentToken" else v) for k,v in r.items()},"endpoint":"https://api.nexscope.ai"+PATHS[a.mode],"client_observed_at_utc":datetime.now(timezone.utc).isoformat(),"automatic_retries":0,"source_mode":"offline" if a.from_response else "live"};code=1
    try:
        if a.from_response:raw=a.from_response.read_bytes()
        else:
            req=Request(meta["endpoint"],method="POST",data=json.dumps(r).encode(),headers={"Authorization":"Bearer "+key,"Content-Type":"application/json"})
            try:
                with build_opener(NoRedirect).open(req,timeout=90) as res:raw=res.read();meta["http_status"]=res.status
            except HTTPError as e:raw=e.read();meta["http_status"]=e.code
        (a.output/"response.json").write_bytes(raw)
        if not a.from_response and not 200<=meta["http_status"]<300:raise ValueError("Unsuccessful HTTP response")
        body=json.loads(raw);rows,details=analyze(a.mode,r,body);meta.update(details,exported_rows=len(rows))
        if meta["status"]=="exported_for_review":export(a.output/"rows.csv",rows);code=0
        elif a.mode.startswith("ads-"):
            content=body["data"].get("content")
            if content is not None:(a.output/"report-content.json").write_text(json.dumps(content,indent=2,ensure_ascii=False),encoding="utf-8")
            code=2
        else:code=2
    except (ValueError,TypeError,KeyError,OSError,URLError) as e:meta.update(status="stopped_inspect_response",error_type=type(e).__name__)
    finally:(a.output/"manifest.json").write_text(json.dumps(meta,indent=2,ensure_ascii=False),encoding="utf-8")
    print(meta["status"]+": review local response.json and manifest.json");return code
if __name__=="__main__":raise SystemExit(main())
