# Replace circular aura with custom blob SVG shape

## Goal
Swap the current `<div>` circular aura in `Hud.tsx` for an SVG using the polygon shape exported from Blender (`Plane.svg`), keeping the same fade/scale animation behavior.

## Steps

**1. Add the shape as a project asset**
- Copy `user-uploads://Plane.svg` to `src/assets/aura-shape.svg` (so it's bundled).
- Actually, since we need to apply a blur filter and theme-aware fill, we won't `<img>` it — we'll inline the polygon points in JSX. Store the points in a constant inside `Hud.tsx` (or a sibling file `src/components/auraShape.ts`) to keep `Hud.tsx` readable.

**2. Replace the aura div in `Hud.tsx`**
- Remove the existing blurred circular `<div>`.
- Insert an `<svg>` in the same spot with:
  - `viewBox="0 0 1024 1024"`, `preserveAspectRatio="none"` so it stretches to wrap nav text proportions.
  - A `<filter>` with `<feGaussianBlur stdDeviation="14">` (tunable) for the soft edge.
  - The `<polygon points="...">` from the upload, with `fill="hsl(var(--background))"`, `stroke="none"`, and `filter="url(#auraBlur)"`.
- Wrap the SVG in absolute positioning with the same `pointer-events: none`, `-z-10`, and the same `transform` / `transition` / `transitionDelay` logic as today (so it slides + scales in/out tied to `effectiveMenuOpen`).

**3. Size and position to wrap the nav with ~15px gap**
- Measure nav text bounding box at current font size (plus glyph): ~110px wide × ~95px tall at the small viewport. Add 15px gap → target ~140px × 125px painted area.
- Account for blur bleed (~28px each side) → SVG box ~200px × 185px.
- Set top/left negative offsets so the blob's visual center sits over the nav text center. Concretely: `top: -45px; left: -50px; width: 200px; height: 185px;`.
- Keep `transformOrigin` near the glyph (top-left area) so the open/close scale animation feels anchored to `+`/`−`, matching current behavior.
- Values are tunables — easy to adjust after seeing it live.

**4. Keep theme reactivity**
- `fill="hsl(var(--background))"` ensures it auto-updates with the dark/light toggle.

## Technical notes
- Inlining the polygon (vs `<img src>`) is required because:
  - We need the fill to read a CSS variable (theme-aware).
  - We need to apply an SVG `<filter>` for blur (CSS `filter: blur()` on an `<img>` would also work but blurs the whole rendered raster; SVG filter on the shape itself is cleaner and crisper).
- `preserveAspectRatio="none"` lets us reshape the blob to better wrap the text column without redrawing the path.
- No changes to `Gallery.tsx`, `Index.tsx`, or styling tokens.
- Update `.lovable/plan.md` with one line noting the aura shape switched from CSS circle to SVG polygon.

## Tunables after first render
- `stdDeviation` (blur softness)
- SVG width/height/top/left (gap from text)
- `transformOrigin` (where it scales from)
