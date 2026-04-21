
Goal: restore the preview immediately without changing the site’s visible design, content, animations, or interactions.

1. Fix the router/base mismatch
- Keep the existing Vite `base: "/mono-time-display/"` setting, since that appears intentional for GitHub Pages deployment.
- Update `src/App.tsx` so `BrowserRouter` uses a matching basename derived from the app base path:
  - preferred: `basename={import.meta.env.BASE_URL}`
- This makes `/mono-time-display/` behave as the app root, so the preview loads the real site instead of falling into the `*` route.

2. Keep all page/UI behavior exactly the same
- Do not touch the gallery, HUD, About page, transitions, hover states, theme toggle, or styling.
- Do not remove or redesign anything.
- This is a routing-only fix so the already-built site becomes reachable again.

3. Make the 404 recovery path safe under the same base path
- Update `src/pages/NotFound.tsx` so “Return to Home” routes to the app root within the basename instead of hard-linking to `/`.
- Use React Router navigation (`Link to="/"`) so it works both in preview and on GitHub Pages.

4. Verify the exact failure is resolved
- Confirm the preview route `/mono-time-display/` renders `Index` instead of `NotFound`.
- Confirm there is no white/blank screen after load.
- Confirm navigation between COLLECTION and ABOUT still works identically.
- Confirm no visual differences anywhere except the preview now opens correctly.

Technical details
```text
Current problem:
Vite base = /mono-time-display/
Router root = /
User opens = /mono-time-display/
React Router sees an unmatched path and sends the app to NotFound

Planned fix:
Vite base = /mono-time-display/
BrowserRouter basename = /mono-time-display/
Route "/" now correctly maps to the actual home page
```

Files to update
- `src/App.tsx`
- `src/pages/NotFound.tsx`

Expected result
- The preview opens normally again on both devices.
- No changes to the actual site appearance or behavior.
- GitHub Pages compatibility is preserved.
