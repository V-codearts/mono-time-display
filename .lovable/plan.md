## Step 1: Add unclickable plus in ImageViewer

Add a single `+` glyph inside `src/components/ImageViewer.tsx`, positioned in the vertical center of the space between the bottom edge of the image and the bottom edge of the screen. Nothing else — no click handler, no hover, no logic.

### Approach

The image is wrapped in a centered flex container with `max-h-[80vh]`. The space below the image (between image bottom and viewport bottom) varies with image aspect ratio, so we anchor relative to the image's container, not the viewport.

- Wrap the existing image container so we can place a sibling absolutely positioned below the image.
- The plus sits in a `div` absolutely positioned with `top: 100%` of the image box, then translated down by half the remaining viewport space.

Simplest reliable implementation: place the `+` as a `position: fixed` element at the bottom of the screen, vertically centered in the gap below the image. Since the image container is centered and capped at `max-h-[80vh]`, the bottom gap is at least ~10vh. We compute it via CSS:

```tsx
<div
  aria-hidden="true"
  className="fixed left-1/2 -translate-x-1/2 text-xl pointer-events-none select-none text-foreground"
  style={{ bottom: 'calc((100vh - min(80vh, 100vh)) / 4)' }}
>
  +
</div>
```

Since the image's actual rendered height depends on its aspect ratio (it can be shorter than 80vh), a more robust approach is to measure the image's bounding rect after layout and position the `+` at the midpoint between `imgRect.bottom` and `window.innerHeight`. Use a `useLayoutEffect` + `ResizeObserver` + window resize listener to update a `bottomGapCenter` state.

### Behavior

- Visible only in item inspect view (already the scope of `ImageViewer`).
- `pointer-events-none`, no `onClick`, no hover state — fully inert.
- Uses existing `text-foreground` token, same `text-xl` size as the HUD glyph for visual consistency with the existing `+`.
- Matches font (Roboto Mono, all caps inherited from parent).

### Files

- `src/components/ImageViewer.tsx` — add the plus element + measurement effect.

Nothing else changes. No HUD changes. No interaction. No additional features.
