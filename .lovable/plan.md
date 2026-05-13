## Plus → Minus toggle with position shift

### Behavior
- The `+` is currently non-clickable. Make it clickable (cursor + click handler), but no panel/description opens yet — only the symbol and its position change.
- Clicking `+` toggles state to "expanded":
  - Symbol becomes `−` (minus).
  - Slides from current position (`(rect.bottom + innerHeight) / 2`) up to `rect.bottom + 15px` (15px below the image's bottom edge, exact across all devices).
- Clicking `−` toggles back to "collapsed":
  - Symbol becomes `+`.
  - Slides back down to the bottom-bottom center position.
- Slide reuses the existing `PLUS_SLIDE_MS` / `PLUS_SLIDE_EASE` transition on `transform`.
- Hover-bold reaction stays in both states.

### State & position model (in `src/components/ImageViewer.tsx`)
- Add `expanded` state (boolean, default `false`).
- Track two Y values from the image rect on each measure:
  - `plusY` = `(rect.bottom + innerHeight) / 2` (current bottom-center).
  - `minusY` = `rect.bottom + 15`.
- The rendered `top` uses `expanded ? minusY : plusY`.
- Off-screen entry transform keeps using the collapsed reference so slide-in on enter is unchanged.

### Reset rules
- When leaving the viewer (`prepareForReturnToThumbnail`) or when the image changes, force `expanded = false` so the next entry starts as `+`.
- On image switch (variation swipe), keep `expanded` as-is per current scope — user only specified plus↔minus toggle, so no extra behavior; if collapse-on-swipe is desired, can add later.

### Out of scope (per "one thing at a time")
- No description panel, no content reveal, no layout shift of the image.
