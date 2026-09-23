(function () {
  var contentPath = "content.json?v=20260923-life-principles";

  function getValue(source, path) {
    return path.split(".").reduce(function (value, key) {
      return value && Object.prototype.hasOwnProperty.call(value, key)
        ? value[key]
        : undefined;
    }, source);
  }

  function bindText(content) {
    document.querySelectorAll("[data-content]").forEach(function (node) {
      var value = getValue(content, node.getAttribute("data-content"));
      if (typeof value === "string") {
        node.textContent = value;
      }
    });
  }

  function bindLinks(content) {
    document.querySelectorAll("[data-link]").forEach(function (node) {
      var value = getValue(content, node.getAttribute("data-link"));
      if (typeof value === "string") {
        node.setAttribute("href", value);
      }
    });
  }

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

  function bindRichText(content) {
    document.querySelectorAll("[data-rich-content]").forEach(function (node) {
      var value = getValue(content, node.getAttribute("data-rich-content"));
      if (typeof value !== "string") {
        return;
      }

      node.replaceChildren();
      value.split(/\n\s*\n/).forEach(function (paragraph) {
        var trimmed = paragraph.trim();
        if (trimmed) {
          node.appendChild(createElement("p", "", trimmed));
        }
      });
    });
  }


  function renderLedger(items) {
    var target = document.querySelector('[data-list="hero.ledger"]');
    if (!target || !Array.isArray(items)) {
      return;
    }

    target.replaceChildren();
    items.forEach(function (item) {
      var card = createElement("div", "ledger-item");
      card.appendChild(createElement("span", "ledger-label", item.label));
      card.appendChild(createElement("strong", "", item.value));
      target.appendChild(card);
    });
  }

  function renderParagraphs(path, items) {
    var target = document.querySelector('[data-list="' + path + '"]');
    if (!target || !Array.isArray(items)) {
      return;
    }

    target.replaceChildren();
    items.forEach(function (item) {
      target.appendChild(createElement("p", "", item));
    });
  }

  function renderFactStrip(items) {
    var target = document.querySelector('[data-list="aboutAylwin.bio.facts"]');
    if (!target || !Array.isArray(items)) {
      return;
    }

    target.replaceChildren();
    items.forEach(function (item) {
      target.appendChild(createElement("span", "", item));
    });
  }

  function renderWriting(items) {
    var target = document.querySelector('[data-list="writing.cards"]');
    if (!target || !Array.isArray(items)) {
      return;
    }

    target.replaceChildren();
    items.forEach(function (item) {
      var article = createElement("article", "writing-card");
      if (item.anchorId) {
        article.id = item.anchorId;
      }
      var header = createElement("div", "writing-card-header");
      header.appendChild(createElement("span", "eyebrow", item.category));
      article.appendChild(header);
      article.appendChild(createElement("h3", "", item.title));
      article.appendChild(createElement("p", "", item.summary));

      if (item.url) {
        var link = createElement("a", "button secondary", item.cta || "Read");
        link.href = item.url;
        if (item.ctaLabel) {
          link.setAttribute("aria-label", item.ctaLabel);
        }
        article.appendChild(link);
      } else {
        var status = createElement("span", "button secondary disabled", item.cta || "Upcoming");
        status.setAttribute("aria-disabled", "true");
        article.appendChild(status);
      }
      target.appendChild(article);
    });
  }

  function renderFrameworks(items) {
    var target = document.querySelector('[data-list="frameworks.cards"]');
    if (!target || !Array.isArray(items)) return;
    target.replaceChildren();
    items.forEach(function (item) {
      var article = createElement("article", "life-perspective");
      var symbol = createElement("img", "");
      symbol.src = item.symbol;
      symbol.alt = "";
      symbol.width = 80;
      symbol.height = 80;
      symbol.setAttribute("aria-hidden", "true");
      article.appendChild(symbol);
      article.appendChild(createElement("h3", "", item.title));
      article.appendChild(createElement("p", "perspective-question", item.question));
      item.paragraphs.forEach(function (paragraph) {
        article.appendChild(createElement("p", "perspective-copy", paragraph));
      });
      if (item.href) {
        var link = createElement("a", "perspective-link", item.cta);
        link.href = item.href;
        article.appendChild(link);
      } else {
        article.appendChild(createElement("span", "perspective-coming", item.note));
      }
      target.appendChild(article);
    });
  }

  function renderPrinciples(items) {
    var target = document.querySelector('[data-list="aboutAylwin.principles.items"]');
    if (!target || !Array.isArray(items)) {
      return;
    }

    target.replaceChildren();
    items.forEach(function (item, index) {
      var article = createElement("article", "principle");
      var art = createElement("div", "principle-heading-art");
      art.appendChild(createElement("span", "principle-number", String(index + 1).padStart(2, "0")));
      if (item.symbol) {
        var symbol = createElement("img", "principle-symbol");
        symbol.src = item.symbol;
        symbol.alt = "";
        symbol.width = 64;
        symbol.height = 64;
        symbol.setAttribute("aria-hidden", "true");
        art.appendChild(symbol);
      }
      article.appendChild(art);
      article.appendChild(createElement("h3", "", item.title));
      article.appendChild(createElement("p", "", item.description));
      target.appendChild(article);
    });
  }


  function render(content) {
    if (content.meta) {
      document.title = content.meta.title || document.title;
      var description = document.querySelector('meta[name="description"]');
      if (description && content.meta.description) {
        description.setAttribute("content", content.meta.description);
      }
    }

    bindText(content);
    bindRichText(content);
    bindLinks(content);
    renderLedger(content.hero && content.hero.ledger);
    renderFrameworks(content.frameworks && content.frameworks.cards);
    renderWriting(content.writing && content.writing.cards);
    renderParagraphs("aboutAylwin.bio.paragraphs", content.aboutAylwin && content.aboutAylwin.bio && content.aboutAylwin.bio.paragraphs);
    renderFactStrip(content.aboutAylwin && content.aboutAylwin.bio && content.aboutAylwin.bio.facts);
    renderParagraphs("aboutAylwin.pointOfView.paragraphs", content.aboutAylwin && content.aboutAylwin.pointOfView && content.aboutAylwin.pointOfView.paragraphs);
    renderPrinciples(content.aboutAylwin && content.aboutAylwin.principles && content.aboutAylwin.principles.items);
  }

  fetch(contentPath)
    .then(function (response) {
      if (!response.ok) {
        throw new Error("Content request failed");
      }
      return response.json();
    })
    .then(render)
    .catch(function () {
      document.documentElement.setAttribute("data-content-state", "fallback");
    });
})();
