(function () {
  "use strict";
  var orbit = document.querySelector(".principles-orbit");
  var nodes = Array.from(document.querySelectorAll(".principle-node"));
  var panels = Array.from(document.querySelectorAll(".principle-description"));
  var mobile = window.matchMedia("(max-width: 700px)");
  var active = null;
  var closeTimer;

  function positionPanel() {
    if (!active || mobile.matches) return;
    var panel = panels[nodes.indexOf(active)];
    var rect = active.getBoundingClientRect();
    var centre = document.querySelector(".principles-centre").getBoundingClientRect();
    var width = panel.offsetWidth, height = panel.offsetHeight, gap = 14;
    var header = document.querySelector(".site-header").getBoundingClientRect();
    var topLimit = Math.max(12, header.bottom + 12);
    panel.style.visibility = rect.bottom <= topLimit || rect.top >= innerHeight ? "hidden" : "visible";
    var candidates = [
      { x: rect.right + gap, y: rect.top + (rect.height - height) / 2 },
      { x: rect.left - width - gap, y: rect.top + (rect.height - height) / 2 },
      { x: rect.left + (rect.width - width) / 2, y: rect.top - height - gap },
      { x: rect.left + (rect.width - width) / 2, y: rect.bottom + gap },
      { x: rect.left + (rect.width - width) / 2, y: centre.top - height - gap },
      { x: rect.left + (rect.width - width) / 2, y: centre.bottom + gap }
    ];
    function overlap(a, b) {
      return Math.max(0, Math.min(a.x + width, b.right) - Math.max(a.x, b.left)) *
        Math.max(0, Math.min(a.y + height, b.bottom) - Math.max(a.y, b.top));
    }
    // Prefer free space beside the node, protecting the central message first.
    candidates.forEach(function (candidate) {
      candidate.x = Math.max(12, Math.min(innerWidth - width - 12, candidate.x));
      candidate.y = Math.max(topLimit, Math.min(innerHeight - height - 12, candidate.y));
      candidate.score = overlap(candidate, centre) * 100;
      nodes.forEach(function (node) {
        candidate.score += overlap(candidate, node.getBoundingClientRect());
      });
    });
    candidates.sort(function (a, b) { return a.score - b.score; });
    panel.style.left = candidates[0].x + "px";
    panel.style.top = candidates[0].y + "px";
  }

  function show(node) {
    clearTimeout(closeTimer);
    active = node;
    nodes.forEach(function (item, index) {
      var selected = item === node;
      item.setAttribute("aria-expanded", String(selected));
      panels[index].hidden = !selected;
      panels[index].style.visibility = "";
    });
    positionPanel();
  }

  function scheduleClose() {
    if (!mobile.matches && document.activeElement !== active) {
      closeTimer = setTimeout(function () { show(null); }, 200);
    }
  }

  nodes.forEach(function (node, index) {
    node.addEventListener("pointerenter", function (event) {
      if (!mobile.matches && event.pointerType === "mouse") show(node);
    });
    node.addEventListener("pointerleave", scheduleClose);
    node.addEventListener("focus", function () { if (!mobile.matches) show(node); });
    node.addEventListener("click", function () {
      show(mobile.matches && active === node ? null : node);
    });
    panels[index].addEventListener("pointerenter", function () { clearTimeout(closeTimer); });
    panels[index].addEventListener("pointerleave", scheduleClose);
  });
  orbit.addEventListener("focusout", function (event) {
    if (!mobile.matches && !orbit.contains(event.relatedTarget)) show(null);
  });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") show(null);
  });
  document.addEventListener("pointerdown", function (event) {
    if (!orbit.contains(event.target)) show(null);
  });
  window.addEventListener("resize", positionPanel);
  window.addEventListener("scroll", positionPanel, { passive: true });
  mobile.addEventListener("change", function () { show(nodes[0]); });
  show(nodes[0]);
})();
