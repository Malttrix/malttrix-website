# V12 implementation

Implemented locally; not deployed. Browser visual QA remains outstanding because the browser rejected the local preview address with ERR_BLOCKED_BY_CLIENT.

- Four primary links: Ecosystem, Capabilities, Philosophy, Founder. Principles content retained immediately after Philosophy.
- Warm glass navigation; original header/footer artwork preserved. Full header lockup remains at the brand guide's 240px minimum. Mobile no longer clips a synthetic symbol out of that artwork.
- Uploaded master converted to 90,000-triangle desktop GLB (2,803,016 bytes) and 35,349-triangle mobile GLB (897,644 bytes). Master upload unmodified.
- Branded vertex colour gradient and physical clearcoat/iridescence material. Object hover, slight right-facing rotation and scroll depth; no skeletal wing animation is claimed or provided.
- Five-phase Philosophy sequence and sparse portrait-only 2D constellation.
- Pause/reduced-motion support, offscreen suspension, hidden-tab suspension, GLB failure fallback and WebGL context recovery.
- Existing SVG remains the static fallback; it is the earlier stylized bird, not a render of the new model.

## Checks

Run `node scripts/test-v12.cjs` from the project directory. Checks JavaScript syntax, GLB loading through the runtime reader, normals/colours, desktop/mobile asset selection and triangle budgets, pause/resume, reduced-motion, model fetch failure, context recovery and founder content preservation. These are mocked-renderer tests, not GPU or browser visual validation.

For local visual review, run `python3 -m http.server 8091` and open the local address. Check desktop, 390px and 320px widths, both languages, Philosophy scrolling, mobile menu, particle visibility and reduced-motion before publishing. No Firebase, deployment or remote GitHub settings were modified.

## Asset reproduction

`python3 scripts/prepare-hummingbird.py /path/to/base.glb`

Dependencies: numpy, trimesh, fast-simplification. The runtime reader intentionally supports only the generated single-mesh, uncompressed GLBs; replace it with a full loader if using arbitrary future glTF assets.
