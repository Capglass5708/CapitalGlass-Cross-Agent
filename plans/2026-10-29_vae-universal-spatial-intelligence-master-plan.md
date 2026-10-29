# VAE Universal Spatial Intelligence — Master Strategic Plan
**Mission ID:** VAE-USI-20261029  
**Date:** 2026-10-29  
**Status:** PROPOSED — strategy and research brief, not implementation or verified performance  
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

**Not verified:** the present contents of `BlackBoxCompute/Visual-Asset-Engine` main could not be read during planning. Cursor must inspect the canonical repository before claiming any gap remains or proposing a replacement. The 2026-07-19 autonomy review in the legacy repository identified early weak quality gates and autonomous correction; it is historical, **not** a current performance rating.

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

### 4.3 Responsive and temporal model
Capture desktop/tablet/mobile and meaningful intermediate widths; derive constraints (grid, flex, max-width, stacking, wrapping, sticky/fixed, visibility). Use multiple scroll positions, hover/focus/menu/cart states, and selected time/animation frames. Build layouts from relationships and design tokens, **not thousands of absolute pixel placements**.

## 5. Core user-facing experiences
### Reference Inspector overlay
An operator places a VAE overlay on an authorized reference, hovers/selects any identifiable asset, and sees exact sourced x/y/w/h, CSS/document frame, typography, colors, parent group, neighboring constraints, image crop, source confidence, responsiveness, behavior and interactive states. Allow multi-select, named regions, zoom, compare view, missing-node reporting, design comments and direct replacement instructions.

### Reconstruct / Rebrand / Fuse / Evolve
1. **Replica:** high-fidelity authorized reproduction of a site/page or media asset.
2. **Rebrand:** retain intended composition while replacing photographs, logos, fonts/colors, products, text and links.
3. **Fusion:** header from A, hero from B, product grid from C, editorial treatment from D, with a coherent unified component system and explicit source traceability.
4. **Evolution:** improve usability, accessibility or conversion beyond a reference; require independent measured tests and clearly separate exploratory hypotheses from demonstrated improvement.

### Asset replacement
Selected image → replace while maintaining bounds, focal point, aspect and responsive crop; selected text → rewrite while respecting natural reflow, font metrics, wrapping and accessible semantics; selected button → change content, action, hover/focus state and destination; selected gallery/card → replace data, variants, sorting and links. Replacements must preserve editable ownership and must not require re-rasterizing an entire page.

### Functional website reconstruction
Map and verify navigation, menus, search, filters, product variants, add-to-cart, forms, validation, checkout handoff and other observed paths. Never assert backend function from appearance alone. Third-party payment/auth or protected services require genuine authorized integration rather than imitation.

### Cross-media reuse
The same spatial intelligence should enrich proposal covers, reading-flow documents, presentations, ad compositions, raster/vector manipulation, storefront/curtainwall elevations, dimensioning and annotated drawing layouts. Do not impose website-specific DOM assumptions on PDF or technical geometry.

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
| Canvas Intake / UI Intelligence | Playwright + CDP; optional selected browser agent | Captured DOM/style/coordinate/interaction inventory |
| Universal shared spatial layer | Scene graph + coordinate transforms + hierarchical regions | Cross-engine spatial contract |
| Asset Transformation | Grounding DINO, SAM 2, OpenCV, sharp; optionally SVG manipulation | Identified/masked/editable assets with provenance |
| Document / technical visualization | PDF.js, Docling, OCR fallback | Measured text, figures, and page geometry |
| Studio / operator overlay | Existing Studio or vetted canvas SDK | Select, inspect, replace, annotate, fuse |
| UI Experience / Creation Kernel | Existing design tokens/components plus studied screenshot-to-code patterns | Editable functional reconstruction |
| Visual QA / Evidence | Existing visual-reference-proof + axe-core, Lighthouse, Storybook and interaction tests | Reproducible independent technical + visual receipts |
| Visual Intelligence Graph / Intelligence Hub | Verified component, fix, pattern and matched-outcome evidence | Reusable successful intelligence |

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

## 10. Adaptive progression (not rigid release gates)
**Evidence-based dependency order**, with parallel work where helpful:
- **Discover:** read canonical VAE main and related estate capabilities; produce verified current-state inventory, overlapping functions, extension seams, license inventory and real-world failure examples.
- **Prove the differentiator:** one high-fidelity URL/screenshot → element-mapped scene graph → editable content/asset replacement → fully rendered functional site → repeatable visual proof. Extend present capabilities rather than rebuilding.
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

**Working north star:** One VAE. One universal spatial intelligence substrate. Multiple specialist engines. Reference-driven reconstruction is the first demanding proof, not the product's sole purpose.
