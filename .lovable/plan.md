## Root cause

The ImageViewer's `+`/`−` glyph and INFO rows use `position: fixed` with `translateY(window.innerHeight + 40/80)` to park themselves just off-screen below the viewport while waiting to slide in.

This worked in the old deployed (clock) version because nothing transformed their containing block — `fixed` was anchored to the viewport, so the parked elements stayed invisible regardless of scroll.

The current bug was introduced by the new page-switch slide transition in `src/pages/Index.tsx`. The render now wraps `renderPage(...)` in:

```tsx
<div style={{ transform: 'translateY(0)', willChange: 'transform', ... }}>
  {renderPage(displayedPage)}
</div>
```

A CSS `transform` (and `will-change: transform`) on an ancestor establishes a new containing block for `position: fixed` descendants. That means the viewer's "fixed" elements are now positioned relative to that wrapper div — which is as tall as its scrollable content — not the viewport. Their parking offset (`100vh + 40px`) lands inside the document, so scrolling down reveals them.

The outgoing-overlay div has the same setup but is itself `position: fixed`, so that one is fine.

## Fix

Stop turning the current page's wrapper into a containing block when no transition is in progress, and make sure even during a transition the viewer's overflow doesn't leak.

In `src/pages/Index.tsx`, change the active-page wrapper so that `transform` and `will-change` are only applied while a transition is active:

```tsx
<div
  key={displayedPage}
  style={
    transitioning
      ? {
          transform: !incomingActive ? 'translateY(100vh)' : 'translateY(0)',
          transition: `transform ${SLIDE_MS}ms ${SLIDE_EASE}`,
          willChange: 'transform',
        }
      : undefined
  }
>
  {renderPage(displayedPage)}
</div>
```

Effect:
- Idle state (the 99% case while a user is browsing the viewer): no transform on any ancestor → `position: fixed` is viewport-anchored again → parked elements stay below the fold no matter how the user scrolls. Bug gone.
- During a page switch: transform is applied for the ~600ms slide. The viewer isn't open during nav, so the parking issue can't appear in that window.

## Validation

- Open COLLECTION → click an item → scroll the viewer page: parked `+` and info rows should not be visible anywhere.
- Navigate COLLECTION ↔ MORE: slide-up transition still works the same.
- Return from viewer with `−` expanded and collapsed: no regressions in the existing slide/fade choreography.

## Out of scope

No changes to `ImageViewer.tsx`, `Gallery.tsx`, items list, or descriptions. The 6 collection items remain as they are.
