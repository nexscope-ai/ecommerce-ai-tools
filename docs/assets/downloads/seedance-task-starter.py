#!/usr/bin/env python3
"""Python 3.10+: one Seedance 2.0 submit or task query. No retries or auto-download.

One submit is chargeable. Query does not submit another generation.
Use a new output directory for every invocation. Raw responses are saved first.
"""
import argparse
import json
import os
from pathlib import Path
import re
from urllib.error import HTTPError
from urllib.parse import urlsplit, quote
from urllib.request import Request, HTTPRedirectHandler, build_opener

ORIGIN = 'https://api.nexscope.ai'
ROUTE = '/video/seedance20VideoGeneration'
STATES = {'PENDING', 'RUNNING', 'SUCCEEDED', 'FAILED', 'TIMEOUT'}


class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def validate(payload):
    fields = {'imageUrl', 'prompt', 'resolution', 'videoTime', 'aspectRatio'}
    if not isinstance(payload, dict) or set(payload) != fields:
        raise ValueError('Use the five fields in the starter template')
    image = payload['imageUrl']
    if not isinstance(image, str):
        raise ValueError('imageUrl must be a public HTTPS URL you may send')
    url = urlsplit(image)
    if url.scheme != 'https' or not url.hostname or url.username or url.password or url.hostname == 'example.com' or url.fragment:
        raise ValueError('Replace the placeholder with your permitted HTTPS reference URL')
    if not isinstance(payload['prompt'], str) or not 1 <= len(payload['prompt'].strip()) <= 2000:
        raise ValueError('Prompt must contain 1..2000 characters')
    if type(payload['videoTime']) is not int or not 4 <= payload['videoTime'] <= 15:
        raise ValueError('Duration must be an integer from 4 through 15')
    if not isinstance(payload['resolution'], str) or payload['resolution'] not in {'480p', '720p', '1080p'}:
        raise ValueError('Unsupported resolution')
    if not isinstance(payload['aspectRatio'], str) or payload['aspectRatio'] not in {'16:9', '4:3', '1:1', '3:4', '9:16', '21:9', 'adaptive'}:
        raise ValueError('Unsupported aspect ratio')


def task_path(task_id):
    if not re.fullmatch(r'[A-Za-z0-9_-]{8,128}', task_id):
        raise ValueError('Copy the task ID returned by the API')
    return ROUTE + '/tasks/' + quote(task_id, safe='')


def inspect(raw, expected_task=None):
    body = json.loads(raw)
    if not isinstance(body, dict) or type(body.get('code')) is not int or body['code'] != 0:
        raise ValueError('Nonzero or invalid platform business code; inspect response.json')
    data = body.get('data')
    if not isinstance(data, dict) or not isinstance(data.get('status'), str) or data['status'] not in STATES:
        raise ValueError('Unknown task envelope or status; inspect response.json')
    task_id = data.get('taskId')
    if not isinstance(task_id, str):
        raise ValueError('Missing task ID')
    task_path(task_id)
    if expected_task is not None and task_id != expected_task:
        raise ValueError('Returned task ID does not match the requested task')
    if data['status'] == 'SUCCEEDED' and not isinstance(data.get('result'), dict):
        raise ValueError('Completed result is missing or unexpected; inspect response.json')
    return {'taskId': task_id, 'status': data['status'],
            'next': 'review_result' if data['status'] == 'SUCCEEDED' else 'inspect_task_state'}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('action', choices=['submit', 'query'])
    parser.add_argument('input', help='Request JSON path for submit, or task ID for query')
    parser.add_argument('--output', required=True)
    args = parser.parse_args()
    payload = None
    if args.action == 'submit':
        payload = json.loads(Path(args.input).read_text(encoding='utf-8-sig'))
        validate(payload)
        route = ROUTE
    else:
        route = task_path(args.input)
    key = os.environ.get('NEXSCOPE_API_KEY', '').strip()
    if not key or '\n' in key or '\r' in key:
        raise ValueError('Set NEXSCOPE_API_KEY locally; never put it in the request file')
    output = Path(args.output)
    output.mkdir(parents=True, exist_ok=False)
    request = Request(ORIGIN + route, method='POST' if payload is not None else 'GET',
                      data=json.dumps(payload).encode() if payload is not None else None,
                      headers={'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json'})
    try:
        response = build_opener(NoRedirect()).open(request, timeout=60)
    except HTTPError as error:
        (output / 'response.json').write_bytes(error.read())
        raise ValueError('HTTP request failed; inspect the saved response and usage before retrying') from None
    with response:
        raw = response.read()
    (output / 'response.json').write_bytes(raw)
    summary = inspect(raw, args.input if args.action == 'query' else None)
    (output / 'task.json').write_text(json.dumps(summary, indent=2) + '\n', encoding='utf-8')
    print(json.dumps(summary))


if __name__ == '__main__':
    main()
