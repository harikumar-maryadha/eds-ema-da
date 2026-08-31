/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-capabilities.js
  var import_capabilities_exports = {};
  __export(import_capabilities_exports, {
    default: () => import_capabilities_default
  });

  // tools/importer/parsers/cards.js
  function parse(element, { document }) {
    const cells = [];
    let cardEls = Array.from(element.querySelectorAll(".featuredcard"));
    if (cardEls.length === 0) {
      cardEls = Array.from(element.querySelectorAll("li.cmp-list__item"));
    }
    if (cardEls.length === 0) {
      cardEls = [element];
    }
    cardEls.forEach((card) => {
      let image = card.querySelector(".cmp-image img, .mer-fc-img_wrapper img, .image img, img");
      if (!image) {
        image = card.querySelector(".cmp-image a[href], .mer-fc-img_wrapper a[href], .image a[href]");
      }
      const textParts = [];
      const pretitle = card.querySelector(".cmp-teaser__pretitle");
      const heading = card.querySelector("h1, h2, h3, h4, h5, h6, .cmp-teaser__title");
      const desc = Array.from(card.querySelectorAll(".cmp-text p, p")).find(
        (p) => !p.classList.contains("cmp-teaser__pretitle")
      );
      if (pretitle) textParts.push(pretitle);
      if (heading) textParts.push(heading);
      if (desc) textParts.push(desc);
      const wrapperLink = card.querySelector("a.mer-clickabkle-wrapper[href], a[href]");
      if (wrapperLink) {
        const label = card.querySelector(".mer-link-text");
        const a = document.createElement("a");
        a.href = wrapperLink.getAttribute("href");
        const text = label && label.textContent.trim() || wrapperLink.textContent.trim() || "Learn more";
        a.textContent = text;
        textParts.push(a);
      }
      if (image || textParts.length) {
        cells.push([image || "", textParts]);
      }
    });
    if (cells.length <= 1) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-hero.js
  function parse2(element, { document }) {
    const cells = [];
    const slides = Array.from(element.querySelectorAll(".cmp-carousel__item"));
    const slideEls = slides.length ? slides : [element];
    slideEls.forEach((slide) => {
      let image = slide.querySelector(".cmp-teaser__image img, .cmp-image img, img");
      if (!image) {
        image = slide.querySelector(".cmp-teaser__image a[href], .cmp-image a[href]");
      }
      const textParts = [];
      const pretitle = slide.querySelector(".cmp-teaser__pretitle");
      const title = slide.querySelector(".cmp-teaser__title, h1, h2, h3");
      const description = slide.querySelector(".cmp-teaser__description");
      if (pretitle) textParts.push(pretitle);
      if (title) textParts.push(title);
      if (description) textParts.push(description);
      const ctas = Array.from(slide.querySelectorAll("a.cmp-teaser__action-link[href]"));
      ctas.forEach((cta) => {
        const label = cta.querySelector(".cmp-button__text");
        const a = document.createElement("a");
        a.href = cta.getAttribute("href");
        a.textContent = label && label.textContent.trim() || cta.textContent.trim();
        textParts.push(a);
      });
      if (image || textParts.length) {
        cells.push([image || "", textParts]);
      }
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-hero", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/video-inline.js
  function parse3(element, { document }) {
    const container = element.matches('.video, [class*="cmp-video"]') ? element : element.closest(".video, .cmp-video") || element;
    const sourceEl = container.querySelector("source[src], video[src]") || (element.matches("source[src]") ? element : null);
    const videoUrl = sourceEl ? sourceEl.getAttribute("src") : null;
    const poster = container.querySelector("img[src], img[data-src]");
    if (poster && !poster.getAttribute("src") && poster.getAttribute("data-src")) {
      poster.setAttribute("src", poster.getAttribute("data-src"));
    }
    const contentCell = [];
    if (videoUrl) {
      const link = document.createElement("a");
      link.href = videoUrl;
      link.textContent = videoUrl;
      contentCell.push(link);
    }
    if (poster) contentCell.push(poster);
    if (contentCell.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [[contentCell]];
    const block = WebImporter.Blocks.createBlock(document, { name: "video-inline", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/merkle-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "#onetrust-consent-sdk",
        ".onetrust-pc-dark-filter"
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "header",
        "footer",
        ".mer-header-space",
        "nav.cmp-navigation",
        "nav.cmp-languagenavigation",
        "iframe",
        "link",
        "noscript",
        "script",
        "style"
      ]);
      element.querySelectorAll("*").forEach((el) => {
        el.removeAttribute("data-cmp-data-layer");
        el.removeAttribute("data-cmp-hook-image");
        el.removeAttribute("onclick");
      });
    }
  }

  // tools/importer/transformers/merkle-dm-images.js
  function detectDynamicMediaUrl(urlStr) {
    let u;
    try {
      u = new URL(urlStr, "https://x/");
    } catch (e) {
      return false;
    }
    if (u.pathname.startsWith("/is/image/")) {
      return "scene7";
    }
    if (/^delivery-p\d+-e\d+\.adobeaemcloud\.com$/.test(u.hostname) && u.pathname.startsWith("/adobe/assets/urn:")) {
      return "dm-openapi";
    }
    return false;
  }
  var LINKED_DM_INLINE_WRAPPER_TAGS = /* @__PURE__ */ new Set(["PICTURE"]);
  var LINKED_DM_WRAPPER_SIBLING_TAGS = /* @__PURE__ */ new Set(["SOURCE"]);
  function findLinkedDmCarrier(img) {
    if (!img || !img.parentElement) return null;
    let node = img;
    let parent = img.parentElement;
    while (parent && LINKED_DM_INLINE_WRAPPER_TAGS.has(parent.tagName)) {
      let foundNode = false;
      for (const child of parent.children) {
        if (child === node) {
          foundNode = true;
        } else if (!LINKED_DM_WRAPPER_SIBLING_TAGS.has(child.tagName)) {
          return null;
        }
      }
      if (!foundNode) return null;
      node = parent;
      parent = parent.parentElement;
    }
    if (!parent || parent.tagName !== "A") return null;
    if (parent.children.length !== 1 || parent.children[0] !== node) return null;
    if (parent.textContent.trim() !== "") return null;
    return parent;
  }
  var EMPTY_ALT_SENTINEL = "Image without alt text";
  function altToLinkText(alt) {
    return alt || EMPTY_ALT_SENTINEL;
  }
  function transform2(hookName, element, payload) {
    if (hookName !== "afterTransform") return;
    const doc = element.ownerDocument;
    element.querySelectorAll("img").forEach((img) => {
      const src = img.getAttribute("src") || "";
      if (!detectDynamicMediaUrl(src)) return;
      const alt = img.getAttribute("alt") || "";
      const linkedAnchor = findLinkedDmCarrier(img);
      if (linkedAnchor) {
        linkedAnchor.setAttribute("title", src);
        linkedAnchor.textContent = altToLinkText(alt);
        return;
      }
      const parent = img.parentElement;
      if (parent && parent.tagName === "A") {
        console.warn("DM image inside mixed-content anchor, skipped:", src);
        return;
      }
      const a = doc.createElement("a");
      a.href = src;
      a.textContent = altToLinkText(alt);
      img.replaceWith(a);
    });
  }

  // tools/importer/import-capabilities.js
  var parsers = {
    cards: parse,
    "carousel-hero": parse2,
    "video-inline": parse3
  };
  var transformers = [
    transform,
    transform2
  ];
  var PAGE_TEMPLATE = {
    name: "capabilities",
    description: "Home/hub landing pages with hero carousel, featured content cards, and a compound dark experience-economy section",
    blocks: [
      {
        name: "carousel-hero",
        instances: [".teasercarousel.carousel"]
      },
      {
        name: "video-inline",
        instances: [".video.centered", ".cmp-video-source"]
      },
      {
        name: "cards",
        instances: [
          ".mer-featured-tgl",
          ".listcards.teasergallerylist",
          ".container.responsivegrid.text-left.aem-GridColumn--default--3"
        ]
      }
    ],
    sections: []
  };
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document, template) {
    const pageBlocks = [];
    const seen = /* @__PURE__ */ new Set();
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          if (seen.has(element)) return;
          seen.add(element);
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_capabilities_default = {
    transform: (payload) => {
      const {
        document,
        url,
        html,
        params
      } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_capabilities_exports);
})();
