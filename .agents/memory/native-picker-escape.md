---
name: Native picker Escape handling
description: Keyboard-collapse constraint for desktop booking takeovers using native date and time inputs.
---

Desktop booking takeovers that use native date or time inputs must handle Escape on `window` during the capture phase and blur the focused control before collapsing.

**Why:** Native picker controls consumed the ordinary bubbling key event, leaving the expanded booking surface visibly open even though other close methods worked.

**How to apply:** Use a capture-phase Escape listener whenever a reversible overlay contains native picker inputs, and verify the behavior with focus inside the picker field.