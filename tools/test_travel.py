"""Focused collection content and generated-markup checks."""

import json
import unittest
from html.parser import HTMLParser

from build_travel import ROOT, render_card


class Markup(HTMLParser):
    def __init__(self, html):
        super().__init__()
        self.tags = []
        self.feed(html)

    def handle_starttag(self, tag, attrs):
        self.tags.append((tag, dict(attrs)))


class TravelTests(unittest.TestCase):
    def setUp(self):
        self.essays = json.loads((ROOT / "writing/travel-essays.json").read_text())

    def test_registry_order(self):
        self.assertEqual([e["number"] for e in self.essays], [f"{n:02}" for n in range(1, 9)])
        self.assertEqual([e["title"] for e in self.essays], [
            "The Edge", "The World Before Us", "The Colours I Never Knew Existed",
            "Beyond My Starting Point", "Our First Long Journey Together",
            "A Volcano Taught Me Gratitude", "The Windows of a Life", "Design for Options",
        ])
        self.assertEqual(self.essays[0]["principle"], "Design for Curiosity")
        self.assertEqual(self.essays[-1]["principle"], "Design for Options")

    def test_only_published_has_one_link_and_active_cta(self):
        for essay in self.essays:
            html = render_card(essay)
            links = [attrs for tag, attrs in Markup(html).tags if tag == "a"]
            expected = essay["status"] == "published" and bool(essay.get("href"))
            self.assertEqual(len(links), int(expected))
            self.assertEqual('class="essay-card-cta"' in html, expected)
            self.assertEqual('essay-card-cta-unavailable' in html, not expected)
            if expected:
                self.assertEqual(links[0]["href"], "the-edge.html")
                self.assertEqual(links[0]["aria-label"], "Read The Edge")

    def test_optional_metadata(self):
        html = render_card(self.essays[1])
        self.assertIn("<dt>Reading Time</dt><dd></dd>", html)
        self.assertNotIn("essay-published-date", html)
        self.assertNotIn("Theme", html)
        self.assertNotIn("Written", html)
        unpublished = dict(self.essays[1], href="the-edge.html")
        self.assertNotIn("<a ", render_card(unpublished))

    def test_decorative_local_artwork(self):
        for essay in self.essays:
            image = next(attrs for tag, attrs in Markup(render_card(essay)).tags if tag == "img")
            self.assertEqual(image["alt"], "")
            self.assertEqual(image["aria-hidden"], "true")
            self.assertEqual(image["loading"], "lazy")
            self.assertTrue((ROOT / image["src"]).is_file())
            self.assertLess((ROOT / image["src"]).stat().st_size, 30000)


if __name__ == "__main__":
    unittest.main()
