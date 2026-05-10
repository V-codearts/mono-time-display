## Goal
Keep the original aura polygon fully crisp at its drawn edges, and extend a 55px soft blur **outward** from those edges (not inward).

## Approach: dilate-then-blur filter

Currently we blur the shape directly, which eats into the silhouette (erodes inward ~3×stdDeviation). We'll instead pre-grow the shape with `feMorphology operator="dilate"` and then blur that grown version. Layered behind the crisp polygon, the result is:

- Crisp polygon = exactly the original shape, sharp edges.
- Blurred halo = extends ~55px beyond those edges, fading to 0.

```text
   ┌─ crisp polygon (top layer) ──┐
   │   original AURA_POINTS       │
   └──────────────────────────────┘
          ▲ sits on top of ▼
   ╔═ blurred halo (bottom layer) ═╗
   ║  dilate(r) → gaussianBlur(σ)  ║
   ╚═══════════════════════════════╝
```

## Steps (in `src/components/Hud.tsx`)

1. Replace the single `auraBlur` filter with one that does:
   - `<feMorphology operator="dilate" radius="R">` to grow the silhouette so the blur's outer reach lands ~55px past the original edge.
   - `<feGaussianBlur stdDeviation="σ">` to soften it.
2. Keep both polygons:
   - Bottom polygon: `filter="url(#auraBlur)"` (the halo).
   - Top polygon: no filter (the crisp shape, identical points).
3. Filter region stays generous (`x="-50%" y="-50%" width="200%" height="200%"`) so the halo isn't clipped.

## Picking the numbers

The SVG is rendered at ~128px wide from a 1024 viewBox → scale factor ≈ 0.125 (screen px per viewBox unit). To get a 55px-wide outward soft band on screen we work in viewBox units (~440 units total reach beyond the edge).

Starting values to try, tunable on first render:
- `feMorphology radius="120"` (grows silhouette outward — its outer edge then coincides roughly with where the blur should be at half-intensity)
- `feGaussianBlur stdDeviation="80"` (soft falloff; blur reaches ~3σ ≈ 240 viewBox units ≈ 30px on screen past the dilated edge, total outward reach ≈ 55px)

These two knobs trade off: dilate controls how far the haze pushes out before it starts fading; blur controls how soft that fade is. We'll adjust after seeing it live.

## Technical notes

- `preserveAspectRatio="none"` is kept, so dilate/blur radii are isotropic in viewBox units but will look slightly squished/stretched on screen — acceptable for a soft halo.
- No changes to nav text, animation, theme tokens, or any other file.
- Only `Hud.tsx` is touched.

## Tunables after first render
- `feMorphology radius` (how far the haze reaches before fading)
- `feGaussianBlur stdDeviation` (softness of the fade)
