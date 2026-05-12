Plan:

1. Keep the intro video itself fully opaque while it is visible, so its background color is never blended with the page behind it.
2. Replace the current fade-in/out of the video wrapper with a color-matched overlay fade:
   - dark mode overlay: exact dark site background
   - light mode overlay: exact white/light background
   - fade the overlay from solid to transparent for intro reveal, then transparent to solid for exit
3. After the exit overlay completes, unmount the intro and show the gallery as it does now.
4. Keep the existing 1500ms intro timing unchanged and avoid touching the nav/menu logic unless you separately ask for that.

Technical details:

- Current cause: `IntroVideo.tsx` animates `opacity` on the wrapper containing the `<video>`, so during the transition the video pixels are composited with the page background underneath.
- Proposed fix: set the video wrapper opacity to `1` and animate an absolutely-positioned `bg-background` overlay above it instead. This creates a visual fade without dimming or color-shifting the video pixels themselves.
- If the current background tokens still contain the reverted `#131313/#fefefe` values, I’ll restore them to the intended exact `#121212/#ffffff` tokens as part of the same targeted fix.