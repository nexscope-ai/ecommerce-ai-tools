"""Local saved-evidence utilities. No network, API credential, model or Sheets client.

feedback: validate reviewer-labelled evidence and export a CSV/theme inventory.
channel: ingest a saved channel response into a pending queue and export pending rows.
ack: mark only explicitly confirmed channel/video deliveries as acknowledged.
budget: compare an explicit estimate with a user-chosen cap; does not reserve credits.
"""
import argparse,csv,json,sqlite3,sys
from pathlib import Path
from decimal import Decimal,InvalidOperation
from datetime import datetime,timezone
from urllib.parse import urlparse

def load(path):
    return json.loads(Path(path).read_text(encoding='utf-8-sig'))
def cell(value):
    if value is None:return ''
    if isinstance(value,str) and (value[:1] in ('\t','\r','\n') or value.lstrip()[:1] in ('=','+','-','@')):return "'"+value
    return value
def export(path,rows,fields):
    p=Path(path);p.parent.mkdir(parents=True,exist_ok=True)
    with p.open('w',encoding='utf-8',newline='') as f:
        writer=csv.DictWriter(f,fieldnames=fields,lineterminator='\n');writer.writeheader()
        for row in rows:writer.writerow({k:cell(row.get(k)) for k in fields})
def https_url(value,hosts=None):
    if not isinstance(value,str):raise ValueError('Missing source URL')
    u=urlparse(value)
    if u.scheme!='https' or not u.hostname or u.username or u.password:raise ValueError('Use an HTTPS source URL without credentials')
    if hosts and not any(u.hostname==h or u.hostname.endswith('.'+h) for h in hosts):raise ValueError('Source URL does not match its declared platform')
    return value
def feedback(args):
    rows=load(args.input)
    if not isinstance(rows,list) or len(rows)>500:raise ValueError('Expected at most 500 evidence objects')
    required=['evidence_id','platform','source_url','source_context','observed_at','text','theme','sample_type']
    seen=set();source_seen=set();counts={}
    allowed={'reddit':['reddit.com'],'youtube':['youtube.com','youtu.be'],'tiktok':['tiktok.com']}
    for row in rows:
        if not isinstance(row,dict):raise ValueError('Every evidence row must be an object')
        if any(not isinstance(row.get(k),str) or not row[k].strip() for k in required):raise ValueError('Required evidence fields must be nonempty strings')
        if row['platform'] not in allowed:raise ValueError('Unsupported platform')
        if row['sample_type'] not in ('synthetic','observed'):raise ValueError('sample_type must be synthetic or observed')
        https_url(row['source_url'],['example.com'] if row['sample_type']=='synthetic' else allowed[row['platform']])
        dt=datetime.fromisoformat(row['observed_at'].replace('Z','+00:00'))
        if dt.tzinfo is None:raise ValueError('observed_at must include a timezone')
        if len(row['text'])>20000:raise ValueError('Evidence text too long')
        if row['evidence_id'] in seen:raise ValueError('Duplicate local evidence ID')
        seen.add(row['evidence_id'])
        sid=row.get('source_record_id')
        if sid is not None and (not isinstance(sid,str) or not sid.strip()):raise ValueError('source_record_id must be a nonempty string or null')
        if sid:
            key=(row['platform'],sid)
            if key in source_seen:raise ValueError('Duplicate source record in this evidence batch; review before counting')
            source_seen.add(key)
        key=(row['platform'],row['theme']);counts[key]=counts.get(key,0)+1
    fields=['evidence_id','platform','source_record_id','source_url','source_context','observed_at','text','theme','sample_type']
    export(args.output,rows,fields)
    return {'rows':len(rows),'theme_inventory':[{'platform':p,'reviewer_theme':t,'retained_rows':n} for (p,t),n in sorted(counts.items())],'scope':'Counts describe this input file, not buyer prevalence. No AI classification or API call performed.'}
def db(path):
    p=Path(path);p.parent.mkdir(parents=True,exist_ok=True)
    con=sqlite3.connect(p,timeout=10)
    con.row_factory=sqlite3.Row
    con.execute('CREATE TABLE IF NOT EXISTS outbox (channel TEXT NOT NULL, video_id TEXT NOT NULL, source_url TEXT NOT NULL, title TEXT, resource_status TEXT NOT NULL, observed_at TEXT NOT NULL, status TEXT NOT NULL DEFAULT "pending" CHECK(status IN ("pending","acknowledged")), PRIMARY KEY(channel,video_id))')
    con.commit();return con
def channel(args):
    body=load(args.response)
    if not isinstance(body,dict):raise ValueError('Expected a saved API response object')
    if type(body.get('code')) is not int or body['code']!=0:raise ValueError('API business error; inspect retained response')
    outer=body.get('data')
    if not isinstance(outer,dict) or outer.get('resourceStatus') not in ('AVAILABLE','PARTIAL'):raise ValueError('Unusable resource state')
    supplier=outer.get('data')
    if not isinstance(supplier,dict) or supplier.get('success') is not True:raise ValueError('Supplier success not established')
    videos=supplier.get('videos')
    if not isinstance(videos,list) or len(videos)>500:raise ValueError('Expected data.data.videos array with at most 500 items')
    rows=[]
    observed=datetime.now(timezone.utc).isoformat()
    if not args.channel.strip():raise ValueError('Provide a verified channel identity')
    for v in videos:
        if not isinstance(v,dict) or not isinstance(v.get('id'),str) or not v['id']:raise ValueError('Missing video ID')
        url=https_url(v.get('url'),['youtube.com','youtu.be'])
        rows.append((args.channel,v['id'],url,v.get('title'),outer['resourceStatus'],observed))
    con=db(args.state)
    try:
        before=con.total_changes
        with con:con.executemany('INSERT OR IGNORE INTO outbox(channel,video_id,source_url,title,resource_status,observed_at) VALUES (?,?,?,?,?,?)',rows)
        added=con.total_changes-before
        pending=[dict(r) for r in con.execute('SELECT * FROM outbox WHERE channel=? AND status="pending" ORDER BY observed_at,video_id',(args.channel,))]
        export(args.output,pending,['channel','video_id','source_url','title','resource_status','observed_at','status'])
        return {'returned':len(videos),'new_queue_identities':added,'pending_exported':len(pending),'scope':'Local pending queue only. No API retrieval or destination write; acknowledge only after delivery is confirmed.'}
    finally:con.close()
def acknowledge(args):
    if not Path(args.state).exists():raise ValueError('State database does not exist')
    ids=list(dict.fromkeys(s.strip() for s in args.ids.split(',') if s.strip()))
    if not ids:raise ValueError('Specify confirmed video IDs')
    con=db(args.state)
    try:
        with con:
            for vid in ids:
                row=con.execute('SELECT status FROM outbox WHERE channel=? AND video_id=?',(args.channel,vid)).fetchone()
                if row is None:raise ValueError('Unknown channel/video identity; acknowledgment rolled back')
                con.execute('UPDATE outbox SET status="acknowledged" WHERE channel=? AND video_id=?',(args.channel,vid))
        return {'confirmed_identities':len(ids),'scope':'User-supplied delivery confirmation; this command does not inspect Sheets or any other destination.'}
    finally:con.close()
def positive_int(value):
    n=int(value)
    if n<1:raise argparse.ArgumentTypeError('Must be positive')
    return n
def budget(args):
    try:price=Decimal(args.assumed_credits_per_call);cap=Decimal(args.cap)
    except InvalidOperation:raise ValueError('Invalid decimal credit value')
    if not price.is_finite() or not cap.is_finite() or price<0 or cap<0:raise ValueError('Credit assumptions must be finite and nonnegative')
    total=price*args.calls_per_page*args.pages*args.runs
    result={'estimated_credits':str(total),'cap':str(cap),'within_cap':total<=cap,'reserved_credits':False,'scope':'Explicit local estimate only; actual price, access and other platform/AI charges are not checked.'}
    print(json.dumps(result,indent=2));return None if total<=cap else 2
def main(argv=None):
    parser=argparse.ArgumentParser(description=__doc__);sub=parser.add_subparsers(dest='command',required=True)
    p=sub.add_parser('feedback');p.add_argument('--input',required=True);p.add_argument('--output',required=True);p.set_defaults(func=feedback)
    p=sub.add_parser('channel');p.add_argument('--response',required=True);p.add_argument('--channel',required=True);p.add_argument('--state',required=True);p.add_argument('--output',required=True);p.set_defaults(func=channel)
    p=sub.add_parser('ack');p.add_argument('--state',required=True);p.add_argument('--channel',required=True);p.add_argument('--ids',required=True);p.set_defaults(func=acknowledge)
    p=sub.add_parser('budget');p.add_argument('--assumed-credits-per-call',required=True);p.add_argument('--calls-per-page',type=positive_int,default=1);p.add_argument('--pages',type=positive_int,default=1);p.add_argument('--runs',type=positive_int,default=1);p.add_argument('--cap',required=True);p.set_defaults(func=budget)
    args=parser.parse_args(argv)
    try:
        result=args.func(args)
        if isinstance(result,int):return result
        if result is not None:print(json.dumps(result,indent=2))
        return 0
    except (ValueError,TypeError,KeyError,OSError,sqlite3.Error) as e:
        print('Stopped: '+str(e),file=sys.stderr);return 2
if __name__=='__main__':raise SystemExit(main())
