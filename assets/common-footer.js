(function () {
  // Shared footer renderer. Future static pages only need the stylesheet,
  // this script, and <footer class="global-footer" data-common-footer></footer>.
  var footerPath = "common-footer.json";

  function createElement(tag, className, text) {
    var node = document.createElement(tag);
    if (className) {
      node.className = className;
    }
    if (typeof text === "string") {
      node.textContent = text;
    }
    return node;
  }

  function renderLinks(items) {
    var list = createElement("ul", "global-footer-grid");
    items.forEach(function (item) {
      var listItem = createElement("li");
      var link = createElement("a", "", item.label);
      link.href = item.href;
      listItem.appendChild(link);

      if (Array.isArray(item.children) && item.children.length) {
        var children = createElement("ul", "global-footer-links");
        item.children.forEach(function (child) {
          var childItem = createElement("li");
          var childLink = createElement("a", "", child.label);
          childLink.href = child.href;
          childItem.appendChild(childLink);
          children.appendChild(childItem);
        });
        listItem.appendChild(children);
      }

      list.appendChild(listItem);
    });
    return list;
  }

  function renderFooter(content) {
    document.querySelectorAll("[data-common-footer]").forEach(function (target) {
      target.replaceChildren();

      var nav = createElement("nav", "global-footer-nav");
      nav.setAttribute("aria-label", "Footer sitemap");
      nav.appendChild(renderLinks(content.sitemap || []));
      target.appendChild(nav);

      var signature = createElement("div", "global-footer-signature");
      signature.appendChild(createElement("span", "", content.signature && content.signature.name));
      signature.appendChild(createElement("span", "global-footer-note", content.signature && content.signature.tagline));
      target.appendChild(signature);
    });
  }

  fetch(footerPath)
    .then(function (response) {
      if (!response.ok) {
        throw new Error("Footer request failed");
      }
      return response.json();
    })
    .then(renderFooter)
    .catch(function () {
      document.documentElement.setAttribute("data-footer-state", "fallback");
    });
})();
