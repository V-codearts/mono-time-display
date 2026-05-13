# Image Viewer — Info Toggle

Add a "+" button centered below the inspected image. Clicking it morphs to "−", shrinks the image and shifts it upward, then fades in placeholder info text below. Clicking "−" reverses everything. Layout matches the six reference screenshots pixel-for-pixel across desktop / tablet / mobile.

## Behavior

- Default (collapsed): image at current size/position, "+" centered below it.
- Revealed: image scales down (~70%) and translates upward so its bottom sits roughly at viewport center; a small "−" mark appears just below the image; five placeholder lines fade in beneath, vertically stacked and centered.
- Toggle morph: "+" ↔ "−" cross-fades in place, same style as the existing nav glyph (~180ms).
- Image cycling stays active in both states (clicking the image still swipes to the next variation).
- Only the "−" toggle collapses info — clicking the image does not collapse.
- Top-left back arrow `<` and top-right theme dot remain unchanged in both states.

## Placeholder copy (5 lines, ALL CAPS, Roboto Mono)

```
INFO TEXT
EXAMPLE
100% TEXT
LOREM IPSUM
BLAH BLAH
```

Wired so we can later swap to per-image content without touching layout.

## Responsive sizing

Reference shows the same composition on every breakpoint, just rescaled. Use the existing image max-width tiers (`max-w-[calc(100vw-96px)] md:max-w-[calc(100vw-120px)] lg:max-w-[80vw]`) and apply a uniform CSS transform for the shrink+lift, so it scales naturally on every device.

## Technical notes (file-level)

- `src/components/ImageViewer.tsx`
  - New state `infoOpen: boolean`.
  - Wrap the image stack in a transform container: `translate-y` + `scale` transitions (~300ms ease-out) driven by `infoOpen`.
  - Add a fixed-position toggle button centered horizontally (`left-1/2 -translate-x-1/2`), positioned just below the image area. Reuse the +/− cross-fade pattern from `Hud.tsx` (two absolutely-stacked spans, opacity-swapped over `MORPH_MS`).
  - Below the toggle, render an info block (small "−" rule + 5 stacked `<p>` lines) with `opacity` + small `translate-y` transition tied to `infoOpen`. `pointer-events-none` when closed.
  - Keep existing variation-cycling click handler on the image untouched.
- No changes to `Hud.tsx`, `Index.tsx`, or routing — the back arrow already exists in inspect mode.
- No new assets, no design tokens added; uses existing `text-foreground` / `text-muted-foreground` and font-mono.
