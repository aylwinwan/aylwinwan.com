"""Build only the travel collection cards; keep the surrounding page unchanged."""

import argparse
import json
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
START = '          <div class="essay-grid">'
END = '\n        </div>\n      </section>'
STATUSES = {"published": "Published", "in-progress": "In Progress", "future": "Future Essay"}


def render_card(essay):
    e = lambda key: escape(essay[key], quote=True)
    published = essay["status"] == "published" and bool(essay.get("href"))
    classes = "essay-card essay-card-linkable" if published else "essay-card"
    link = (f'<a class="card-cover-link" href="{e("href")}" '
            f'aria-label="Read {e("title")}"></a>') if published else ""
    badge = f'<span class="status-badge">{STATUSES[essay["status"]]}</span>'
    if published and essay.get("written"):
        badge = (f'<span class="essay-status-group">{badge}'
                 f'<span class="essay-published-date">{e("written")}</span></span>')
    metadata = "".join(
        f'<div><dt>{label}</dt><dd>{e(key) if essay.get(key) else ""}</dd></div>'
        for key, label in (("location", "Location"), ("readingTime", "Reading Time"))
    )
    title = f'<span class="essay-title-link">{e("title")}</span>' if published else e("title")
    cta_class = "essay-card-cta" if published else "essay-card-cta essay-card-cta-unavailable"
    cta = f'<span class="{cta_class}" aria-hidden="true">Read the Essay &#8594;</span>'
    return f'''            <article class="{classes}">
              {link}
              <div class="essay-card-header"><span class="essay-number">{e("number")}</span>{badge}</div>
              <img class="essay-artwork" src="assets/travel/{e("artwork")}.webp" alt="" aria-hidden="true" width="368" height="240" loading="lazy" decoding="async" />
              <h3>{title}</h3>
              <dl class="essay-meta">{metadata}</dl>
              <p>{e("summary")}</p>
              <div class="essay-lens"><span>Lens</span><p>{e("lens")}</p></div>
              <div class="essay-principle"><span>Life Design Principle</span><strong>{e("principle")}</strong></div>
              {cta}
            </article>'''


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    essays = json.loads((ROOT / "writing/travel-essays.json").read_text())
    for essay in essays:
        assert (ROOT / f'assets/travel/{essay["artwork"]}.webp').is_file()
        if essay.get("href"):
            assert (ROOT / essay["href"]).is_file()
    page = ROOT / "travel-as-a-lens.html"
    before = page.read_text()
    start = before.index(START)
    end = before.index(END, start)
    cards = START + "\n" + "\n".join(map(render_card, essays)) + "\n          </div>"
    after = before[:start] + cards + before[end:]
    if args.check:
        if before != after:
            raise SystemExit("Travel collection is out of date")
    else:
        page.write_text(after, encoding="utf-8")
    print(f'{"Checked" if args.check else "Built"} {len(essays)} travel cards')


if __name__ == "__main__":
    main()
