## Why dark mode shows a darker square during fade

The intro container fades opacity from 0 → 1 (and 1 → 0). Inside it, the `<video>` element has a browser-default **black** backdrop that shows through whenever a frame isn't fully painted (before first frame, during decode hiccups, on the very first compositor paint after fade-in starts). On dark mode the page is `#131313`, so a brief `#000000` square is visible. On light mode the page is near-white, so the dark video content already contrasts and the artifact is invisible.

## Fix (in `src/components/IntroVideo.tsx`)

1. Give the `<video>` element an explicit background matching the site:
   - `style={{ backgroundColor: 'hsl(var(--background))' }}` on the `<video>`.
2. Give the fading wrapper the same `bg-background` so the box itself is invisible against the page during partial opacity (no darker rectangle even mid-transition).
3. Defer the fade-in until the video actually has a paintable frame — start `setIsFadedIn(true)` only after the first `loadeddata`/`canplay` (already wired) **and** one `requestAnimationFrame` tick, so the first composited frame is the real video, not the black default.
4. On fade-out, freeze the last painted frame by leaving the video element in place (already does) — no change needed beyond step 1, since the black backdrop is what was bleeding through.

## Notes

- No video re-encoding required; the videos are already #131313/#fefefe.
- No change to timings (1500ms fade-out start, 165ms fade duration stay as-is).
- Light mode is unaffected because the same fix is bg-tokenised.

## Alternative (only if step 1 isn't enough)

Wrap the `<video>` in a div with `bg-background` and render the video with `mix-blend-mode: normal` — same idea, belt-and-braces.