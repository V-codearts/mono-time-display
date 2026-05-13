## Goal

Inspect mode (`ImageViewer`) gets a new `+/−` glyph and a description block below the image. The image's top edge is pinned; the image only shrinks (uniformly) to make room. On mobile only, the image may also slide upward (as little as needed) before shrinking, capped at top = 81px.

## New inspect-only glyph

A second `+/−` glyph is rendered inside `ImageViewer`, horizontally centered (same column as the image center).

- **Info hidden (`+`):** vertical-centered between the image's bottom edge and the screen's bottom edge.
- **Info revealed (`−`):** sits exactly one Roboto Mono line-height below the image's bottom edge. The description rows follow, each separated by one line-height (matching the HUD nav rhythm).
- Click toggles between hidden/revealed. No animation for now — instant.

The HUD's existing top-left `+/−` is unchanged.

## Sizing rules

Let `LH` = Roboto Mono line-height at base size. Let `rows` = `description.split('\n').length`. Let `infoH` (height the image must reserve below it when info is revealed) =

```
infoH = LH      // gap above the −
      + LH      // the − itself
      + rows*LH // description rows
      + (rows-1)*LH // gaps between rows
```

When info is **hidden**, `infoH = 0`.

**Desktop / tablet (`md+`)**
- Image top: pinned at the natural centered position computed when there is no info block (i.e. centered within the viewport assuming `infoH = 0`). It does not move when info toggles.
- Image bottom = top + height. Constrain `maxHeight` so `top + height + infoH ≤ viewportH`. Image only shrinks; it never grows downward.

**Mobile (`< md`)**
- Same pinned baseline top as desktop/tablet. When info is revealed, if the image overflows, first slide top upward by exactly the overflow amount, but no further than `top = 81`. If 81px is reached and there is still overflow, shrink `maxHeight` to make the rest of the room.
- Move only as much as needed; if no shrinking or moving is required, leave the image where it is.

**Both**
- `object-contain` preserves aspect ratio (only `maxHeight` is constrained).
- All transitions instant; recompute on resize, on info-toggle, and on variation change.

## Info text

- Source: `image.description`, split on `\n`.
- Style: Roboto Mono, uppercase, default text size (matches HUD nav items), centered horizontally under the image, `currentColor` on `--foreground`.
- Each row separated by one line-height (`leading-normal` with `mt-[1lh]` or equivalent fixed gap).

## Implementation (file-scoped)

Edit only `src/components/ImageViewer.tsx`:

1. Add `infoOpen` state (default `false`).
2. Compute layout in a `useLayoutEffect` keyed on `[infoOpen, image, viewportW, viewportH, isMobile]`:
   - Read `LH` from a hidden measurement span (one Roboto Mono char).
   - Compute `naturalTop` (centered position with `infoH=0`) and `infoH`.
   - Derive `imageTop` and `imageMaxHeight` per the rules above.
3. Replace the current `flex items-center justify-center` wrapper with an absolutely-positioned image container using the computed `top` / `maxHeight` (keep existing `max-w-[…]` rules for HUD-symmetric horizontal insets).
4. Render the new `+/−` glyph absolutely at `top = imageBottom + LH` (when open) or `top = (imageBottom + viewportH) / 2` (when closed), `left: 50%; translateX(-50%)`, with click handler toggling `infoOpen`.
5. Below the glyph, render the description rows when `infoOpen` is true.
6. Apply the same computed `maxHeight`/`top` to the swipe `incomingImg` so swipes don't snap.
7. Recompute on `window.resize` and after image `load` (in case decoding changes nothing here, but safe).

No changes to `Gallery.tsx`, `Hud.tsx`, `Index.tsx`, or anything else. The Gallery↔Viewer FLIP picks up the new size automatically because it re-measures the viewer image.

## Out of scope (deferred)

- Animations / transitions for the resize and glyph movement.
- Per-image hitbox behavior on the HUD nav.
- Any change to gallery thumbnails or the top-left HUD.
