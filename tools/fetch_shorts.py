"""Refresh data/shorts.json from youtube.com/@LucyMakesFood/shorts.

    python tools/fetch_shorts.py

Titles and view counts come from the channel page; each short keeps the
series ('world', 'scratch', 'life') it was given before, and anything new
lands in 'life' until someone files it properly.
"""
import json
import re
import urllib.request
from datetime import date
from pathlib import Path

DATA = Path(__file__).resolve().parent.parent / "data" / "shorts.json"
URL = "https://www.youtube.com/@LucyMakesFood/shorts"


def views(text):
    text = text.replace(" views", "").replace(",", "")
    scale = {"K": 1e3, "M": 1e6}
    return int(float(text[:-1]) * scale[text[-1]]) if text[-1] in scale else int(text)


def walk(node, out):
    if isinstance(node, dict):
        if "shortsLockupViewModel" in node:
            v = node["shortsLockupViewModel"]
            meta = v.get("overlayMetadata", {})
            out.append({
                "id": v["onTap"]["innertubeCommand"]["reelWatchEndpoint"]["videoId"],
                "title": meta["primaryText"]["content"],
                "views": views(meta["secondaryText"]["content"]),
            })
            return
        for child in node.values():
            walk(child, out)
    elif isinstance(node, list):
        for child in node:
            walk(child, out)


req = urllib.request.Request(URL, headers={"User-Agent": "Mozilla/5.0", "Accept-Language": "en-US"})
html = urllib.request.urlopen(req, timeout=60).read().decode("utf8")
data = json.loads(re.search(r"var ytInitialData = (\{.*?\});</script>", html, re.S).group(1))
fresh = []
walk(data, fresh)

doc = json.loads(DATA.read_text(encoding="utf8"))
cats = {s["id"]: s["cat"] for s in doc["shorts"]}
doc["shorts"] = [{**s, "cat": cats.get(s["id"], "life")} for s in fresh]
doc["updated"] = date.today().isoformat()
DATA.write_text(json.dumps(doc, ensure_ascii=False, indent=1), encoding="utf8")
print(len(fresh), "shorts written to", DATA)
