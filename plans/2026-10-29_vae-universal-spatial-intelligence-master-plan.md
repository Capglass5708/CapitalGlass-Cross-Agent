# VAE Universal Spatial Intelligence — Master Strategic Plan
**Mission ID:** VAE-USI-20261029  
**Date:** 2026-10-29  
**Status:** PROPOSED — strategy and research brief, not implementation or verified performance  
**Revision 2 (2026-10-29):** §2.1–2.3 now record a read of canonical VAE main `84aec220` (merged 2026-10-28) in place of the earlier "not verified" note. §4.2, §5, §8–§13 were corrected against that read; the inventory facts are source-checked, everything else remains proposal.  
**Coordination authority:** `Capglass5708/CapitalGlass-Cross-Agent` (`plans/` only)  
**Implementation owner:** `BlackBoxCompute/Visual-Asset-Engine` (canonical after 2026-10-07 cutover)  
**Legacy read-only source:** `Capglass5708/Visual-Asset-Engine`  
**Operating preference:** Cursor leads; may delegate work to Claude or other specialist agents when evidence supports it. Continuous evidence-driven improvement, preserve existing value.

## 1. Executive decision
**Do not convert VAE into a website-only repository. Do not establish a second visual authority.** Keep VAE an engine-of-engines serving website and application UI, document and presentation design, marketing and brand visuals, photos and raster images, vectors, and glazing/technical drawings. Introduce **Universal Spatial Intelligence (USI)** as shared infrastructure that specialist engines may consume. Use the particularly observable website/browser domain as the first complete, high-value demonstration and extend the proven capability to other media.

### North-star outcome
An authorized operator or agent supplies a URL, permitted screenshot, document, presentation, technical drawing, or multiple references; selects entire pages or individual elements; obtains a trustworthy, editable spatial/semantic model; replaces images, text, identity and components; reconstructs a fully functioning and responsive output where applicable; validates measured visual fidelity and behavior; and continually compounds verified patterns and repair experience.

The distinction: **8×8 is a diagnostic tile grid, not an element inventory or multi-agent coordination protocol**. Preserve the VAE visual-reference-proof tile metrics while adding arbitrary-resolution element-level mapping and relational constraints. No arbitrary 64-element limit, no implied pixel-perfect results for inaccessible elements, and no layout created solely from brittle absolute positions.

### Deliverables in this mission
1. Actual source-backed capabilities/inventory and gap report on canonical VAE main.
2. Universal Spatial Scene Graph, provenance and confidence contract.
3. Reference acquisition and interactive inspection with measured coordinates.
4. Editable reconstruction and replacement workflows across selected media.
5. Multi-reference fusion and responsive/interactive reconstruction.
6. Autonomous correction loop with independent visual/functional verification.
7. Open-source adapter evaluation and commercial/licensing review.
8. Compounding learning, measurable benchmarks, operator-facing workspace, and evidence of actual ROI.

## 2. Confirmed historical baseline and verification boundary
The **legacy** `Capglass5708/Visual-Asset-Engine` README identifies `BlackBoxCompute/Visual-Asset-Engine` as the current home with cutover SHA `dfa72e97814ea1fd13474c920eb7644efff4d11e`. Read-only exploration of the legacy repository confirms:
- Engine Orchestrator routes primary UI Experience, Document, Brand & Marketing, Glazing Technical, supporting Asset Transformation, cross-cutting Visual QA, and Visual Evidence, preserving the shared Creation Kernel.
- VAE components include UI Intelligence, Canvas Design, Canvas Intake, Canvas Parity, Studio, Visual Intelligence Graph, Storybook/pipeline capture, evaluators and visual-reference-proof.
- Documented `VAE_VISUAL_REFERENCE_PROOF_V1` provides Playwright and file PNG capture adapters, reference registration, geometry checks, pixel difference, SSIM, configurable **8×8 default comparison tiles**, named regions, masks, diagnosis, hashed evidence, and compare→diagnose→caller fixes→recapture. Default comparison uses strict dimension matching, 0 mismatched-pixel ratio, and SSIM ≥0.99 (these are defaults, **not evidence of achieved similarity**). VAE proof itself does not edit consuming application source.
- Electron/PDF/SVG/desktop capture adapters were marked PLANNED in the documented V1; Playwright and file adapters IMPLEMENTED.
- The canonical root MCP is described as read-only discovery/routing; write-capable generation exists through governed execution elsewhere. Do not clone a new MCP for each engine.

The 2026-07-19 autonomy review in the legacy repository identified early weak quality gates and autonomous correction; it is historical, **not** a current performance rating.

### 2.1 Canonical main inventory (read 2026-10-29 at `84aec220`)
This is a read of the source tree and docs, not a performance claim. All paths are relative to `BlackBoxCompute/Visual-Asset-Engine`. Re-check main before acting; it moves.

| Plan concept | What already exists on main | State | Gap against this plan |
| --- | --- | --- | --- |
| Spatial scene + provenance (§4.2) | `generation-core/packages/reference-layout-intelligence`: `VisualScene` (`vae-layout-spec-scene-v1@1.0.0`) with per-region `measurementClass` VERIFIED / INFERRED / DERIVED, `confidence` and `boundsProvenance`. Only `MEASURED_DOM` and `APPROVED_COMP_PNG` can produce VERIFIED; a layout brief is INFERRED (0.55). | Merged #24–#26 (2026-10-28), 17 tests | Regions only (sections, cards), with no element nodes, styles, behavior, transforms or multi-frame coordinates. Has no UNKNOWN class. This is the seed USSG, so extend it rather than add a parallel contract. |
| Browser-measured geometry (§4.1) | `reference-layout-intelligence/dom-capture.mjs`: Playwright `getBoundingClientRect` of **`[data-vae-region]` markers only**, plus page scroll height and an optional fold PNG. `scene-normalize.mjs` maps CSS px into reference frames (Y scale from measured page height; it never squashes the full page into the fold). | Merged | Works only on pages we can instrument. There is no marker-free element inventory of an arbitrary URL: no CDP `DOMSnapshot`, computed styles per node, accessibility tree, transforms or stacking. |
| Structural comparison (§6) | `region-match.mjs` v1.2.0: IoU or id pairing; `geometryAuthority` `measured` (pixel GEOMETRY_DELTA decides) vs `relational` (ORDER / ARRANGEMENT / NESTING / WIDTH_CLASS deltas decide; pixel deltas are advisory). `implementation-guidance.mjs` ranks deltas for a fixing agent. | Merged | Region level only. No element-level, text-wrap or interaction-state comparison. |
| Raster → layout | `extract-from-raster.mjs`: deterministic layout extraction, always INFERRED, never promoted. | Merged | No object detection, segmentation or OCR, so no element boxes from screenshots. |
| Visual proof | `visual-reference-proof`: Playwright and file adapters; `compare` / `ssim` / `diagnose` / `evidence`; 8×8 tiles. | IMPLEMENTED | `electron`, `pdf-render`, `svg-render` and `desktop-screenshot` adapters are still **PLANNED** and fail closed with `ADAPTER_NOT_IMPLEMENTED`. This blocks the cross-media proofs in §12. |
| Replica of a site | `website-reconstruction-replica` + `pipeline/capture-website-*.mjs`: baseline and interaction-state capture, **computed styles + `:root` tokens per route** (`ui-deep-style-evidence.json`), registered goldens, `measure-fidelity`. Reference: `sergio-ayala-website-v1`. | Self-check loop only | `pixelPerfectClaim` advances only on a **candidate** build passing all gates, and no candidate has. Copy policy is `pattern-only-no-clone`. |
| Reconstruction profiles | `website-design-authority/load-reconstruction-profile.mjs` and `docs/VAE_WEBSITE_RECONSTRUCTION_PROFILE_V1.md`. | Implemented | `pixelPerfectClaim = FORBIDDEN_UNTIL_MEASURED`. |
| Raster layer decomposition | `qwen-image-layered` (GPU worker), `visual-reconstruction` router, layer-parallax composition, verdict policy. | Chain VERIFIED on synthetic input | Real GPU decompose is **PENDING**; `RECONSTRUCTION_MEASURED` is **NOT EARNED** (`docs/VAE_VISUAL_RECONSTRUCTION_CAPABILITY_MATRIX_V1.md`). |
| Asset replacement primitives | `asset-transformation`: `image.crop` / `resize` / `fit` / `background-cleanup` / `brand-treatment` / `variant` / `compress` / `layer-decompose`, plus photo and vector intake (inspect / import / approve / publish). | Executable registry | No focal-point-preserving responsive replacement bound to a scene node. |
| Operator workspace (§5) | `studio/build.mjs` renders a **static card catalog of registered patterns**. `canvas-intake` validates and hashes manifests. `canvas-parity` handles locked renders and pixel diffs. | Implemented | No interactive overlay, selection, inspection or replacement UI exists, so the Reference Inspector is new build, not an extension. |
| Glazing / technical | `glazing-visual-intelligence` is classified **sketch / composition lane** (owner decision 2026-09-27; infers geometry). Authoritative elevations use the fixed-geometry path in `packages/vae-visual` (`vae-glazing-elevation-spec-v1`). | Implemented | The technical proof must use `vae-visual`, not the sketch lane. |
| Learning sink | `measured-learning` (`vae-measured-visual-learning-v2`; requires a measured passing outcome + `evidenceDigest`; weight capped at **0.2**). `reference-layout-intelligence/learning-receipt.mjs`. Visual Intelligence Graph v1: proposal-cover seed only, no embeddings, no outcome correlation. | Implemented | No spatial or repair-pattern learning yet. |
| MCP surface | Root `mcp/tools.mjs`: 20 tools, all read-only. Includes `vae.analyze_reference_layout`, `vae.run_visual_fidelity_convergence` (PNG paths restricted to repo, tmp and `VAE_MCP_IMAGE_ROOTS`), `vae.compile_website_replica_spec`, `vae.measure_website_replica_fidelity`, `vae.inspect_visual_system`, `vae.route_visual_work` and `vae.plan_asset_transformation`. | Implemented | No write or capture tool. Capture runs through pipeline scripts and governed execution. |
| Dependencies | `pipeline`: `playwright`, `pngjs`. `packages/vae-visual`: `elkjs` (EPL-2.0 or GPL-3.0), `opentype.js`, `d3-*`; dev: `sharp`, `@resvg/resvg-js`, `esbuild`. Register: `docs/THIRD_PARTY_OPEN_SOURCE_V1.md`. | — | None of the §7 vision, OCR or canvas candidates is a dependency today. |

### 2.2 Live consumers to use as first benchmarks
These are Capital Glass's own pages, so the reference rights are clean:
- **CG-Website storefront systems page:** `apps/website/src/components/StorefrontSystemsPage.astro`, 11 `data-vae-region` markers. Merged to CG-Website main in #7. Against its INFERRED layout brief, VAE reports 9 relational structure deltas, and the owner has not yet decided brief vs. condensed layout. It is a ready-made slice for the relational loop.
- **CG-Website homepage hero:** a VAE hero-geometry proof is in progress in another session (not on main as of this revision).

### 2.3 Lessons already paid for (reference-layout fidelity, 2026-10-28)
These are defects found in this exact problem space. Encode them as tests, not prose.
1. **Silent zero matches.** Regions joined by id never matched, which produced 64 phantom deltas. Report the unmatched counts on both sides, and fail when matching is empty.
2. **Frame mistakes.** The normalizer squashed the full page into the fold. Every coordinate must carry its frame (§4.1), and conversions need regression tests at more than one viewport.
3. **Circular calibration.** Fitting an INFERRED spec to the page's own measurements makes the loop compare the page with itself. A spec becomes VERIFIED only with owner approval.
4. **Tautological tests.** Assertions that re-derive the expected value from the code under test passed while the output was wrong. Assert exact expected values from fixtures.
5. **Pixel authority vs. relational authority.** Against an inferred reference, pixel deltas are advisory. Order, arrangement, nesting and width class decide.

Sources:
- https://github.com/Capglass5708/Visual-Asset-Engine/blob/main/README.md
- https://github.com/Capglass5708/Visual-Asset-Engine/blob/main/LEGACY_REPOSITORY.md
- https://github.com/Capglass5708/Visual-Asset-Engine/blob/main/00-README/VAE-ENGINE-OF-ENGINES-ARCHITECTURE-V1.md
- https://github.com/Capglass5708/Visual-Asset-Engine/blob/main/00-README/VAE-CAPABILITY-MAP-V1.md
- https://github.com/Capglass5708/Visual-Asset-Engine/blob/main/docs/VAE_VISUAL_REFERENCE_PROOF_V1.md
- https://github.com/Capglass5708/Visual-Asset-Engine/blob/main/00-README/AUTONOMOUS-VISUAL-ENGINE-ARCHITECTURE-REVIEW.md

## 3. Architecture and ownership
```text
Operator / Cursor-led agents / governed consumer apps
    -> Authorized reference intake (URL, screenshot, file, chosen region, state)
    -> Perception adapters (browser structure + images + document/vector geometry + OCR)
    -> Universal Spatial Scene Graph (elements + styles + constraints + interactions + provenance)
    -> Reference selection/fusion + component/pattern reuse
    -> Existing VAE Engine Orchestrator
       [UI Experience | Document | Brand & Marketing | Glazing Technical |
        supporting Asset Transformation]
    -> Existing Creation Kernel / consumer application implementation agents
    -> Visual QA + Visual Reference Proof + behavioral/accessibility testing
    -> Independent proof receipt / Visual Evidence
    -> Visual Intelligence Graph / Intelligence Hub (verified outcomes only)
    -> repeat for valuable improvement
```
- VAE owns visual representations, reference capture/analysis, semantic/spatial intelligence, visual comparison, design patterns and verified visual assets.
- Application repos own functional code, business data and deployment. VAE must not silently modify a consuming app, become a second AppBuilder, or replace the estimator's facts.
- Cross Agent records this plan, decisions and status, *not code, tools, databases or full research corpora*.
- Existing Scraper/Data-Extraction/research catalogs collect vendor/library research; avoid duplicating their corpus in Cross Agent.
- Existing Intelligence Hub can be a reusable experience sink, but its actual integration and benefit must be demonstrated with matched outcomes rather than asserted by retrieval counts alone.
- Preserve security, licensing, tenant and production boundaries and normal review/merge permissions. Do not invent additional approval bureaucracy.

## 4. Universal spatial coordinate and scene model
### 4.1 Coordinates are evidence, not just grid cells
Maintain multiple coordinate frames: source-image pixels, CSS pixels, document/page units, device-pixel ratio, viewport and full-page scroll offset, transformed local coordinates, parent-relative coordinates, and normalized ratios. Capture zoom, clipping, transforms, rotation, z-index, stacking context, crop/contain/cover modes and asset focal point. Every coordinate must identify its source frame and capture identity; avoid unsupported conversion assumptions.

Use three complementary levels:
- Coarse 8×8 or 16×16 visual parity grid for regional diagnosis.
- Adaptive grid/quadtree subdivision in high-detail or high-error areas (possibly 32×32 or finer as justified by resolution).
- **True element objects** with bounding polygon or box, identifiers, parent/child relationships, constraints, typography, textures, state and semantics, regardless of grid boundaries.

A 1440×900 reference may contain a logo at x=48,y=24,w=150,h=48, but those illustrative numbers only become facts when sourced from a real capture. Never treat the grid's cells as canonical element boundaries.

### 4.2 Universal Spatial Scene Graph (USSG)
Each addressable node should have a stable identity and appropriate, format-specific attributes:
- element type: text, image, vector, video, button, form, navigation, group, drawing/annotation, etc.;
- geometry: bounds, polygons, transform matrices, origins, scroll and clipping;
- semantic role, accessible name and reading order where available;
- content: extracted text, image reference, crop metadata, editable/replacement slots, font/layout metrics;
- styles: tokens and computed typography, colors, borders, shadows, spacing, alignment and responsive rules;
- relationships: containment, adjacency, constraints, anchors, groups and component reuse;
- behavior: interaction states, click destinations, hover/focus, transitions, scroll effects and state transitions;
- provenance: reference URL/file, capture time/version, content hash, licensing/permission, measurement adapter, uncertainty and confidence;
- change/verification links: agent task owner, intended replacement, before/after hashes, QA findings, status.

Implement only a minimal shared contract proven useful by real examples. Specialist packages extend the contract, not fork the graph. Explicitly record **measured vs inferred vs unknown**, with confidence and evidence pointers; AI-generated guesses cannot override browser-measured geometry.

**Starting point on main (§2.1):** grow the existing `VisualScene` (`reference-layout-intelligence`) into the USSG. Do not introduce a second schema.
- **Versioning:** bump it to a v2 schema that stays a superset of v1, so `vae.analyze_reference_layout` and `vae.run_visual_fidelity_convergence` keep working.
- **Measurement classes:** keep VERIFIED / INFERRED / DERIVED, add `UNKNOWN` (visible but not measurable, such as a cross-origin iframe, canvas or protected content) with a reason code, and keep the promotion rule: only an approved provenance (`MEASURED_DOM`, `APPROVED_COMP_PNG`, and later a measured PDF/SVG render) yields VERIFIED.
- **Nodes:** add element nodes under today's region nodes with an explicit `frame` id (§4.1). Node ids must be stable across captures (for example, derived from DOM path + role + text hash) so matching does not depend on the author's id strings (§2.3 lesson 1).

### 4.3 Responsive and temporal model
Capture desktop/tablet/mobile and meaningful intermediate widths; derive constraints (grid, flex, max-width, stacking, wrapping, sticky/fixed, visibility). Use multiple scroll positions, hover/focus/menu/cart states, and selected time/animation frames. Build layouts from relationships and design tokens, **not thousands of absolute pixel placements**.

## 5. Core user-facing experiences
### Reference Inspector overlay
An operator places a VAE overlay on an authorized reference, hovers/selects any identifiable asset, and sees exact sourced x/y/w/h, CSS/document frame, typography, colors, parent group, neighboring constraints, image crop, source confidence, responsiveness, behavior and interactive states. Allow multi-select, named regions, zoom, compare view, missing-node reporting, design comments and direct replacement instructions.

On main today, `studio` is a static pattern catalog and `dom-capture` reads only author-placed `data-vae-region` markers (§2.1). Two things therefore come before any overlay UI:
1. **A marker-free capture adapter.** CDP `DOMSnapshot.captureSnapshot` with computed styles, layout boxes and paint order, plus `Accessibility.getFullAXTree`, implemented as a capture adapter beside the existing `playwright` one. Reuse the replica pipeline's deep-style capture logic, not a new crawler.
2. **A read-only first version of the overlay.** It renders the captured USSG over the captured screenshot (select, inspect, compare). Editing and replacement come later. Choose the canvas library (§7) only once this read-only version shows what it needs.

### Reconstruct / Rebrand / Fuse / Evolve
1. **Replica:** high-fidelity authorized reproduction of a site/page or media asset. Main's copy policy for third-party references is `pattern-only-no-clone` (`docs/VAE_WEBSITE_RECONSTRUCTION_PROFILE_V1.md`). Exact replicas are therefore limited to references Capital Glass owns or is licensed to reproduce; third-party references get Rebrand / Evolution treatment with original or licensed assets. Changing that policy is an owner decision, not an agent one.
2. **Rebrand:** retain intended composition while replacing photographs, logos, fonts/colors, products, text and links.
3. **Fusion:** header from A, hero from B, product grid from C, editorial treatment from D, with a coherent unified component system and explicit source traceability.
4. **Evolution:** improve usability, accessibility or conversion beyond a reference; require independent measured tests and clearly separate exploratory hypotheses from demonstrated improvement.

### Asset replacement
Selected image → replace while maintaining bounds, focal point, aspect and responsive crop; selected text → rewrite while respecting natural reflow, font metrics, wrapping and accessible semantics; selected button → change content, action, hover/focus state and destination; selected gallery/card → replace data, variants, sorting and links. Replacements must preserve editable ownership and must not require re-rasterizing an entire page.

### Functional website reconstruction
Map and verify navigation, menus, search, filters, product variants, add-to-cart, forms, validation, checkout handoff and other observed paths. Never assert backend function from appearance alone. Third-party payment/auth or protected services require genuine authorized integration rather than imitation.

### Cross-media reuse
The same spatial intelligence should enrich proposal covers, reading-flow documents, presentations, ad compositions, raster/vector manipulation, storefront/curtainwall elevations, dimensioning and annotated drawing layouts. Do not impose website-specific DOM assumptions on PDF or technical geometry.

**Prerequisites on main:**
- The `pdf-render` and `svg-render` proof adapters are PLANNED and fail closed (§2.1). Implement them first; that makes the document and vector proofs measurable.
- Technical drawings: consume the fixed-geometry `vae-glazing-elevation-spec-v1` path in `packages/vae-visual`, where every coordinate comes from the consumer (estimator). The `glazing-visual-intelligence` sketch lane infers geometry and is not an authority renderer (owner decision 2026-09-27).

## 6. Autonomous multi-agent operating model
**Cursor is the lead execution agent**, with autonomy to allocate specialist tasks, use Claude when useful, select adapters and continue the discover→reason→build→test→evaluate→improve cycle. VAE is the one visual measurement/asset authority; other agents remain accountable for their consuming repos.

Coordination is **graph- and evidence-based**, not 'one AI per 8×8 square'. Decompose by semantic component, dependency and spatial boundary (navbar, hero, cards, footer, responsive states), while preserving shared tokens and contracts. Agents get stable node and region identifiers, relevant references and neighboring constraints. Track ownership to avoid overlapping edits, reconcile merges via visual/regression proof, and keep a single integrated experience.

Continuous loop: intake → recover/reuse → inspect reference → assemble scene graph → select intent and quality constraints → construct candidate → render same viewport/state → measure element/layout/region/global mismatches and functional behavior → categorize issues → agent fix → recapture → independent verify → publish versioned proof → store verified lessons → choose next valuable opportunity. No fabricated passing gates and no self-certification by the producing agent.

Comparison measurements: exact geometry, diffs, SSIM, region metrics, perceptual similarity where applicable, font/text wrapping, asset provenance, masks only for justified dynamic regions, accessibility checks, workflow success, responsive stability and performance budgets. Diagnose localized offsets, missing content, global color shifts, wrong crop, overflow and interaction failure. Compare progress against last run and protect previously verified function from regressions.

## 7. Open-source and source-available landscape (candidates, not automatic dependencies)
**License and maintenance review is mandatory for each tool, its models/weights, deployment, and commercial use; links and license notes are research leads, not legal conclusions.** Prefer using VAE's existing implementations where competitive. Benchmark alternatives and retain only demonstrable incremental value.

| Project | URL | Candidate capability | Adoption posture |
| --- | --- | --- | --- |
| Playwright | https://github.com/microsoft/playwright | Multi-browser capture, DOM/state navigation, controlled renders | **P0 deepen existing VAE use**, not duplicate |
| Chrome DevTools Protocol / Chromium | https://chromedevtools.github.io/devtools-protocol/ | DOM snapshots, computed styles, layout boxes, accessibility and paint/runtime inspection | **P0** browser-exact geometry adapter |
| Browser Use | https://github.com/browser-use/browser-use | AI navigation and exploratory workflows | P1 benchmark vs existing agent/browser tools |
| Stagehand | https://github.com/browserbase/stagehand | AI-assisted browser actions/extraction | P1 benchmark head-to-head vs Browser Use; choose only if justified |
| Grounding DINO | https://github.com/IDEA-Research/GroundingDINO | Text-prompted object localization and bounding boxes | P0 visual fallback pilot, prove accuracy on UI screenshots |
| SAM 2 | https://github.com/facebookresearch/sam2 | Fine-grained image/video segmentation masks | P0 pilot for raster/photo/graphics; not a DOM replacement |
| PaddleOCR | https://github.com/PaddlePaddle/PaddleOCR | OCR, text boxes and document layout | P1 fallback only where native selectable text fails |
| tldraw | https://github.com/tldraw/tldraw | Interactive infinite canvas and object manipulation | P2 **source-available / production licensing review**, compare existing VAE Studio |
| Excalidraw | https://github.com/excalidraw/excalidraw | Open canvas/element interaction alternative | P2 benchmark editor fit and licensing |
| Fabric.js | https://github.com/fabricjs/fabric.js | Canvas object controls, transforms and editing | P2 lightweight image/graphic composition option |
| Konva | https://github.com/konvajs/konva | Interactive 2D canvas layers/selection | P2 editor benchmark |
| screenshot-to-code | https://github.com/abi/screenshot-to-code | Vision-to-front-end code and refinement patterns | P1 study architecture and test against VAE output; avoid replacing Creation Kernel |
| rrweb | https://github.com/rrweb-io/rrweb | DOM event recording/replay | P2 for owned/instrumentable sources and reconstructed apps |
| Pixelmatch | https://github.com/mapbox/pixelmatch | Pixel-level image diff algorithm | Low; existing VAE has pixel diff; benchmark only |
| SSIM libraries | https://github.com/obartra/ssim | Perceptual structural image comparison | Low; existing VAE measures SSIM |
| OpenCV | https://github.com/opencv/opencv | Feature matching, geometry, transform estimation, image processing | P1 optional for non-DOM assets, only if measured accuracy improves |
| sharp / libvips | https://github.com/lovell/sharp and https://github.com/libvips/libvips | High-speed image transforms and metadata | P1 check existing adapters before adoption |
| SVG.js | https://github.com/svgdotjs/svg.js | Manipulate editable vector objects | P2 evaluate for technical/marketing vector workflows |
| PDF.js | https://github.com/mozilla/pdf.js | PDF text geometry/render and document inspection | P1 document/slide visual mapping, compare existing document extraction |
| Docling | https://github.com/docling-project/docling | Structured document/page extraction | P1 reuse estate's existing research/corpus; do not re-create it |
| Tesseract OCR | https://github.com/tesseract-ocr/tesseract | Lightweight OCR fallback benchmark | P2 compare PaddleOCR cost/accuracy |
| axe-core | https://github.com/dequelabs/axe-core | Browser accessibility testing | P1 independent accessibility verification |
| Lighthouse | https://github.com/GoogleChrome/lighthouse | Site quality/performance/accessibility audits | P1 complementary operational quality evidence |
| Storybook | https://github.com/storybookjs/storybook | Component-state catalog and visual fixture harness | P1 strengthen existing VAE Storybook baseline |
| Figma plugin API | https://www.figma.com/plugin-docs/ | Optional design-source integration and node geometry | Optional, API ecosystem not an unrestricted OSS app |
| uiMatch (research) | https://github.com/kosaki08/uimatch | Figma/render alignment diagnostics | Experimental; research patterns only, validate project condition |
| OpenHands | https://github.com/All-Hands-AI/OpenHands | Autonomous coding-agent alternative | Optional evaluation only; do not add competing orchestrator without proven value |

**Decision principle:** a project can be a good source of patterns but a poor runtime dependency. Inspect API maturity, license, maintenance, security posture, deployment footprint, model licensing, benchmark quality, throughput and integration cost. Do not assume that model-weight rights follow code-license rights. Do not scrape or replicate protected/private material without permission; prefer original or properly licensed creative content and avoid deceptive reproduction of third-party brands.

## 8. Candidate integration placement
| VAE ownership | Proposed adapters | Deliverable |
| --- | --- | --- |
| Capture: `visual-reference-proof` adapter registry; `reference-layout-intelligence/dom-capture.mjs`; replica deep-style capture | A new CDP DOMSnapshot + accessibility-tree adapter registered via `registerCaptureAdapter()`; optional browser agent only for navigation | A marker-free DOM, style, coordinate and interaction inventory |
| Spatial layer: `reference-layout-intelligence` (`VisualScene`, `scene-normalize`, `region-match`) | VisualScene v2 = USSG: element nodes, frames, UNKNOWN class, stable ids | Cross-engine spatial contract (an extension, not a new package) |
| Asset Transformation (`asset-transformation` operation registry, `photo-intake`, `vector-intake`, `qwen-image-layered`) | Grounding DINO, SAM 2, OpenCV, sharp; optionally SVG manipulation. GPU models share the existing worker lane, whose real decompose is still PENDING | Identified/masked/editable assets with provenance, as new registry operations |
| Document / technical (`document-foundation`, `packages/vae-visual` elevation spec) | `pdf-render` / `svg-render` proof adapters (PLANNED slots); PDF.js, Docling, OCR fallback | Measured text, figures, and page geometry |
| Operator overlay (new; `studio` is a static catalog today) | A read-only version first, then a vetted canvas SDK | Select, inspect, replace, annotate, fuse |
| UI Experience / Creation Kernel | Existing design tokens/components plus studied screenshot-to-code patterns | Editable functional reconstruction |
| Visual QA / Evidence | Existing visual-reference-proof + axe-core, Lighthouse, Storybook and interaction tests | Reproducible independent technical + visual receipts |
| Learning: `measured-learning` (weight cap 0.2), `learning-receipt.mjs`, Visual Intelligence Graph, Intelligence Hub | Verified component, fix, pattern and matched-outcome evidence | Reusable successful intelligence |

No extra VAE MCP server per engine, no new permanent planner/orchestrator, and no browser framework proliferation. Existing execution tools should be extended through governed contracts. Review source files on canonical main before proposing any new package boundary.

## 9. Evaluation: measurable targets, not performance claims
These are **aspirational acceptance targets** for a selected benchmark, not verified VAE results:
- ≥95% measured coverage of **visible, inspectable elements** with confidence and reason codes for exclusions (do not use as universal guarantee).
- Strong visual similarity including per-region proof; explore ≥0.98 SSIM on controlled comparable captures **plus explicit element geometry, text and interaction metrics**. A single 98% number cannot hide meaningful local errors.
- 100% pass on benchmarked critical user flows; mobile, tablet and desktop (at least three responsive scenarios) plus important hover, menu, scroll and error states.
- No unverified business data, fake buttons, broken images, stale brand references, or missing provenance in approved output.
- Demonstrated reduction in human fixes, wall-clock delivery time, repeated defects, and compute cost per accepted page/artifact against current VAE and a straightforward baseline.
- Cross-media proof on at least one document, one marketing/image composition and one glazing or technical visual after browser proof.

Benchmark portfolio: permitted simple landing page; multi-section e-commerce page with cart, variants and replacement copy; dynamic dashboard; mobile-responsive site; image-only reference; complex document/report; branded marketing asset; technical elevation. Establish controlled references and legal asset rights, reproducible snapshots, data states, viewport/DPR and fonts. Compare with and without each expensive adapter, including cold and warmed cache, to avoid spurious ROI claims.

**Baseline first.** None of the targets above means anything until current VAE has been measured on the same benchmark. So the first measured run records today's numbers:
- region coverage;
- matched / unmatched counts on both sides;
- structure deltas;
- SSIM per region and tile;
- human fix count and wall-clock time.

Run it on the CG-Website storefront page (§2.2), and reuse main's existing claim vocabulary instead of inventing new labels:
- **Site replicas:** `pixelPerfectClaim` stays `FORBIDDEN_UNTIL_MEASURED`.
- **Raster reconstruction:** use `MEASUREMENT_CHAIN_VERIFIED` / `RECONSTRUCTION_MEASURED`.
- **Layout fidelity:** use VERIFIED / INFERRED.

A coverage percentage must state its denominator ("visible elements found by which adapter") and list exclusions by reason code.

## 10. Adaptive progression (not rigid release gates)
**Evidence-based dependency order**, with parallel work where helpful:
- **Discover:** read canonical VAE main and related estate capabilities; produce verified current-state inventory, overlapping functions, extension seams, license inventory and real-world failure examples. *Revision 2 did the first pass (§2.1–2.3). Remaining work: license inventory per §7 candidate, and confirming the inventory against main at mission start.*
- **Prove the differentiator:** one high-fidelity URL/screenshot → element-mapped scene graph → editable content/asset replacement → fully rendered functional site → repeatable visual proof. Extend present capabilities rather than rebuilding. Smallest sequence that reaches it from main, each step a separate PR with exact-value fixture tests:
  1. Encode the §2.3 lessons as tests, then run the baseline (§9) on the storefront page.
  2. Add the CDP DOMSnapshot capture adapter, then VisualScene v2 with element nodes, frames, UNKNOWN and stable ids.
  3. Extend `region-match` to element level (text wrap, style tokens) and keep the relational / measured authority split.
  4. Build the read-only inspector over the storefront capture.
  5. Implement one replacement operation end to end (image swap with focal-point-preserving responsive crop) through `asset-transformation`, then re-measure.
  6. Repeat on a second Capital Glass page to test reuse (§12 item 5).
- **Strengthen reference intelligence:** responsive state graph, semantic constraints, asset extraction, overlay workspace and multiple reference fusion as evidence shows value.
- **Industrialize learning:** independent QA, repair feedback, verified graph reuse, benchmark dashboards, failure signatures and regression protections.
- **Generalize:** document, presentation, raster/vector, marketing and glazing technical cases using the same shared contract with medium-specific adapters.
- **Optimize:** model/provider routing, expensive vision inference only where needed, parallel decomposition, caching, reliability and measurable cost/quality ratios.

Agents may reorder or parallelize work based on repo evidence and ROI. A completed slice should naturally trigger the next highest-value opportunity; no repeated manual planning or arbitrary one-task stop caps. Keep deployment/production/merge authority at its established boundary.

## 11. Failure modes to design against
- Assuming 8×8 is adequate to reconstruct 1,000 components.
- Extracting pixel coordinates without parent constraints or mobile behavior.
- Claiming DOM access where rendered content is cross-origin/canvas or protected.
- Treating screenshot likeness as functional correctness.
- Using masked regions to hide genuine layout differences.
- AI-generated measurements or subjective critic scores presented as deterministic proof.
- Parallel agents overwriting shared components or drifting on design tokens.
- Duplicating AppBuilder, browser agent, MCP or VAE quality gates.
- Silent publication of copyrighted third-party photos, fonts, logos, protected content or unauthorized brand replicas.
- Confusing code license with model weights or cloud-service terms.
- Replacing proven components merely to simplify architecture charts.
- Counting retrievals or PRs as evidence of compounding without matched improvements.
- Declaring complete based on a generated screenshot instead of deployed/accessible functional artifact and independent evidence.
- Joins that silently match nothing (an empty match set read as "no differences"), coordinates without a stated frame, specs calibrated from the page they judge, and tests whose expected values are derived from the code under test (all observed 2026-10-28, §2.3).
- Treating a self-check (reference vs. its own golden) as proof of a replica. Only a candidate build passing advances a claim.
- Adding a new MCP server or write tool where a pipeline script plus governed execution already serves; the root MCP stays read-only.

## 12. Evidence, review and completion contract
For each meaningful vertical slice record: reference identity and rights; target browser/device/state; spatial capture and provenance; implementation owner/commit; before/after screenshots and region/element metrics; detected and resolved errors; independent interaction, accessibility and responsive tests; resource/time/cost; decision to retain/reject new adapter; reusable validated knowledge and downstream consumer effects. Failures must remain visible.

Strategic completion requires a live demonstration (in a governed non-production environment) showing:
1. An operator enters an authorized site URL, sees selectable measured element bounds and semantics.
2. Agent reconstructs the site, swaps all designated brand imagery/text, and preserves intended layout relationships at desktop and mobile sizes.
3. A working, genuinely tested flow (e.g. product selection/cart or comparable use case) executes correctly.
4. VAE reports explainable regional and component-level differences and agents iteratively correct them.
5. A second example proves reuse with lower work/time/cost or better quality; retained learning is demonstrably influential.
6. A document or creative/technical visual proves the spatial intelligence is **not website-only**.
7. Actual main-branch integration is cited and verified independently; no invented pass score, fabricated availability, or implicit production deployment.

## 13. Operator-friendly mission handoff to Cursor
**Execute as an autonomous strategic mission in the canonical VAE repository.** Begin by verifying current BlackBoxCompute main and inventorying existing VAE/browser/visual capabilities; compare this plan to what actually exists. Do not immediately install all candidates or duplicate mature modules. Select the smallest proven integration set that demonstrates full element-level reference reconstruction; independently choose internal designs, experiments, tests, task delegation and optimizations. Prefer Cursor as mission lead, with Claude directed by Cursor where appropriate. Preserve visual authority boundaries and existing business functionality. Continue measured construction, testing, evaluation, correction, reuse and further valuable improvements. Publish implementation receipts in owning repos and concise progress/handoff references in Cross Agent; separate proposals, deployed features and verified outcomes.

**Execution facts on canonical VAE (2026-10-28):**
- VAE `agent/*` branches get no CI. Main runs local-actions `test-and-gates` and `visual-graph-authority` on a broker-materialized clone after merge. Run the same step list locally before asking for a merge.
- Toolbox tests pin registry counts (`scripts/tests/run-vae-toolbox-v1.test.mjs`). A new MCP tool, capability or npm script must be registered in `registry/` and the counts updated in the same PR.
- The VAE MCP runs from the host dev checkout. "Deployed" means that checkout is at the merged main SHA, and it is verified by calling the tool, not by the merge alone.
- Consumer pages (CG-Website) belong to their repo; production release there needs the owner's approval (`docs/GO_TO_MARKET_PAUSE_V1.md`).

**Working north star:** One VAE. One universal spatial intelligence substrate. Multiple specialist engines. Reference-driven reconstruction is the first demanding proof, not the product's sole purpose.
