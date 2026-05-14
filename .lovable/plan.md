## The cause

Both the left glyph (`+`) and the right theme dot use the same 600ms duration and easing, so the timing curve is identical. The asymmetry comes from **distance**, not timing.

In `src/components/Hud.tsx`:

- The right dot is wrapped in its own fixed element (12px wide). Its off-screen transform is `translateX(calc(100% + 24px))` ≈ **36px** of travel.
- The left glyph shares its fixed wrapper with the menu items (`COLLECTION`, `MORE`). That wrapper's width is the width of its widest child — `COLLECTION`, which is roughly **110–130px**. Its off-screen transform is `translateX(calc(-100% - 24px))` ≈ **135–155px** of travel.

Same duration + ~4× the distance → the glyph is still far off-screen while the dot is already mostly home, and it only crosses the visible edge late in the animation. That's the "appears a tad bit later" effect.

The menu items themselves also use `calc(-100% - 24px)` on the same wrapper, but they're staggered intentionally and slide separately, so they aren't the issue.

## Fix

Decouple the glyph from the menu wrapper so its travel distance matches the dot.

Two equally simple options:

1. **Wrap the `+ / − / <` glyph in its own `fixed` element** (sibling to the menu items wrapper) and give it the same off-screen transform pattern as the dot: `translateX(calc(-100% - 24px))` on a small ~12px box. This makes the two corners visually symmetrical (~36px travel each).
2. **Use a fixed pixel offset** (e.g. `translateX(-40px)` for the glyph and `translateX(40px)` for the dot) instead of percent-based math. Slightly less responsive-friendly, but the simplest one-line change.

Recommended: option 1 — keeps the percent-based pattern consistent with the dot, and leaves the menu items' existing stagger animation untouched.

## Technical details

In `src/components/Hud.tsx`:

- Split the current top-left fixed container into two siblings:
  - A small fixed element at `top-[9px] md:top-[15px] left-[18px] md:left-[24px]` containing only the glyph span; apply the `entering` transform here with `translateX(calc(-100% - 24px))`.
  - The menu items wrapper (`COLLECTION`, `MORE`) positioned just below it (e.g. via `top` offset or by keeping the parent layout but moving the entering transform off the parent). The menu items keep their existing per-item stagger transforms unchanged.
- Leave the right-side dot exactly as it is.
- Keep `ENTER_MS` and `ENTER_EASE` identical for both corners.

No behavior changes elsewhere; menu open/close, inspect mode, and back-arrow morph all stay the same.
