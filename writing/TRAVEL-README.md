# Travel collection

Edit `writing/travel-essays.json`, then run `python3 tools/build_travel.py`
from the site directory. This updates only the cards in `travel-as-a-lens.html`.
The generated HTML works directly from disk and on GitHub Pages without Python
or JavaScript running on the server.

Checks: `python3 tools/build_travel.py --check` and `python3 tools/test_travel.py`.

The eight decorative WebP assets in `assets/travel/` are extracted from the
approved ink-and-watercolour preview, with the light paper matte removed.
CSS reserves their dimensions and blends them into the card backgrounds.
Collection styling is isolated in `assets/css/travel-collection.css`.

All cards reserve identical section heights, a two-line location, a reading-time
field (blank when unknown), and a CTA slot. Unpublished CTAs are muted visual
placeholders, not links or keyboard targets. Summaries and Lens statements have
a five-line maximum; current copy fits in full at the tested widths, including
320px. Introductions are concise; Lens statements remain unchanged.

## Alignment follow-up upload

For the September 22 alignment follow-up, only `travel-as-a-lens.html` and
`assets/css/travel-collection.css` are required to update the displayed site.
No artwork files changed. Also commit the updated data, builder, tests and this
README if keeping the editable source on GitHub.

## GitHub upload for this update

Required for display:
- `travel-as-a-lens.html`
- `assets/css/travel-collection.css`
- All eight `.webp` files in `assets/travel/`

Recommended source files for future editing:
- `writing/travel-essays.json`
- `tools/build_travel.py`
- `tools/test_travel.py`
- `writing/TRAVEL-README.md`

No shared stylesheet, navigation, footer, homepage, or individual essay was
modified. Keep the existing `assets/css/styles.css`; the new collection CSS
loads after it. Upload paths must preserve the folders shown above.
