/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-hero. Base block: carousel.
 * Source: https://www.merkle.com/en.html (capabilities template)
 * Generated: 2026-08-31
 *
 * Rotating hero carousel. Each slide (.cmp-carousel__item) contains a teaser with:
 *   - optional pretitle (.cmp-teaser__pretitle)
 *   - title (h2.cmp-teaser__title)
 *   - optional description (.cmp-teaser__description)
 *   - up to 2 CTAs (a.cmp-teaser__action-link, label in span.cmp-button__text)
 *   - hero image (.cmp-teaser__image img)
 *
 * Library structure (Carousel): 2 columns. Row 1 = block name (emitted by createBlock).
 * Each subsequent row = one slide: cell1 = image only, cell2 = text (title + description + CTAs).
 *
 * DM/Scene7 images arrive as <img> at parse time (merkle-dm-images transformer runs
 * afterTransform, AFTER parsers); an anchor-carrier fallback is included for resilience.
 */
export default function parse(element, { document }) {
  const cells = [];

  const slides = Array.from(element.querySelectorAll('.cmp-carousel__item'));
  const slideEls = slides.length ? slides : [element];

  slideEls.forEach((slide) => {
    // --- Image (cell 1, image only per library spec) ---
    let image = slide.querySelector('.cmp-teaser__image img, .cmp-image img, img');
    if (!image) {
      image = slide.querySelector('.cmp-teaser__image a[href], .cmp-image a[href]');
    }

    // --- Text content (cell 2) ---
    const textParts = [];
    const pretitle = slide.querySelector('.cmp-teaser__pretitle');
    const title = slide.querySelector('.cmp-teaser__title, h1, h2, h3');
    const description = slide.querySelector('.cmp-teaser__description');

    if (pretitle) textParts.push(pretitle);
    if (title) textParts.push(title);
    if (description) textParts.push(description);

    // CTAs: rebuild clean anchors from the inner button-text span so labels round-trip.
    const ctas = Array.from(slide.querySelectorAll('a.cmp-teaser__action-link[href]'));
    ctas.forEach((cta) => {
      const label = cta.querySelector('.cmp-button__text');
      const a = document.createElement('a');
      a.href = cta.getAttribute('href');
      a.textContent = (label && label.textContent.trim()) || cta.textContent.trim();
      textParts.push(a);
    });

    // Only add a slide row if it has meaningful content.
    if (image || textParts.length) {
      cells.push([image || '', textParts]);
    }
  });

  // Empty-block guard.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-hero', cells });
  element.replaceWith(block);
}
