/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import cardsParser from './parsers/cards.js';
import carouselHeroParser from './parsers/carousel-hero.js';
import videoInlineParser from './parsers/video-inline.js';

// TRANSFORMER IMPORTS
import merkleCleanupTransformer from './transformers/merkle-cleanup.js';
import merkleDmImagesTransformer from './transformers/merkle-dm-images.js';

// PARSER REGISTRY - Map block variant names to parser functions.
// Note: 'section-experience-economy' is a section-style marker (no parser); it is
// intentionally absent here and is handled as section styling during design migration.
const parsers = {
  cards: cardsParser,
  'carousel-hero': carouselHeroParser,
  'video-inline': videoInlineParser,
};

// TRANSFORMER REGISTRY - cleanup runs first, DM image carrier conversion after.
const transformers = [
  merkleCleanupTransformer,
  merkleDmImagesTransformer,
];

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json (capabilities template)
const PAGE_TEMPLATE = {
  name: 'capabilities',
  description: 'Home/hub landing pages with hero carousel, featured content cards, and a compound dark experience-economy section',
  blocks: [
    {
      name: 'carousel-hero',
      instances: ['.teasercarousel.carousel'],
    },
    {
      name: 'video-inline',
      instances: ['.video.centered', '.cmp-video-source'],
    },
    {
      name: 'cards',
      instances: [
        '.mer-featured-tgl',
        '.listcards.teasergallerylist',
        '.container.responsivegrid.text-left.aem-GridColumn--default--3',
      ],
    },
  ],
  sections: [],
};

/**
 * Execute all page transformers for a specific hook.
 * @param {string} hookName - 'beforeTransform' or 'afterTransform'
 * @param {Element} element - The DOM element to transform
 * @param {Object} payload - { document, url, html, params }
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration.
 * @param {Document} document - The DOM document
 * @param {Object} template - The embedded PAGE_TEMPLATE object
 * @returns {Array} Array of block instances found on the page
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  const seen = new Set();
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        // Guard against the same element matching multiple selectors of one block.
        if (seen.has(element)) return;
        seen.add(element);
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

// EXPORT DEFAULT CONFIGURATION
export default {
  transform: (payload) => {
    const {
      document, url, html, params,
    } = payload;

    const main = document.body;

    // 1. beforeTransform (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Discover blocks on the page
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block (skip elements already replaced by a prior parser)
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

    // 4. afterTransform (final cleanup + DM carrier conversion)
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Sanitized path (map root/homepage URL to /index to avoid empty-path crash)
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
