## Goal
Eliminate the dark-mode flash during page transitions by keeping the background truly static and only fading the content (text, items, images) on top of it.

## Root cause
Each page component wraps itself in its own `bg-background` layer:
- `src/components/Gallery.tsx` (line 329)
- `src/pages/About.tsx` (line 35)
- `src/components/ImageViewer.tsx` (line 306)

These wrappers sit inside the fading `<div style={fadeStyle}>` in `Index.tsx`. When the wrapper fades to partial opacity, its `bg-background` fades along with it. Even though there is a fixed `bg-background` layer behind, the global `transition: background-color 0.5s` rule in `index.css` (applied to `*`) animates the color of every element, which combined with the opacity fade produces the perceived darker frame in dark mode.

## Fix
Remove the `bg-background` class from the three page-level wrappers so the fixed layer in `Index.tsx` is the sole source of background color. The fading wrappers will then only contain text and items — exactly what the user described.

### Changes
1. `src/components/Gallery.tsx` line 329 — drop `bg-background` from the root wrapper class list (keep `text-foreground font-mono min-h-screen`).
2. `src/pages/About.tsx` line 35 — same removal.
3. `src/components/ImageViewer.tsx` line 306 — same removal.

No other code, layout, or behavior changes. The fixed `bg-background` layer already added in `Index.tsx` provides the background at all times, so visually nothing else moves.

## Notes
- Archive uses Gallery's ImageViewer, so it is covered automatically.
- Theme toggling still works because the fixed layer uses the same `bg-background` token.