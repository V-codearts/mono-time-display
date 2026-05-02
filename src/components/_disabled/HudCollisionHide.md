# Nav Menu Image-Collision Hide (disabled)

Feature: hides the nav menu items (COLLECTION / ABOUT / OTHER) whenever a
gallery image's bounding box overlaps the menu's bounding box. The toggle
glyph stays as "−" (does not flip back to "+") because this is an exception.

Re-integrate by restoring the snippets below into `src/components/Hud.tsx`.

## 1. Imports
```ts
import { useEffect, useRef, useState } from 'react';
```

## 2. Constant
```ts
const COLLISION_PAD = 8;
```

## 3. Inside the Hud component (top)
```tsx
const menuRef = useRef<HTMLDivElement>(null);
const [hiddenByImage, setHiddenByImage] = useState(false);
const effectiveMenuOpen = menuOpen && !inspecting && !hiddenByImage;

useEffect(() => {
  if (!menuOpen || inspecting) {
    setHiddenByImage(false);
    return;
  }

  let raf = 0;
  let stopped = false;
  const check = () => {
    const menuEl = menuRef.current;
    if (!menuEl) return;
    const m = menuEl.getBoundingClientRect();
    const imgs = document.querySelectorAll<HTMLImageElement>(
      'main img, [data-gallery-img], .gallery-img, img'
    );
    let collide = false;
    imgs.forEach((img) => {
      if (collide) return;
      if (menuEl.contains(img)) return;
      const r = img.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      const overlap =
        r.left < m.right + COLLISION_PAD &&
        r.right > m.left - COLLISION_PAD &&
        r.top < m.bottom + COLLISION_PAD &&
        r.bottom > m.top - COLLISION_PAD;
      if (overlap) collide = true;
    });
    setHiddenByImage(collide);
  };

  const loop = () => {
    if (stopped) return;
    check();
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);

  return () => {
    stopped = true;
    if (raf) cancelAnimationFrame(raf);
  };
}, [menuOpen, inspecting]);
```

## 4. JSX
- Add `ref={menuRef}` to the menu container `<div>` that wraps the nav items.
- Replace `menuOpen && !inspecting` checks driving the items' `transform` /
  `transitionDelay` with `effectiveMenuOpen`.
