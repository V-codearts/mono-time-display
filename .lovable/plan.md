## Correction

You are right. Removing `overflow-hidden` is not acceptable and should not be considered again.

The problem in the drawing is not that the viewport is clipped. The problem is that the clipped viewport layer itself is being moved.

That means anything below the visible screen is already cut away before the slide starts, so when the page slides upward, the lower part of the image cannot appear. It slides as an incomplete picture.

## Actual fix

Keep `overflow-hidden` on the viewport transition container.

But do not animate the clipped container.

Instead:
- keep one fixed viewport-sized transition mask in place
- keep `overflow-hidden` on that mask
- render the outgoing page as a full-height/unclipped inner content layer
- animate that inner content layer upward inside the mask
- render the incoming page as another full-height/unclipped inner content layer
- animate that incoming inner layer from below into the same mask

Conceptually:

```text
WRONG CURRENT STRUCTURE

[moving clipped viewport]
  [page content]

The bottom/offscreen part is cut away before movement.
```

```text
CORRECT STRUCTURE

[stationary fixed viewport mask, overflow-hidden]
  [moving full outgoing page content]
  [moving full incoming page content]

The mask stays strict, but the full image/content can move through it.
```

## Implementation plan

Only change `src/pages/Index.tsx` page-transition logic.

1. Keep the normal page rendering untouched when no transition is happening.
2. On navigation, save the current page and current `window.scrollY` before changing page state.
3. During transition, create a fixed `inset-0 overflow-hidden` transition stage.
4. Do not transform this outer stage.
5. Inside the stage, render the outgoing page in an inner wrapper.
6. Animate the outgoing inner wrapper from:

```text
translateY(-savedScrollY)
```

to:

```text
translateY(calc(-savedScrollY - 100vh))
```

7. Render the incoming page in a separate inner wrapper.
8. Animate incoming from:

```text
translateY(100vh)
```

to:

```text
translateY(0)
```

9. While transition layers are active, hide the normal page underneath to prevent duplicate images or ghosting.
10. After `SLIDE_MS`, remove the transition layers and show the new page normally.

## Why this matches the drawing

In your drawing, the red part is below the visible screen.

With the current approach, that red part is clipped away because the whole clipped screen is sliding.

With the revised approach, the viewport remains clipped, but the full page content moves behind it. So as example 2 slides upward, its lower part can enter the white visible screen naturally instead of being missing.

## Rules for implementation

- Do not remove `overflow-hidden`.
- Do not alter `ImageViewer.tsx`.
- Do not alter collection item data or info text.
- Do not touch preload behavior.
- Do not remove fade-ins.
- Do not reintroduce the fixed-position info-text bug.

## Validation checklist

After implementation:
- Scroll COLLECTION so an image is partially below the viewport.
- Click MORE.
- The image should slide upward as complete content, with its lower part entering naturally.
- No visible red/offscreen gap behavior.
- No duplicated page ghosting.
- No page-wide overflow leak.
- COLLECTION/MORE/ARCHIVE navigation still uses the same slide timing and easing.