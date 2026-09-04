---
name: Booking takeover geometry
description: Layout rule for keeping the Turan desktop booking bar centered and the active stage inside a fixed hero.
---

The resting booking bar and active takeover must share one viewport-relative centered frame; the expanded active frame should be absolutely centered within a fixed-height desktop hero.

**Why:** A percentage width nested inside the content container became much narrower in active mode, while a flow-positioned expanded stage temporarily increased the hero height.

**How to apply:** Size the shared frame relative to the viewport with a maximum width, keep that frame identical across states, and remove the active stage from document flow while it occupies the hero.