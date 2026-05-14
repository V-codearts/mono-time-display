## Goal
Make MEDIA clickable in the OTHER menu. It opens a Collection-style page with one item. The item is video-only with two variations (fast = thumbnail, slow). The viewer for this item has NO info `+` and NO info text. Light/dark mode versions of each video play simultaneously behind the scenes and crossfade seamlessly when the theme is toggled.

## File mapping (assumed from filenames)
- `nopeelitehd.mp4` → fast / light
- `nopeedarkhd.mp4` → fast / dark
- `hidaslite.mp4` → slow / light
- `hidasdark.mp4` → slow / dark

(`nopee` ≈ Finnish "fast", `hidas` ≈ "slow". I'll confirm by previewing once implemented; if swapped, trivial rename.)

Files copied to `src/assets/`.

## Changes

### 1. `src/pages/About.tsx`
Make MEDIA clickable: add `onClick={() => onNavigate?.('media')}` and update the navigate prop type to include `'media'`. Hover styles stay identical to ARCHIVE/ABOUT.

### 2. `src/pages/Index.tsx`
- Extend `Page` type with `'media'`.
- Treat `'media'` like `'archive'` for HUD (`inspecting`, back handler routing back to `'other'` when no in-page back handler).
- Render new `<Media>` component when `displayedPage === 'media'` inside the same fade wrapper used for archive.

### 3. `src/components/Media.tsx` (new)
A minimal Gallery-style page (no reuse of `Gallery.tsx` because that is image-only and tightly coupled to FLIP image animation). It contains:
- One full-screen "thumbnail" cell that always autoplays both fast videos (light + dark) layered, both `loop muted playsInline preload="auto"`. Opacity of each layer is driven by current `isDarkMode` (read from `document.documentElement.classList.contains('dark')` via a small subscription, or via a new prop wired from `Index.tsx` — I'll pass `isDarkMode` down as a prop).
- The two videos are kept in `<video>` refs and started together so their loops stay aligned. Slow + fast pairs are also kept playing in the background even on the thumbnail page so swapping into the viewer is instant and synchronized.
- On click: switches to the viewer state (local component state, no FLIP animation required since the user specified "a copy of collection" but the source is video — keeping the simple cross-fade transition consistent with archive). For now: simple opacity fade between thumbnail layout and viewer layout. (If you want the same FLIP zoom as Collection later, we can add it; the user did not request it.)

### 4. `src/components/MediaViewer.tsx` (new)
Mirrors `ImageViewer` layout/sizing but:
- Renders `<video>` instead of `<img>`. Four `<video>` elements always mounted: fast-light, fast-dark, slow-light, slow-dark. All loop, muted, autoplay.
- Visible variation (fast vs slow) controlled by stacking + opacity; clicking the visible video toggles fast↔slow (instant — no horizontal swipe needed since "no info plus / info text" simplifies things; matches "thumbnail loops endlessly" requirement).
- Within the active variation, the two theme videos are layered; opacity follows `isDarkMode`. Crossfade duration ~300 ms with `transition: opacity` so theme toggle sweeps like a curtain.
- NO `+` button, NO info rows, NO swipe-cycle (only one tap to alternate fast/slow). Back is handled by HUD as it is for Archive.
- Sizing classes match the standard non-compact viewer (`md:max-w-[calc(100vw-120px)] lg:max-w-[80vw]`, `max-h-[80vh]`).

### 5. Sync strategy (light/dark videos)
- Both light and dark videos for the *same* speed share a single source of truth: when one fires `timeupdate`, the other's `currentTime` is corrected only if drift > 0.05 s (avoid jitter). Both start playing from the same `play()` call inside a `requestAnimationFrame`. This keeps the "curtain sweep" perfectly aligned.
- Same applies to slow pair.

### 6. Thumbnail keeps looping when not in viewer
Achieved automatically: thumbnail videos are mounted in `Media` and remain mounted while in viewer state too (just hidden via opacity / display) — but since the viewer mounts its own copies of the videos for sizing reasons, the simpler approach is: `Media` wraps both thumbnail and viewer and shares one set of four `<video>` elements via portals/refs. Practical implementation: keep the four videos in `Media`, position them absolutely with CSS transforms. In thumbnail mode they are sized as the gallery cell; in viewer mode they animate to the viewer rect. This guarantees "thumbnail also loops while not in viewer" trivially because they are the same elements.

If sharing element instances proves messy, fall back to: thumbnail keeps its own pair of muted looping videos (cheap), viewer mounts its own four. Both pairs autoplay independently. The user requirement "thumbnail also loops while not in itemviewer" is satisfied either way.

## Out of scope
- No FLIP zoom animation from thumbnail → viewer (Collection has it for images; user said "a copy of collection" but didn't ask for animation parity, and image-FLIP doesn't translate cleanly to videos). Happy to add later.
- No description text, no `+` (explicitly excluded by user).
- No audio (videos are muted to allow autoplay).

## Verification
After implementation: open MEDIA, confirm fast video loops as thumbnail; click → viewer opens with no `+`/info; click video → switches to slow; toggle theme → both fade across smoothly; back arrow returns to OTHER.
