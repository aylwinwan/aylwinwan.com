(function () {
  // Shared navigation renderer. Future static pages use the same placeholders:
  // <div class="nav-links site-nav-desktop" data-nav-desktop></div>
  // <div class="site-nav-mobile" data-nav-mobile></div>
  var navigationPath = "common-navigation.json";
  var fallbackNavigation = {
  "items": [
    {
      "id": "home",
      "label": "Home",
      "href": "index.html#top"
    },
    {
      "id": "journey",
      "label": "Journey",
      "href": "road-to-life-architecture.html"
    },
    {
      "id": "frameworks",
      "label": "Frameworks",
      "href": "index.html#frameworks"
    },
    {
      "id": "writing",
      "label": "Writing",
      "href": "index.html#writing",
      "children": [
        {
          "id": "business-architecture",
          "label": "Business Architecture",
          "href": "index.html#business-architecture-writing"
        },
        {
          "id": "life-architecture",
          "label": "Life Architecture",
          "href": "index.html#life-architecture-writing"
        },
        {
          "id": "exploration",
          "label": "Exploration",
          "href": "travel-as-a-lens.html"
        }
      ]
    },
    {
      "id": "about",
      "label": "About Aylwin",
      "href": "index.html#about-aylwin",
      "children": [
        {
          "id": "bio",
          "label": "Bio",
          "href": "index.html#bio"
        },
        {
          "id": "point-of-view",
          "label": "Point of View",
          "href": "index.html#point-of-view"
        },
        {
          "id": "principles",
          "label": "Principles",
          "href": "index.html#principles"
        },
        {
          "id": "life-reminder",
          "label": "Life Reminder",
          "href": "index.html#life-reminder"
        }
      ]
    },
    {
      "id": "contact",
      "label": "Contact",
      "href": "index.html#contact"
    }
  ],
  "desktopOrder": [
    "home",
    "writing",
    "journey",
    "frameworks",
    "about",
    "contact"
  ],
  "mobileOrder": [
    "home",
    "writing",
    "journey",
    "frameworks",
    "about",
    "contact"
  ]
};

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

  function getActiveIds() {
    var nav = document.querySelector(".nav");
    return {
      nav: nav && nav.getAttribute("data-current-nav"),
      subnav: nav && nav.getAttribute("data-current-subnav")
    };
  }

  function isActive(item, active) {
    if (!item) {
      return false;
    }
    if (item.id === active.nav || item.id === active.subnav) {
      return true;
    }
    return Array.isArray(item.children) && item.children.some(function (child) {
      return child.id === active.subnav;
    });
  }

  function itemMap(items) {
    return items.reduce(function (map, item) {
      map[item.id] = item;
      return map;
    }, {});
  }

  function orderedItems(content, orderName) {
    var map = itemMap(content.items || []);
    return (content[orderName] || []).map(function (id) {
      return map[id];
    }).filter(Boolean);
  }

  function closeDesktopDropdowns(except) {
    document.querySelectorAll(".site-nav-desktop .nav-dropdown").forEach(function (dropdown) {
      if (dropdown !== except) {
        dropdown.removeAttribute("open");
      }
    });
  }

  function renderDesktop(content) {
    var target = document.querySelector("[data-nav-desktop]");
    if (!target) {
      return;
    }

    var active = getActiveIds();
    target.replaceChildren();
    orderedItems(content, "desktopOrder").forEach(function (item) {
      if (Array.isArray(item.children) && item.children.length) {
        var dropdown = createElement("details", "nav-dropdown");
        var summary = createElement("summary", "", item.label);
        if (isActive(item, active)) {
          summary.setAttribute("aria-current", "page");
        }
        dropdown.appendChild(summary);

        var menu = createElement("div", "dropdown-menu");
        item.children.forEach(function (child) {
          var childLink = createElement("a", "", child.label);
          childLink.href = child.href;
          if (isActive(child, active)) {
            childLink.setAttribute("aria-current", "page");
          }
          menu.appendChild(childLink);
        });
        dropdown.appendChild(menu);
        target.appendChild(dropdown);
        return;
      }

      var link = createElement("a", "", item.label);
      link.href = item.href;
      if (isActive(item, active)) {
        link.setAttribute("aria-current", "page");
      }
      target.appendChild(link);
    });
  }

  function closeMobileSubmenus() {
    document.querySelectorAll(".mobile-nav-trigger[aria-expanded='true']").forEach(function (button) {
      button.setAttribute("aria-expanded", "false");
    });
    document.querySelectorAll(".mobile-nav-submenu").forEach(function (submenu) {
      submenu.hidden = true;
    });
  }

  function openMobileSubmenu(id) {
    closeMobileSubmenus();
    var trigger = document.querySelector("[data-mobile-trigger='" + id + "']");
    var submenu = document.getElementById("mobile-submenu-" + id);
    if (trigger && submenu) {
      trigger.setAttribute("aria-expanded", "true");
      submenu.hidden = false;
    }
  }

  function renderMobile(content) {
    var target = document.querySelector("[data-nav-mobile]");
    if (!target) {
      return;
    }

    var active = getActiveIds();
    target.replaceChildren();

    var scroll = createElement("div", "mobile-nav-scroll");
    var row = createElement("ul", "mobile-nav-row");
    var submenuRegion = createElement("div", "mobile-nav-submenu-region");
    submenuRegion.setAttribute("aria-live", "polite");

    orderedItems(content, "mobileOrder").forEach(function (item) {
      var listItem = createElement("li", "mobile-nav-item");
      if (Array.isArray(item.children) && item.children.length) {
        var button = createElement("button", "mobile-nav-trigger", item.label);
        button.type = "button";
        button.setAttribute("aria-expanded", "false");
        button.setAttribute("aria-controls", "mobile-submenu-" + item.id);
        button.setAttribute("data-mobile-trigger", item.id);
        if (isActive(item, active)) {
          button.setAttribute("aria-current", "page");
        }
        listItem.appendChild(button);

        var submenu = createElement("div", "mobile-nav-submenu");
        submenu.id = "mobile-submenu-" + item.id;
        submenu.hidden = true;
        submenu.setAttribute("aria-label", item.label + " submenu");
        item.children.forEach(function (child) {
          var childLink = createElement("a", "", child.label);
          childLink.href = child.href;
          if (isActive(child, active)) {
            childLink.setAttribute("aria-current", "page");
          }
          submenu.appendChild(childLink);
        });
        submenuRegion.appendChild(submenu);
      } else {
        var link = createElement("a", "mobile-nav-link", item.label);
        link.href = item.href;
        if (isActive(item, active)) {
          link.setAttribute("aria-current", "page");
        }
        listItem.appendChild(link);
      }
      row.appendChild(listItem);
    });

    scroll.appendChild(row);
    target.appendChild(scroll);
    target.appendChild(submenuRegion);
  }

  function initNavigationInteractions() {
    document.addEventListener("click", function (event) {
      var desktopSummary = event.target.closest(".site-nav-desktop .nav-dropdown summary");
      if (desktopSummary) {
        var activeDropdown = desktopSummary.closest(".nav-dropdown");
        window.setTimeout(function () {
          if (activeDropdown && activeDropdown.open) {
            closeDesktopDropdowns(activeDropdown);
          }
        }, 0);
        return;
      }

      if (event.target.closest(".site-nav-desktop .nav-dropdown a")) {
        closeDesktopDropdowns();
        return;
      }

      var mobileTrigger = event.target.closest(".mobile-nav-trigger");
      if (mobileTrigger) {
        var id = mobileTrigger.getAttribute("data-mobile-trigger");
        if (mobileTrigger.getAttribute("aria-expanded") === "true") {
          closeMobileSubmenus();
        } else {
          openMobileSubmenu(id);
        }
        return;
      }

      if (event.target.closest(".mobile-nav-submenu a")) {
        closeMobileSubmenus();
        return;
      }

      if (!event.target.closest(".site-nav-desktop .nav-dropdown") && !event.target.closest(".site-nav-mobile")) {
        closeDesktopDropdowns();
        closeMobileSubmenus();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeDesktopDropdowns();
        closeMobileSubmenus();
      }
    });
  }

  function revealActiveMobileItem() {
    var mobileNav = document.querySelector("[data-nav-mobile]");
    if (!mobileNav || window.getComputedStyle(mobileNav).display === "none") {
      return;
    }

    var activeItem = document.querySelector(".mobile-nav-link[aria-current='page'], .mobile-nav-trigger[aria-current='page']");
    if (activeItem && typeof activeItem.scrollIntoView === "function") {
      activeItem.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
  }

  fetch(navigationPath)
    .then(function (response) {
      if (!response.ok) {
        throw new Error("Navigation request failed");
      }
      return response.json();
    })
    .then(function (content) {
      renderDesktop(content);
      renderMobile(content);
      initNavigationInteractions();
      revealActiveMobileItem();
    })
    .catch(function () {
      document.documentElement.setAttribute("data-navigation-state", "fallback");
      renderDesktop(fallbackNavigation);
      renderMobile(fallbackNavigation);
      initNavigationInteractions();
      revealActiveMobileItem();
    });
})();
