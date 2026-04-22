

## Goal
Replace the current crossfade between the gallery and the item inspect view with a "shared element" transition: the clicked image animates from its gallery position/size to its inspect position/size, while the other gallery items (and HUD nav) fade out. The reverse happens on back.

## Is it possible?
Yes. This is a classic FLIP (First, Last, Invert, Play) animation. We measure the clicked image's bounding rect, mount the inspect view, measure the target image's bounding rect, then animate the difference (translate + scale) on a single shared element. The description toggle is handled by measuring the target rect *after* the inspect view mounts, so whatever vertical offset the description introduces is automatically included.

Note about description state on **return**: when the user opens the description in inspect view, the image shifts upward. On back, we animate from that current (shifted) position back to the gallery slot. That works correctly with FLIP — we always measure live rects, never assume center.

## Behavior

**Forward (Gallery → Inspect):**
1. User clicks image. Capture its `getBoundingClientRect()` (the "FROM" rect).
2. Other gallery images + HUD nav items fade out (74ms), clicked image stays put.
3. Mount the inspect view with the target image **invisible** (opacity 0) so we can measure where it *will* be.
4. Read the target image's rect (the "TO" rect).
5. Apply an inverse transform to the target image so it visually appears at the FROM rect, then animate `transform: none` over ~300ms (ease-out). Hide the original gallery image during this animation.
6. After animation: clear transforms, reveal everything normally. HUD `+` has already morphed into the back arrow (existing behavior preserved).

**Back (Inspect → Gallery):**
1. User clicks back arrow. Capture inspect image's current rect (FROM — accounts for description-open offset).
2. Render gallery underneath (still hidden), measure the target gallery slot rect (TO).
3. Animate the shared image from FROM to TO over ~300ms.
4. Other gallery images + HUD nav fade back in during the same window.
5. After animation: restore normal gallery state, scroll position preserved (already implemented).

## Edge cases handled
- **Description open on return**: FROM rect is measured live, so the upward shift is the natural starting point.
- **Variation cycled in inspect**: the displayed image may differ from the gallery thumbnail. We animate using the *gallery* image source on the way back (snap variation back to index 0 visually, or animate the current variation back — see decision below).
- **Scroll position**: already restored via existing `scrollPosRef`.
- **Hover scale on gallery image**: temporarily disabled during the animation to avoid jitter.
- **Resize / mid-animation interrupt**: cancel any in-flight animation and snap to end state if the user clicks back during forward (or vice versa).

## One small decision needed
When returning from inspect, the user may have cycled to variation #3. Two options:
- **A**: Animate variation #3 shrinking back into the gallery slot, then swap to the gallery thumbnail after landing. Smoother visually.
- **B**: Snap back to variation #0 instantly, then animate. Simpler, but a visible flash.

Recommendation: **A**.

## Files to change
- `src/components/Gallery.tsx` — capture FROM rect on click; coordinate fade-out of non-selected items via a new `selectedId` state; expose a ref to the clicked `<img>` for measurement; add a "back animation" path that takes a target rect from the parent.
- `src/components/ImageViewer.tsx` — accept an optional `initialRect` prop; on mount, measure target rect, apply inverse transform, then animate to identity. Expose current image rect via callback or ref for the back transition.
- `src/pages/Index.tsx` — orchestrate the shared-element handoff between Gallery and ImageViewer (pass rects between them), keep HUD `+`→back morph timing aligned (HUD nav fades over 74ms; image morph runs ~300ms in parallel).
- HUD nav items keep current 74ms fade. Theme toggle stays persistent (already implemented).

## Technical notes
- Use `transform: translate(dx, dy) scale(s)` + `transform-origin: top left` for the FLIP math. Single `requestAnimationFrame` to flush the inverse transform before kicking off the transition.
- Use the Web Animations API (`element.animate(...)`) so we can `await finished` and reliably clean up — avoids fighting React's render cycle.
- Duration: 300ms ease-out for the shared image (feels like motion, not a flash). Non-image fades stay at 74ms so surrounding chrome clears quickly and the image motion reads cleanly.
- No new dependencies.

## Out of scope
- No design/content changes.
- Theme toggle, HUD morph, description toggle, variation cycling all keep current behavior.

