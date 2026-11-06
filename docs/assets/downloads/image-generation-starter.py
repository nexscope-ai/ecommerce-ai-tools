#!/usr/bin/env python3
"""Python 3.10+: one Nano Banana 2 submit, task query or explicit image download.

One submit is chargeable. Query and download do not submit another generation.
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
ROUTE = '/image/banana2ImageGeneration'
STATES = {'PENDING', 'RUNNING', 'SUCCEEDED', 'FAILED', 'TIMEOUT'}


class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def validate(payload):
    fields = {'imageUrls', 'prompt', 'outputNum', 'resolution', 'aspectRatio'}
    if not isinstance(payload, dict) or set(payload) != fields:
        raise ValueError('Use the five fields in the product-image starter template')
    images = payload['imageUrls']
    if not isinstance(images, list) or len(images) != 1 or not isinstance(images[0], str):
        raise ValueError('Starter requires exactly one permitted reference URL')
    url = urlsplit(images[0])
    if url.scheme != 'https' or not url.hostname or url.username or url.password or url.hostname == 'example.com' or url.fragment:
        raise ValueError('Replace the placeholder with your permitted HTTPS reference URL')
    if not isinstance(payload['prompt'], str) or not 1 <= len(payload['prompt'].strip()) <= 5000:
        raise ValueError('Prompt must contain 1..5000 characters')
    if type(payload['outputNum']) is not int or payload['outputNum'] != 1:
        raise ValueError('Starter generates exactly one output')
    if payload['resolution'] != '1K' or payload['aspectRatio'] != '1:1':
        raise ValueError('Starter uses 1K and 1:1; inspect the reference before adapting')


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


def download(resource_url, output):
    url = urlsplit(resource_url)
    if url.scheme != 'https' or url.hostname not in {'store.nexscope.ai', 'www.nexscope.ai'} or url.username or url.password or url.port not in (None, 443) or url.fragment or url.path in ('', '/'):
        raise ValueError('Use the actual returned HTTPS image URL on an allowed Nexscope media host')
    output.mkdir(parents=True, exist_ok=False)
    request = Request(resource_url, headers={'Accept': 'image/png,image/jpeg,image/webp'})
    try:
        response = build_opener(NoRedirect()).open(request, timeout=60)
    except HTTPError:
        raise ValueError('Media request failed; no redirect or generation retry was attempted') from None
    with response:
        media_type = response.headers.get('Content-Type', '').split(';')[0].strip().lower()
        suffix = {'image/png': '.png', 'image/jpeg': '.jpg', 'image/webp': '.webp'}.get(media_type)
        if suffix is None:
            raise ValueError('Unexpected media type; inspect the returned resource before downloading')
        temporary = output / 'image.part'
        size = 0
        with temporary.open('xb') as file:
            while True:
                block = response.read(65536)
                if not block:
                    break
                size += len(block)
                if size > 32 * 1024 * 1024:
                    raise ValueError('Image exceeds the starter size ceiling; partial file is not a completed image')
                file.write(block)
        if size == 0:
            raise ValueError('Empty media response; inspect the resource')
        destination = output / ('image' + suffix)
        temporary.rename(destination)
    print(json.dumps({'file': str(destination), 'bytes': size, 'next': 'review_against_reference'}))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('action', choices=['submit', 'query', 'download'])
    parser.add_argument('input', help='Request JSON path, task ID, or returned Nexscope image URL')
    parser.add_argument('--output', required=True)
    args = parser.parse_args()
    if args.action == 'download':
        download(args.input, Path(args.output))
        return
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
