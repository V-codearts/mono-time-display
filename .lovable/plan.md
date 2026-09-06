# Plan: Deploy current build to gh-pages

## Goal
Push the current code's production build onto the `gh-pages` branch so the custom domain (`laarko.com`) serves the new site (including the transition-video warm-up fix from the previous step).

## Why gh-pages doesn't need to be empty
The `gh-pages` branch currently holds the *old* build (`assets/`, `index.html`, `CNAME`, `transitions/`, etc.). The deploy command overwrites the branch content with the fresh `dist/` output — it does not append. So the branch does not need to be emptied first.

## Why the GitHub default URL is white
`vite.config.ts` uses `base: "/"`. On the project-page URL (`V-codearts.github.io/mono-time-display`) every asset resolves to the github.io root and 404s → blank page. On the custom domain `laarko.com`, `/` is correct and is the one that works. **Do not change `base`** — the custom domain is the target.

## Steps
1. Confirm the working tree is clean and on the right branch (already verified).
2. Run `npm run build` to produce a fresh `dist/` (production build, `base: "/"`).
3. Verify `dist/` contents: `index.html`, hashed `assets/`, `transitions/`, `CNAME`-equivalent (CNAME is added by the deploy tool via the repo, not dist).
4. Run `npm run deploy` (= `gh-pages -d dist`). This force-pushes `dist/` to the `gh-pages` branch, overwriting the old build.
5. Confirm `CNAME` (laarko.com) is preserved on the `gh-pages` branch — `gh-pages` keeps existing files that aren't in `dist` only if configured; since `CNAME` lives at repo root (not in `dist`), verify it remains. If it's missing, re-add it to the branch.
6. Wait for GitHub Pages CDN to refresh (can take a minute or two), then verify `laarko.com` shows the new build.

## Notes
- `gh-pages` CLI v6.3.0 is available; `predeploy` already runs `build` before `deploy`.
- No `base` change. No branch needs to be emptied.
- After deploy, the GitHub default URL will remain white — that's expected and not a problem for the custom-domain deployment.
