/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards. Base block: cards.
 * Source: https://www.merkle.com/en.html (capabilities template)
 * Generated: 2026-08-31
 *
 * Handles the union of three merkle DOM shapes mapped to this block:
 *   - Featured content gallery:  .mer-featured-tgl  (ul > li.cmp-list__item > .featuredcard)
 *   - Work-in-action gallery:    .listcards.teasergallerylist (same list-item shape)
 *   - 4-icon feature grid:       .container.responsivegrid.text-left ... aem-GridColumn--default--3
 *                                (each matched element is a SINGLE card: .image img + .text h6/p)
 *
 * Library structure (Cards): 2 columns. Row 1 = block name. Each subsequent row = one card:
 *   cell1 = image/icon, cell2 = text (heading + description + optional CTA link).
 *
 * DM/Scene7 images arrive as <img> at parse time (merkle-dm-images transformer runs in
 * afterTransform, AFTER parsers); an anchor-carrier fallback is included for resilience.
 */
export default function parse(element, { document }) {
  // createBlock() emits the block-name header row itself; cells holds only card rows.
  const cells = [];

  // 1) Identify the card units within this element.
  // Gallery shapes wrap each card in .featuredcard (inside li.cmp-list__item).
  let cardEls = Array.from(element.querySelectorAll('.featuredcard'));
  if (cardEls.length === 0) {
    // Other list-based galleries expose cards as list items.
    cardEls = Array.from(element.querySelectorAll('li.cmp-list__item'));
  }
  if (cardEls.length === 0) {
    // Icon feature grid: the matched element IS a single card (image + text).
    cardEls = [element];
  }

  cardEls.forEach((card) => {
    // --- Image / icon (cell 1) ---
    // Prefer a real <img>; fall back to an anchor-carrier if the DM transformer
    // has already rewritten the image to an <a> (defensive, cross-page).
    let image = card.querySelector('.cmp-image img, .mer-fc-img_wrapper img, .image img, img');
    if (!image) {
      image = card.querySelector('.cmp-image a[href], .mer-fc-img_wrapper a[href], .image a[href]');
    }

    // --- Text content (cell 2) ---
    const textParts = [];
    const pretitle = card.querySelector('.cmp-teaser__pretitle');
    const heading = card.querySelector('h1, h2, h3, h4, h5, h6, .cmp-teaser__title');
    // Description = a paragraph that is not the pretitle (icon grid uses a plain <p>).
    const desc = Array.from(card.querySelectorAll('.cmp-text p, p')).find(
      (p) => !p.classList.contains('cmp-teaser__pretitle'),
    );

    if (pretitle) textParts.push(pretitle);
    if (heading) textParts.push(heading);
    if (desc) textParts.push(desc);

    // CTA: gallery cards wrap the whole card in an anchor; the visible label lives
    // in .mer-link-text. Rebuild a clean link so the href + label round-trip.
    const wrapperLink = card.querySelector('a.mer-clickabkle-wrapper[href], a[href]');
    if (wrapperLink) {
      const label = card.querySelector('.mer-link-text');
      const a = document.createElement('a');
      a.href = wrapperLink.getAttribute('href');
      const text = (label && label.textContent.trim())
        || (wrapperLink.textContent.trim())
        || 'Learn more';
      a.textContent = text;
      textParts.push(a);
    }

    if (image || textParts.length) {
      cells.push([image || '', textParts]);
    }
  });

  // Empty-block guard.
  if (cells.length <= 1) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards', cells });
  element.replaceWith(block);
}
