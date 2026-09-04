---
name: Sticky scroll containers
description: Constraint for layered scroll-story sections on the TuranEliteLimo homepage.
---

Layered sticky storytelling sections must not sit inside an ancestor with `overflow: hidden`; use horizontal clipping that does not create a vertical scroll container.

**Why:** A hidden-overflow page wrapper disabled the sticky viewport and exposed a large blank background during the image-peel sequence.

**How to apply:** When changing global page overflow or scroll-story structure, verify all sticky phases in a real browser and preserve a non-scrolling vertical ancestor chain.