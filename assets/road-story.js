(function () {
  var contentPath = "road-to-life-architecture.json";

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

  function renderParagraphList(path, items) {
    var target = document.querySelector('[data-list="' + path + '"]');
    if (!target || !Array.isArray(items)) {
      return;
    }

    target.replaceChildren();
    items.forEach(function (item) {
      target.appendChild(createElement("p", "", item));
    });
  }

  function renderChapterNavigation(items) {
    var target = document.querySelector('[data-list="journey.chapterNav"]');
    if (!target || !Array.isArray(items)) {
      return;
    }

    target.replaceChildren();
    items.forEach(function (item) {
      var link = createElement("a", "", item.number + " " + item.shortLabel);
      link.href = "#chapter-" + item.anchorId;
      target.appendChild(link);
    });
  }

  function appendParagraphs(target, paragraphs) {
    if (!Array.isArray(paragraphs)) {
      return;
    }

    paragraphs.forEach(function (paragraph) {
      target.appendChild(createElement("p", "", paragraph));
    });
  }

  function renderJourney(items) {
    var target = document.querySelector('[data-list="journey.items"]');
    if (!target || !Array.isArray(items)) {
      return;
    }

    target.replaceChildren();
    items.forEach(function (item) {
      var article = createElement("article", "journey-chapter");
      article.id = "chapter-" + item.anchorId;
      article.setAttribute("data-chapter-id", item.anchorId);

      var meta = createElement("div", "chapter-meta");
      meta.setAttribute("aria-hidden", "true");
      meta.appendChild(createElement("span", "journey-number", item.number));
      meta.appendChild(createElement("span", "chapter-short-label", item.shortLabel));
      meta.appendChild(createElement("span", "timeline-marker"));

      var body = createElement("div", "chapter-body");
      body.appendChild(createElement("h3", "", item.title));
      appendParagraphs(body, item.paragraphs);

      if (Array.isArray(item.list)) {
        var list = createElement("ul", "");
        item.list.forEach(function (entry) {
          list.appendChild(createElement("li", "", entry));
        });
        body.appendChild(list);
      }

      appendParagraphs(body, item.afterListParagraphs);

      if (item.optionalContext) {
        body.appendChild(createElement("p", "chapter-context", item.optionalContext));
      }

      if (item.highlight) {
        body.appendChild(createElement("p", "chapter-highlight", item.highlight));
      }

      article.appendChild(meta);
      article.appendChild(body);
      target.appendChild(article);
    });
  }

  function activateChapterNavigation() {
    var links = Array.prototype.slice.call(document.querySelectorAll(".chapter-nav a"));
    var chapters = Array.prototype.slice.call(document.querySelectorAll(".journey-chapter"));
    if (!links.length || !chapters.length || !("IntersectionObserver" in window)) {
      return;
    }

    var linkById = links.reduce(function (map, link) {
      map[link.getAttribute("href").slice(1)] = link;
      return map;
    }, {});

    function setActive(id) {
      links.forEach(function (link) {
        if (link.getAttribute("href") === "#" + id) {
          link.setAttribute("aria-current", "true");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    }

    setActive(chapters[0].id);
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && linkById[entry.target.id]) {
            setActive(entry.target.id);
          }
        });
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: 0 }
    );

    chapters.forEach(function (chapter) {
      observer.observe(chapter);
    });
  }

  function initImageLightbox() {
    var trigger = document.querySelector(".image-trigger");
    var dialog = document.getElementById("visual-lightbox");
    if (!trigger || !dialog) {
      return;
    }

    var closeButton = dialog.querySelector(".lightbox-close");
    var previousFocus = null;

    function getFocusable() {
      return Array.prototype.slice.call(
        dialog.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
      ).filter(function (node) {
        return !node.disabled && node.offsetParent !== null;
      });
    }

    function closeLightbox() {
      dialog.hidden = true;
      document.body.classList.remove("lightbox-open");
      trigger.setAttribute("aria-expanded", "false");
      document.removeEventListener("keydown", handleKeydown);
      if (previousFocus && typeof previousFocus.focus === "function") {
        previousFocus.focus();
      }
    }

    function handleKeydown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeLightbox();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      var focusable = getFocusable();
      if (!focusable.length) {
        event.preventDefault();
        return;
      }

      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    function openLightbox(event) {
      if (event && typeof event.preventDefault === "function") {
        event.preventDefault();
      }
      previousFocus = document.activeElement;
      dialog.hidden = false;
      document.body.classList.add("lightbox-open");
      trigger.setAttribute("aria-expanded", "true");
      document.addEventListener("keydown", handleKeydown);
      if (closeButton) {
        closeButton.focus();
      }
    }

    trigger.addEventListener("click", openLightbox);
    if (closeButton) {
      closeButton.addEventListener("click", closeLightbox);
    }
    dialog.addEventListener("click", function (event) {
      if (event.target.hasAttribute("data-lightbox-close")) {
        closeLightbox();
      }
    });
  }

  function bindImage(content) {
    document.querySelectorAll("[data-image-src]").forEach(function (node) {
      var src = getValue(content, node.getAttribute("data-image-src"));
      var alt = getValue(content, node.getAttribute("data-image-alt"));
      if (typeof src === "string") {
        node.setAttribute("src", src);
      }
      if (typeof alt === "string") {
        node.setAttribute("alt", alt);
      }
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
    bindLinks(content);
    bindImage(content);
    renderNavigation(content.navigation);
    renderParagraphList("hero.paragraphs", content.hero && content.hero.paragraphs);
    renderChapterNavigation(content.journey && content.journey.items);
    renderJourney(content.journey && content.journey.items);
    activateChapterNavigation();
    initImageLightbox();
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
      initImageLightbox();
    });
})();
