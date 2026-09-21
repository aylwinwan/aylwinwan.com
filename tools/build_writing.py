"""Generate complete, locally previewable collection pages using only the standard library."""

import argparse
import json
from datetime import date
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
VERSION = "20260921-writing"


def text(value):
    return escape(str(value), quote=True)


def site_link(path):
    return "../../" + path


def external_link(url, label, primary=False):
    style = "button" if primary else "collection-link"
    return (f'<a class="{style}" href="{text(url)}" target="_blank" rel="noopener noreferrer">'
            f'{text(label)} <span aria-hidden="true">&#8599;</span>'
            '<span class="collection-sr-only"> (opens in a new tab)</span></a>')


def date_label(article):
    if not article.get("date"):
        return ""
    published = date.fromisoformat(article["date"])
    return f'<time datetime="{published.isoformat()}">{published.day} {published:%B %Y}</time>'


def photo(article, eager=False):
    if not article.get("image"):
        return ""
    loading = 'fetchpriority="high"' if eager else 'loading="lazy"'
    return (f'<figure class="collection-photo"><img src="{site_link(text(article["image"]))}" '
            f'alt="{text(article["imageAlt"])}" width="{article["imageWidth"]}" '
            f'height="{article["imageHeight"]}" {loading} decoding="async" /></figure>')


def article_links(article):
    original = external_link(article["linkedinUrl"], "Read original on LinkedIn")
    if not article.get("websiteUrl"):
        return original
    return (f'<a class="collection-link" href="{site_link(text(article["websiteUrl"]))}">'
            f'Read the Author&#8217;s Edition <span aria-hidden="true">&#8594;</span></a> {original}')


def featured(article):
    return f'''<section class="collection-feature" aria-labelledby="{article['id']}">
      <article>
        <div class="collection-feature-layout">
          {photo(article, eager=True)}
          <div class="collection-feature-copy">
            <p class="kicker publication-kicker">Featured &#183; Published in {text(article['externalPublication'])}</p>
            <p class="collection-series">{text(article['series'])}</p>
            <h2 id="{article['id']}">{text(article['title'])}</h2>
            <p class="collection-excerpt">{text(article['excerpt'])}</p>
            <p class="collection-publication-note">{text(article['publicationNote'])}</p>
            <p class="collection-author">{text(article['author'])}</p>
            <div class="publication-record">
              <h3>Original essay</h3>
              <p class="publication-meta">LinkedIn &#183; {date_label(article)}</p>
              {external_link(article['linkedinUrl'], 'View original on LinkedIn')}
            </div>
            <div class="publication-record publication-record-magazine">
              <h3>Edited magazine version</h3>
              <p class="publication-meta">{text(article['externalPublication'])} &#183; {text(article['externalPublicationIssue'])} &#183; pp. {text(article['externalPublicationPages'])}</p>
              <p class="publication-title">{text(article['externalPublicationTitle'])}</p>
              {external_link(article['externalPublicationUrl'], 'Read in BA Digest', primary=True)}
            </div>
          </div>
        </div>
      </article>
    </section>'''


def essay_row(article, number):
    return f'''<article class="collection-entry" aria-labelledby="{article['id']}">
      <div class="collection-entry-index"><span aria-hidden="true">{number:02d}</span>{date_label(article)}</div>
      <div class="collection-entry-copy">
        <p class="collection-series">{text(article['series'])}</p>
        <h3 id="{article['id']}">{text(article['title'])}</h3>
        <p class="collection-author">{text(article['author'])}</p>
        <p class="collection-excerpt">{text(article['excerpt'])}</p>
        <div class="collection-actions">{article_links(article)}</div>
      </div>
      {photo(article)}
    </article>'''


def navigation(slug):
    content = json.loads((ROOT / "common-navigation.json").read_text())
    items = {item["id"]: item for item in content["items"]}
    links = []
    for item_id in content["desktopOrder"]:
        item = items[item_id]
        if item.get("children"):
            children = "".join(
                f'<a href="{site_link(child["href"])}"' +
                (' aria-current="page"' if child["id"] == slug else '') +
                f'>{text(child["label"])}</a>' for child in item["children"])
            active = ' aria-current="page"' if item_id == "writing" else ""
            links.append(f'<details class="nav-dropdown"><summary{active}>{text(item["label"])}</summary>'
                         f'<div class="dropdown-menu">{children}</div></details>')
        else:
            links.append(f'<a href="{site_link(item["href"])}">{text(item["label"])}</a>')
    return "".join(links)


def footer():
    content = json.loads((ROOT / "common-footer.json").read_text())
    items = []
    for item in content["sitemap"]:
        children = ""
        if item.get("children"):
            children = '<ul class="global-footer-links">' + "".join(
                f'<li><a href="{site_link(child["href"])}">{text(child["label"])}</a></li>'
                for child in item["children"]) + '</ul>'
        items.append(f'<li><a href="{site_link(item["href"])}">{text(item["label"])}</a>{children}</li>')
    return ('<footer class="global-footer" data-common-footer>'
            '<nav class="global-footer-nav" aria-label="Footer sitemap"><ul class="global-footer-grid">' +
            "".join(items) + '</ul></nav><div class="global-footer-signature"><span>' +
            text(content["signature"]["name"]) + '</span><span class="global-footer-note">' +
            text(content["signature"]["tagline"]) + '</span></div></footer>')


def render(collection):
    slug = collection["slug"]
    articles = collection["articles"]
    canonical = f"https://aylwinwan.com/writing/{slug}/"
    count = f'{len(articles)} essays'
    adaptations = sum(bool(a.get("externalPublication")) for a in articles)
    if adaptations:
        count += f' &#183; {adaptations} magazine adaptation' + ('s' if adaptations != 1 else '')
    features = "".join(featured(a) for a in articles if a.get("featured"))
    rows = "".join(essay_row(a, i) for i, a in enumerate(articles, 1) if not a.get("featured"))
    og_image = next((a for a in articles if a.get("image")), None)
    social_image = ""
    if og_image:
        social_image = (f'<meta property="og:image" content="https://aylwinwan.com/{text(og_image["image"])}" />\n'
                        f'    <meta property="og:image:alt" content="{text(og_image["imageAlt"])}" />')
    return f'''<!doctype html>
<!-- Generated by tools/build_writing.py from writing/collections.json. -->
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{text(collection['pageTitle'])}</title>
    <meta name="description" content="{text(collection['description'])}" />
    <link rel="canonical" href="{canonical}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Aylwin Wan" />
    <meta property="og:title" content="{text(collection['pageTitle'])}" />
    <meta property="og:description" content="{text(collection['description'])}" />
    <meta property="og:url" content="{canonical}" />
    {social_image}
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; img-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'" />
    <link rel="icon" href="../../assets/favicon.svg" type="image/svg+xml" />
    <link rel="stylesheet" href="../../assets/css/styles.css?v={VERSION}" />
  </head>
  <body class="page-collection page-{slug}">
    <a class="collection-skip" href="#main">Skip to content</a>
    <header class="site-header">
      <nav class="nav" aria-label="Main navigation" data-current-nav="writing" data-current-subnav="{slug}">
        <a class="brand" href="../../index.html#top" aria-label="Aylwin Wan home">
          <span class="brand-mark" aria-hidden="true"><img src="../../assets/aw-logo.png" alt="" width="942" height="942" /></span>
          <span>Aylwin Wan</span>
        </a>
        <div class="nav-links site-nav-desktop" data-nav-desktop>{navigation(slug)}</div>
        <div class="site-nav-mobile" data-nav-mobile></div>
        <noscript><a href="../../index.html#writing">All writing</a></noscript>
      </nav>
    </header>
    <main id="main">
      <div class="collection-shell">
        <nav class="collection-breadcrumb" aria-label="Breadcrumb"><a href="../../index.html#writing">Writing</a><span aria-hidden="true">/</span><span aria-current="page">{text(collection['name'])}</span></nav>
        <section class="collection-intro" aria-labelledby="collection-title">
          <p class="kicker">{text(collection['name'])}</p>
          <h1 id="collection-title">{text(collection['heading'])}</h1>
          <p class="collection-intro-copy">{text(collection['intro'])}</p>
          <p class="collection-count">{count}</p>
        </section>
        {features}
        <section class="collection-selected" aria-labelledby="selected-title">
          <h2 class="collection-section-label" id="selected-title">Selected Writing</h2>
          {rows}
        </section>
        <div class="collection-closing"><p>{text(collection['closing'])}</p><a class="collection-link" href="../../index.html#writing">&#8592; All writing</a></div>
      </div>
    </main>
    <div class="collection-footer"><div class="collection-shell">{footer()}</div></div>
    <script src="../../assets/common-navigation.js?v={VERSION}" defer></script>
    <script src="../../assets/common-footer.js?v={VERSION}" defer></script>
  </body>
</html>
'''


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="Check that generated pages are up to date.")
    args = parser.parse_args()
    content = json.loads((ROOT / "writing/collections.json").read_text())
    for collection in content["collections"]:
        output = ROOT / "writing" / collection["slug"] / "index.html"
        html = render(collection)
        if args.check:
            if not output.exists() or output.read_text() != html:
                raise SystemExit(f"Out of date: {output.relative_to(ROOT)}")
        else:
            output.parent.mkdir(parents=True, exist_ok=True)
            output.write_text(html, encoding="utf-8")
        print(f"{'Checked' if args.check else 'Built'} {output.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
