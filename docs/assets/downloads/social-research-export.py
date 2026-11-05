#!/usr/bin/env python3
"""Python 3.10+: one explicit Nexscope request, raw evidence and review CSV.
No automatic retries, pagination or AI analysis. Offline mode requires no key.
"""
import argparse,csv,json,math,os,re
from datetime import datetime,timezone
from pathlib import Path
from urllib.request import Request,HTTPRedirectHandler,build_opener
from urllib.error import HTTPError,URLError
from urllib.parse import urlsplit
from uuid import UUID

PATHS={"reddit":"/reddit/search","youtube":"/youtube/transcript","pinterest":"/pinterest/search",
       "citations":"/api/skill-api/v1/skills/seo-ai-search-citation-sample/run"}
PLATFORMS={"reddit":"reddit","youtube":"youtube","pinterest":"pinterest"}

def validate(mode,request):
    if not isinstance(request,dict):raise ValueError("Request must be an object")
    if mode in {"reddit","pinterest"}:
        allowed={"keyword","trim"}|({"filter","sort","timeframe"} if mode=="reddit" else set())
        if set(request)-allowed or not isinstance(request.get("keyword"),str) or not 1<=len(request["keyword"].strip())<=1000:raise ValueError("Use one keyword and supported starter fields")
        if "trim" in request and type(request["trim"]) is not bool:raise ValueError("trim must be boolean")
        if mode=="reddit" and (request.get("filter","posts")!="posts" or request.get("sort","relevance") not in {"relevance","new","top","comment_count"} or request.get("timeframe","all") not in {"all","day","week","month","year"}):raise ValueError("Starter supports Reddit post search only")
    elif mode=="youtube":
        if set(request)-{"url","language","originalAudio","cacheMaxAge"}:raise ValueError("Unsupported transcript input")
        url=request.get("url");p=urlsplit(url) if isinstance(url,str) else None
        if not p or p.scheme!="https" or p.username or p.password or p.hostname not in {"youtube.com","www.youtube.com","m.youtube.com","youtu.be"} or "REPLACE" in url:raise ValueError("Provide a real public YouTube HTTPS URL")
        if "language" in request and (not isinstance(request["language"],str) or not re.fullmatch(r"[A-Za-z]{2,3}(-[A-Za-z0-9]{2,8})*",request["language"]) or len(request["language"])>35):raise ValueError("Invalid language")
        if "originalAudio" in request and type(request["originalAudio"]) is not bool:raise ValueError("originalAudio must be boolean")
        if "cacheMaxAge" in request and request["cacheMaxAge"] not in {"1d","3d","7d","14d","30d"}:raise ValueError("Invalid cacheMaxAge")
    else:
        if set(request)!={"prompt"} or not isinstance(request["prompt"],str) or not 1<=len(request["prompt"].strip())<=2000:raise ValueError("Use one prompt of 1..2000 characters")

def array(value):
    if not isinstance(value,list) or any(not isinstance(v,dict) for v in value):raise ValueError("Expected object array")
    return value

def rows_for(mode,request,body):
    if not isinstance(body,dict) or type(body.get("code")) is not int or body["code"]!=0:raise ValueError("Inspect nonzero or invalid outer business code")
    data=body.get("data")
    if not isinstance(data,dict):raise ValueError("Expected data object")
    rows=[]
    if mode=="citations":
        state=data.get("status")
        if state not in {"SUCCESS","PARTIAL","EMPTY"}:return [],dict(status="not_exported",call_status=state,callId=data.get("callId"))
        result=data.get("result")
        if not isinstance(result,dict) or result.get("prompt")!=request["prompt"]:raise ValueError("Missing result or mismatched prompt")
        meta=result.get("meta")
        if not isinstance(meta,dict):raise ValueError("Missing sample metadata")
        for item in array(result.get("citations")):
            rows.append({"prompt":request["prompt"],"sampledAt":meta.get("sampledAt"),"retrievedAt":meta.get("retrievedAt"),
                         **{k:item.get(k) for k in ["url","domain","title","snippet","sourceName","publishedAt"]},"brand_mentioned":"","review_note":""})
        return rows,dict(status="exported_for_review",call_status=state,callId=data.get("callId"),sample_meta=meta,coverage=data.get("coverage"),usage=data.get("usage"),answer_in_raw_response=True)
    if data.get("platform")!=PLATFORMS[mode]:raise ValueError("Marketplace/platform mismatch")
    state=data.get("resourceStatus")
    common=dict(resourceStatus=state,fetchedAt=data.get("fetchedAt"),sourceFetchedAt=data.get("sourceFetchedAt"),usage=data.get("usage"))
    if state not in {"AVAILABLE","PARTIAL"}:return [],dict(common,status="not_exported")
    if mode=="youtube":
        transcript=data.get("transcript")
        if not isinstance(transcript,dict):raise ValueError("Missing transcript; do not invent captions")
        for segment in array(transcript.get("segments")):
            a,b=segment.get("startMs"),segment.get("endMs")
            if any(type(v) not in (int,float) or not math.isfinite(v) or v<0 for v in (a,b)) or b<a or not isinstance(segment.get("text"),str):raise ValueError("Invalid caption segment or millisecond range")
            rows.append({"video_url":request["url"],"language":transcript.get("language"),"caption_kind":transcript.get("kind"),"startMs":a,"endMs":b,"text":segment["text"],"claim_or_question":"","review_note":""})
    else:
        seen=set()
        fields=["id","url","title","body","subreddit","publishedAt","score","commentCount","upvoteRatio"] if mode=="reddit" else ["id","url","title","description","sourceUrl","saveCount","board"]
        for item in array(data.get("items")):
            identity=item.get("id") or item.get("url")
            if not isinstance(identity,str) or not identity:raise ValueError("Missing item identity")
            if identity in seen:raise ValueError("Duplicate source identity; inspect raw records")
            seen.add(identity)
            rows.append({"keyword":request["keyword"],**{k:item.get(k) for k in fields},"theme":"","evidence_note":"","next_question":""})
    return rows,dict(common,status="exported_for_review",hasMore=data.get("hasMore"),nextCursor=data.get("nextCursor"))

def cell(value):
    if value is None:return ""
    text=json.dumps(value,ensure_ascii=False) if isinstance(value,(dict,list,bool)) else str(value)
    return "'"+text if isinstance(value,str) and (text.startswith(("\t","\n","\r")) or text.lstrip().startswith(("=","+","-","@"))) else text

def export(path,rows):
    fields=list(rows[0]) if rows else []
    with path.open("x",encoding="utf-8-sig",newline="") as f:
        writer=csv.DictWriter(f,fieldnames=fields+["missing_fields"]);writer.writeheader()
        for row in rows:writer.writerow({**{k:cell(v) for k,v in row.items()},"missing_fields":";".join(k for k,v in row.items() if v is None)})

class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self,*args):raise URLError("Redirect refused")

def main(argv=None):
    p=argparse.ArgumentParser(description=__doc__);p.add_argument("mode",choices=PATHS);p.add_argument("request",type=Path);p.add_argument("--output",type=Path,required=True)
    source=p.add_mutually_exclusive_group();source.add_argument("--from-response",type=Path);source.add_argument("--call-id")
    a=p.parse_args(argv)
    try:
        request=json.loads(a.request.read_text(encoding="utf-8-sig"));validate(a.mode,request)
        path=PATHS[a.mode]
        if a.call_id:
            if a.mode!="citations":raise ValueError("call-id is only for citation owner results")
            a.call_id=str(UUID(a.call_id));path=path.removesuffix("/run")+"/calls/"+a.call_id
        key="" if a.from_response else os.environ.get("NEXSCOPE_API_KEY","").strip()
        if not a.from_response and (not key or "\r" in key or "\n" in key):raise ValueError("Set NEXSCOPE_API_KEY locally")
        a.output.mkdir(parents=True,exist_ok=False)
    except (ValueError,OSError) as e:p.error(str(e))
    meta=dict(mode=a.mode,request=request,endpoint="https://api.nexscope.ai"+path,client_observed_at_utc=datetime.now(timezone.utc).isoformat(),source_mode="offline" if a.from_response else "live",automatic_retries=0)
    code=1
    try:
        if a.from_response:raw=a.from_response.read_bytes()
        else:
            req=Request(meta["endpoint"],method="GET" if a.call_id else "POST",data=None if a.call_id else json.dumps(request).encode(),headers={"Authorization":"Bearer "+key,"Content-Type":"application/json"})
            try:
                with build_opener(NoRedirect).open(req,timeout=90) as response:raw=response.read();meta["http_status"]=response.status
            except HTTPError as e:raw=e.read();meta["http_status"]=e.code
        (a.output/"response.json").write_bytes(raw)
        if not a.from_response and not 200<=meta["http_status"]<300:raise ValueError("Unsuccessful HTTP response")
        body=json.loads(raw)
        if a.call_id and (not isinstance(body,dict) or not isinstance(body.get("data"),dict) or body["data"].get("callId")!=a.call_id):raise ValueError("Returned callId mismatch")
        rows,details=rows_for(a.mode,request,body);meta.update(details,exported_rows=len(rows))
        if meta["status"]=="exported_for_review":export(a.output/"rows.csv",rows);code=0
        else:code=2
    except (ValueError,TypeError,KeyError,OSError,URLError) as e:meta.update(status="stopped_inspect_response",error_type=type(e).__name__)
    finally:(a.output/"manifest.json").write_text(json.dumps(meta,indent=2,ensure_ascii=False),encoding="utf-8")
    print(meta["status"]+": inspect response.json and manifest.json");return code

if __name__=="__main__":raise SystemExit(main())
