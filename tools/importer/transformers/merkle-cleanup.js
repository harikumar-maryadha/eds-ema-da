/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: merkle.com site-wide cleanup.
 *
 * Removes non-authorable site chrome (header/nav, footer, cookie consent,
 * tracking iframes, spacers) so the import contains only page-level authorable
 * content from <main id="main-content">.
 *
 * All selectors verified against migration-work/cleaned.html (representative
 * page https://www.merkle.com/en.html). No guessed selectors.
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Cookie / consent overlay — blocks/obscures content, remove before parsing.
    // Verified in cleaned.html: <div id="onetrust-consent-sdk"> (line 1148).
    WebImporter.DOMUtils.remove(element, [
      '#onetrust-consent-sdk',
      '.onetrust-pc-dark-filter',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Non-authorable site chrome. Verified in cleaned.html:
    //   header.experiencefragment (line 9) — wraps skip-link, logos, primary/
    //     secondary/tertiary nav, and language navigation.
    //   footer.experiencefragment (line 1008).
    //   div.mer-header-space (line 2) — fixed-header spacer.
    //   nav.cmp-navigation / nav.cmp-languagenavigation — nav (inside header,
    //     removed defensively in case header wrapper differs on other pages).
    // Safe leaf elements: iframe (reCAPTCHA, TTD pixel, onetrust text-resize),
    //   link, noscript, script, style.
    WebImporter.DOMUtils.remove(element, [
      'header',
      'footer',
      '.mer-header-space',
      'nav.cmp-navigation',
      'nav.cmp-languagenavigation',
      'iframe',
      'link',
      'noscript',
      'script',
      'style',
    ]);

    // Strip data-layer / accessibility tracking attributes present in DOM
    // (verified on <body>: data-cmp-* attributes; also on nested cmp elements).
    element.querySelectorAll('*').forEach((el) => {
      el.removeAttribute('data-cmp-data-layer');
      el.removeAttribute('data-cmp-hook-image');
      el.removeAttribute('onclick');
    });
  }
}
