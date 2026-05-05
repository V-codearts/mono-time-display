# Nav Menu Aura

Add an invisible "aura" behind the top-left nav menu that masks any image pixels passing under it, with soft blurred edges so the cutoff is fady, not hard.

## How it works
- A fixed-position blob sits behind the nav text (z-index between gallery and menu text).
- Filled with `hsl(var(--background))` so over empty page area it's invisible (matches bg). Over an image, it punches the image out in that region.
- `filter: blur(18px)` gives soft, fady edges.
- `pointer-events: none` so it never blocks clicks.
- Hidden when `inspecting` (fade out).

## Changes

**`src/components/Hud.tsx`**
- Add a new `<div>` as the first child inside the top-left fixed wrapper (before the glyph), absolutely positioned to cover the glyph + menu items area.
- Styles: `position: absolute`, negative insets (~`-40px` top/left, extending ~`220px` wide × `160px` tall to cover COLLECTION/ABOUT/OTHER plus hover-scale headroom), `background: hsl(var(--background))`, `border-radius: 9999px`, `filter: blur(18px)`, `pointer-events: none`, `z-index: -1` (behind text but in front of gallery via the parent's `z-50` stacking context), `opacity: inspecting ? 0 : 1`, transition opacity ~200ms.
- Nav text spans get `position: relative` so they paint above the aura within the same stacking context.

**`src/components/_disabled/HudCollisionHide.md`**
- Add a note at the top: "Superseded by the blurred aura approach (currently active in Hud.tsx). Restore this only if collision-hide is preferred over masking."

## Tunables (easy to adjust later)
- Aura size (width/height/inset)
- Blur radius (softness of edges)
- Shape (pill vs ellipse vs rounded rect)
