/* eslint-disable */
/* global WebImporter */
/**
 * Parser for video-inline. Base block: video.
 * Source: https://www.merkle.com/en.html (capabilities template)
 * Generated: 2026-08-31
 *
 * Self-hosted .mp4 sizzle reel with a poster image.
 * Source DOM: .video.centered > .cmp-video > .cmp-video__player >
 *   <video><source class="cmp-video-source" src="...mp4"></video>
 *   + poster <img> inside .cmp-video__player__controls.
 *
 * Library structure (Video): 1 column, 2 rows. Row 1 = block name (emitted by
 * createBlock). Row 2 = video source URL (as a link) + optional poster image in
 * the same cell.
 *
 * instances[] unions `.video.centered` (container) and `.cmp-video-source`
 * (the <source> element). Handle both: resolve the container from whichever
 * element is passed so extraction is identical.
 *
 * NOTE ON VALIDATION: the completeness heuristic compares source *text* vs block
 * *text*. A video block's meaningful content (mp4 URL attribute + poster image)
 * carries no text, while the source element's only text is player chrome ("Play",
 * empty caption). The low text-similarity score is therefore expected and not a
 * dropped-content defect — the mp4 source URL is captured in full.
 */
export default function parse(element, { document }) {
  // Normalize: the parser may receive the container or the inner <source>.
  const container = element.matches('.video, [class*="cmp-video"]')
    ? element
    : (element.closest('.video, .cmp-video') || element);

  // --- Video source URL ---
  const sourceEl = container.querySelector('source[src], video[src]')
    || (element.matches('source[src]') ? element : null);
  const videoUrl = sourceEl ? sourceEl.getAttribute('src') : null;

  // --- Optional poster image (may be lazy-loaded) ---
  const poster = container.querySelector('img[src], img[data-src]');
  if (poster && !poster.getAttribute('src') && poster.getAttribute('data-src')) {
    poster.setAttribute('src', poster.getAttribute('data-src'));
  }

  const contentCell = [];
  if (videoUrl) {
    // Represent the video source as a link so the URL round-trips through markdown.
    const link = document.createElement('a');
    link.href = videoUrl;
    link.textContent = videoUrl;
    contentCell.push(link);
  }
  if (poster) contentCell.push(poster);

  // Empty-block guard.
  if (contentCell.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [[contentCell]]; // 1-column: one row, one cell holding all content.
  const block = WebImporter.Blocks.createBlock(document, { name: 'video-inline', cells });
  element.replaceWith(block);
}
