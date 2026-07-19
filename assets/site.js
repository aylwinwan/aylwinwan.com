(function () {
  var contentPath = "content.json";

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

  function renderNavigation(items) {
    var target = document.querySelector('[data-list="navigation"]');
    if (!target || !Array.isArray(items)) {
      return;
    }

    target.replaceChildren();
    items.forEach(function (item) {
      var link = createElement("a", "", item.label);
      link.href = item.href;
      if (item.active) {
        link.setAttribute("aria-current", "page");
      }
      target.appendChild(link);
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
      article.appendChild(createElement("span", "eyebrow", item.category));
      article.appendChild(createElement("h3", "", item.title));
      article.appendChild(createElement("p", "", item.summary));

      if (item.url) {
        var link = createElement("a", "button secondary", item.cta || "Read");
        link.href = item.url;
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
    if (!target || !Array.isArray(items)) {
      return;
    }

    target.replaceChildren();
    items.forEach(function (item) {
      var article = createElement("article", "framework-card");
      var header = createElement("div", "framework-card-header");
      header.appendChild(createElement("h3", "", item.title));
      if (item.status) {
        header.appendChild(createElement("span", "status-badge", item.status));
      }
      article.appendChild(header);

      var copy = createElement("div", "framework-copy");
      if (Array.isArray(item.paragraphs)) {
        item.paragraphs.forEach(function (paragraph) {
          copy.appendChild(createElement("p", "", paragraph));
        });
      }
      article.appendChild(copy);

      if (item.note) {
        article.appendChild(createElement("p", "framework-note", item.note));
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
      article.appendChild(createElement("span", "principle-number", String(index + 1).padStart(2, "0")));
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
    renderNavigation(content.navigation);
    renderLedger(content.hero && content.hero.ledger);
    renderParagraphs("story.paragraphs", content.story && content.story.paragraphs);
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
