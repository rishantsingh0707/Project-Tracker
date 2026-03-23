# Velozity Project Tracker

Frontend assignment implementation for a multi-view project tracker built with React + TypeScript.

## Setup

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

## State Management Decision

I used React Context with `useReducer` instead of Zustand. The assignment only needs one shared client-side dataset and a predictable set of UI actions: filtering, sorting, view switching, drag state, task updates, and simulated collaboration. Context + reducer keeps the dependency surface small, makes state transitions explicit, and is enough for this scope without bringing in another runtime abstraction. The store provider also owns filter URL syncing and the simulated presence interval so those concerns stay centralized.

## Virtual Scrolling Approach

The list view uses fixed-height rows and a custom virtualizer. On scroll, the component calculates the first and last visible indexes from `scrollTop`, viewport height, and a constant row height. It renders only those rows plus a buffer of five above and below, while using top and bottom spacer elements to preserve the full scroll height. This keeps scrolling stable and avoids DOM growth even with 500+ rows.

## Drag And Drop Approach

Kanban drag-and-drop is implemented with native pointer events. On pointer down, the app measures the dragged card, records the cursor offset, and starts a window-level pointer move/up lifecycle. The original card is replaced by a placeholder with the same measured height in its source column, which prevents layout shift during drag. A floating ghost card follows the pointer with reduced opacity and heavier shadow, while valid columns highlight as drop targets. Dropping outside any column triggers a short snap-back animation to the measured origin rectangle.

## Explanation

The hardest UI problem was keeping Kanban drag-and-drop feeling stable while preserving layout and touch support. The core issue was not just moving a card visually, but holding the original column height steady, maintaining clear drop-zone feedback, and avoiding flicker when the dragged element leaves normal document flow. I solved that by measuring the card on pointer down, rendering a placeholder with the same height in the source column, and moving a separate fixed-position ghost layer with pointer events disabled. That keeps the DOM structure predictable while the dragged card follows the cursor smoothly.

The placeholder is tied to the source status and dragged task id, so only the original slot is replaced. Because the placeholder height matches the measured card height, the column does not collapse or jump during drag. If the user drops outside a valid column, the ghost animates back to the stored origin rectangle before cleanup.

With more time, I would refactor the collaboration presence system so avatar movement is animated globally across views instead of animating only the in-place indicators on each rendered task.

## Lighthouse

Run Lighthouse locally against the production build and add the screenshot here before submission.
