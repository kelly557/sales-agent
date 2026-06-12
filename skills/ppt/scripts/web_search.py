#!/usr/bin/env python3
"""
web_search.py - Call local web search API and print results.

Usage:
    python web_search.py "query1" ["query2" ...]
"""

import argparse
import json
import os
import sys
import tempfile
from constant import POD_TYPE

def search(query: str, api_key: str) -> str:
    """Call web_search API and return formatted text of results."""
    # Web search is temporarily disabled for the doctech local PPT workflow.
    # Restore the remote call below when Skywork backend integration is enabled:
    #
    # from constant import SKYWORK_GATEWAY_URL
    # from skywork_auth import get_skywork_api_key
    # import urllib.request
    #
    # url = f"{SKYWORK_GATEWAY_URL}/web_search"
    # payload = {"query": query, "source_platform": "skyclaw" if POD_TYPE == "skyclaw" else ""}
    # body = json.dumps(payload).encode("utf-8")
    # headers = {"Content-Type": "application/json"}
    # if api_key:
    #     headers["Authorization"] = f"Bearer {api_key}"
    # req = urllib.request.Request(url, data=body, method="POST", headers=headers)
    # with urllib.request.urlopen(req, timeout=30) as resp:
    #     raw = resp.read().decode("utf-8")
    # data = json.loads(raw)
    # results = data.get("search_res", [])
    # return "\n\n".join(
    #     f"[result-{i}] {item.get('url', '')}\n{(item.get('content') or '').strip()}"
    #     for i, item in enumerate(results, 1)
    # )
    platform = "skyclaw" if POD_TYPE == "skyclaw" else "local"
    return f"[search-disabled] query={query}\nsource_platform={platform}\n外部 web_search 暂未接入，请使用项目资料、知识库和规则库生成 reference report。"


def main():
    parser = argparse.ArgumentParser(description="Call local web_search API")
    parser.add_argument("queries", nargs="+", help="One or more search queries (max 3)")
    args = parser.parse_args()

    queries = args.queries[:3]
    out_dir = tempfile.mkdtemp(prefix="web_search_")

    api_key = ""

    for i, q in enumerate(queries, 1):
        print(f"[query] {q} ...", file=sys.stderr, flush=True)
        raw = search(q, api_key)
        out_path = os.path.join(out_dir, f"{q}_result.txt")
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(f"query: {q}\n\n{raw}")
            print(f'Already saved search result for query[{q}], \nout_path: {out_path}', flush=True)


if __name__ == "__main__":
    main()
