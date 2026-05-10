## Plan

Replace the current SVG-filter experiment with a more controllable construction:

1. **Keep the original shape fully solid**
   - Render the existing `AURA_POINTS` polygon as the top layer with no blur and no filter.
   - This remains the exact non-blurry shape you already approved visually.

2. **Create the 55px outer blur as its own layer**
   - Add a second SVG layer behind the crisp polygon.
   - Instead of blurring the original polygon directly, use an SVG mask/gradient-style halo so the fade starts outside the original edge rather than eating into it.
   - The crisp polygon will cover any inner part of the halo, so the visible result is: solid shape first, blur only outside.

3. **Make the blur easier to tune**
   - Put the key numbers at the top of `Hud.tsx`, for example:
     - `HALO_SCREEN_PX = 55`
     - `HALO_STRENGTH`
     - `HALO_SOFTNESS`
   - This makes future adjustments simple instead of repeatedly guessing raw filter values.

4. **Only touch the HUD aura code**
   - No nav text changes.
   - No page/layout/theme changes.
   - No image/gallery behavior changes.

## Technical approach

The current `feMorphology + feGaussianBlur` still depends on browser SVG filter behavior and scaling, which makes the visible edge hard to control.

The replacement will use layered SVG rendering:

```text
[top]    original polygon, crisp, background-filled
         exact desired solid silhouette

[behind] separate expanded/soft halo layer
         visible only outside because the crisp polygon sits over it
```

If the mask-based halo still does not produce the exact feel, the fallback is to use multiple duplicated polygons behind the crisp shape, each slightly scaled outward with decreasing opacity. That creates a predictable 55px fade band without relying on SVG blur semantics.