# Writing Collections

Edit `collections.json`, then run from the website folder:

```sh
python3 tools/build_writing.py
python3 tools/build_writing.py --check
```

The generated `business-architecture/index.html` and
`life-architecture/index.html` contain the full content, metadata, navigation
fallback and footer. They work without a server or JavaScript and can be uploaded
directly to GitHub Pages. No build service or packages are required.

## Adding an Essay

Add an article to the appropriate collection in `collections.json` and rebuild.
Use a unique `id`, verified date, original LinkedIn URL and a short editorial
summary. Series and original titles are kept separately from display titles.
Counts and numbering update automatically. Images are optional; omit the image
fields when no original image is available. Do not substitute stock photos.

For a future Author's Edition, create the article page first, then set
`websiteUrl` to its site-relative path. This adds an internal reading link while
retaining the original LinkedIn discussion link. Leave it null until that page
exists. Use `featured: true` only for entries with complete external-publication
metadata.

## Sources

All four photos are the original cover images retrieved from the corresponding
LinkedIn articles on 21 September 2026. Article URLs and dates are in
`collections.json`. The Life's Journey article's text and publication date
(14 December 2024) were verified directly before using its approved summary.
BA Digest issue, title and page numbers follow the author's supplied brief.

Internal links include `index.html` so opening pages directly from disk works.
The canonical collection addresses are `/writing/business-architecture/` and
`/writing/life-architecture/`, which GitHub Pages serves from those index files.

## Publishing This Update

Upload the entire `writing` folder, `tools/build_writing.py`, and
`assets/writing`, along with the updated `assets/css/styles.css`,
`assets/site.js`, `assets/common-navigation.js`, `assets/common-footer.js`,
`common-navigation.json`, `common-footer.json`, `content.json`, `sitemap.xml`,
and the four top-level HTML pages. Keep the folder structure intact.

Changes to shared navigation or footer data require rebuilding these two pages
to keep their no-JavaScript fallbacks in sync. Existing pages retain their own
HTML fallbacks.
