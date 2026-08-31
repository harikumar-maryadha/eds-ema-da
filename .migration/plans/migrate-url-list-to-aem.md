# Site Migration Plan — merkle.com to AEM Edge Delivery Services

## ⚠️ Plan Mode Is Still Stuck After Reload — Escalation Needed
A reload didn't clear it: your latest message still arrived carrying the harness's active-plan-mode reminder, which is what forces every write to be rejected. This is now clearly an **environment/harness issue**, not something the plan or I can fix from inside the conversation — I have no tool to toggle plan mode or restart the session.

I'm going to **stop re-probing** (repeated failed write attempts just add noise). The plan below is final and approved; it will run the instant plan mode is genuinely off.

### Things that may actually clear it (in order)
1. **Start a brand-new chat/session** rather than reloading this one — a fresh session begins in normal (execute) mode. Paste this one-liner to resume: *"Migrate merkle.com to AEM EDS — discover URLs from sitemap, content + design, import only (no publish). Start Phase 1."*
2. Look for a **keyboard shortcut / explicit "Exit plan mode" button** distinct from the plan toggle, and use that.
3. If neither works, this is worth **reporting as a bug** — the plan-mode flag is not clearing on the server side for this session.

You don't lose any work by switching sessions — all my decisions are captured in this plan.

## Confirmed Inputs (carry to a new session if needed)
- **Base site URL:** `https://www.merkle.com/`
- **URL source:** Sitemap discovery (fall back to crawl)
- **Depth:** Content + design (match original visual styling)
- **Publish:** Import only — no upload/publish to Document Authoring

## Approach
1. **Discover URLs** from the merkle.com sitemap; fall back to crawling if no usable sitemap exists.
2. **Catalog templates** — group discovered URLs into page templates so similar pages share infrastructure and styling.
3. **Analyze representative pages** per template — sections, content sequences, authoring decisions, block variants.
4. **Build import infrastructure** — page templates, block parsers, page transformers.
5. **Import content** for the target URLs using the bundled import script (local only).
6. **Migrate design** — extract source styles and apply matching CSS per block/template.
7. **Validate** imported pages against originals (content completeness + visual critique) and fix divergences.

## Checklist

### Phase 0 — Enable Execution
- [ ] Start a fresh session (or find an explicit Exit-plan-mode action) so the harness leaves plan mode
- [ ] Confirm a write succeeds (no plan-mode reminder on the next message), then send "go"

### Phase 1 — Discovery & Cataloging
- [ ] Fetch the merkle.com sitemap and discover the full URL list (fall back to crawl if needed)
- [ ] Confirm the discovered URL count/scope, include/exclude patterns, and any page cap with you
- [ ] Catalog page templates and group URLs by type

### Phase 2 — Analysis
- [ ] Analyze a representative page for each template (sections, sequences, block variants)
- [ ] Survey available blocks and map content to blocks/variants
- [ ] Record block mappings and page-template structure

### Phase 3 — Import Infrastructure
- [ ] Generate page templates (classification + block mapping)
- [ ] Generate block parsers for each variant
- [ ] Generate page transformers (cleanup, sections, media handling)
- [ ] Build/bundle the import script

### Phase 4 — Content Import (local only)
- [ ] Run the bulk import for the target URLs
- [ ] Verify imported content renders in local preview
- [ ] Confirm no pages failed to import

### Phase 5 — Design Migration
- [ ] Extract design tokens/styles from merkle.com
- [ ] Apply site-level design (typography, colors, spacing)
- [ ] Style each block variant to match the original
- [ ] Visually verify each template against the original

### Phase 6 — Validation
- [ ] Run post-import validation (content completeness scoring per page)
- [ ] Visually critique flagged pages vs. originals
- [ ] Fix divergences and re-verify
- [ ] Summarize results for your review (nothing published)

## Notes
- Content is imported **locally only** — no publish to Document Authoring in this plan.
- merkle.com is large; expect Phase 1 to surface many URLs. We'll narrow to a representative, per-template set before importing unless you specify otherwise.
- **The plan is complete and approved.** The only blocker is a stuck plan-mode state at the harness level — clearing it (ideally via a fresh session) is the one remaining step before Phase 1 runs.
