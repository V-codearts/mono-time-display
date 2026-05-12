## Goal

On mobile and tablet (vertical) viewports, make the horizontal gap between each collection image edge and the page edge mirror the gap between the HUD element's center and its nearest page edge. So if the HUD dot's center sits 24px from the right page edge, the image's right edge should also sit 24px from the dot's center — i.e. 48px from the page edge.

## HUD element positions (from `Hud.tsx`)

- Right dot: `w-3 h-3` (12px), `right-[18px]` mobile / `right-[24px]` tablet+.
  - Center → page right edge: **24px mobile**, **30px tablet+**.
- Left +/− glyph: `text-xl` (~12px wide), `left-[18px]` mobile / `left-[24px]` tablet+.
  - Center → page left edge: **~24px mobile**, **~30px tablet+** (approx; glyph char width close to the dot's 12px).

Both sides are effectively symmetric, so a single horizontal page-side inset can be applied to both image edges.

## Required image insets (page edge → image edge)

- Mobile: 2 × 24px = **48px** on each side → image max-width = `100vw - 96px`.
- Tablet (`md`): 2 × 30px = **60px** on each side → image max-width = `100vw - 120px`.
- Desktop (`lg`): leave the current `80vw` rule untouched (user only mentioned mobile + tablet).

## Change

In `src/components/Gallery.tsx`, replace the current image className:

```
max-w-[calc(80vw-16px)] max-h-[calc(80vh-16px)]
md:max-w-[calc(80vw+28px)] md:max-h-[calc(80vh+28px)]
lg:max-w-[80vw] lg:max-h-[80vh]
```

with:

```
max-w-[calc(100vw-96px)]  max-h-[80vh]
md:max-w-[calc(100vw-120px)] md:max-h-[80vh]
lg:max-w-[80vw] lg:max-h-[80vh]
```

Vertical max-height stays at `80vh` (the user didn't ask to change vertical sizing, and `object-contain` will letterbox if the image is portrait). No other files need to change.

## Notes / assumptions

- I'm treating the `+/−` glyph as roughly 12px wide (matching the dot) so left/right insets stay symmetric. If the glyph ends up visibly off-center vs. the dot, we can pin the left inset separately with a small offset.
- This supersedes the earlier "shrink mobile −16px / grow tablet +28px" tweak, since that's now expressed by the new symmetric rule.
