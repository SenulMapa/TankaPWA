# CONTRIBUTING

---

## GETTING_STARTED

Fork → clone → `npm install` → `cp .env.example .env` → `npm run dev`.

It just works.

---

## BRANCH_NAMING

```
feat/your-feature-name
fix/what-youre-fixing
chore/what-youre-doing
docs/what-youre-documenting
```

---

## PULL_REQUESTS

- Always link to an issue
- Describe what changed and why
- Keep PRs focused — one thing per PR
- No new dependencies without opening a discussion issue first
- TypeScript strict mode — no `any` unless absolutely unavoidable
- Styling via Tailwind only — no new CSS files

---

## GOOD_FIRST_ISSUES

Beginner-friendly tasks to pick up:

- **Add more daily briefing messages** — expand the rotating pool in `src/services/fuelService.ts`
- **Improve map marker clustering** — for dense station areas in `src/pages/Map.tsx`
- **Add share functionality** — for fuel availability status
- **Improve consumption prediction algorithm** — in Track screen logic
- **Accessibility improvements** — ARIA labels, keyboard navigation
- **Add skeleton loaders** — for station fetch states
- **Write tests for utility functions** — plate eligibility, quota calculations
- **Translate UI strings** — Sinhala / Tamil language support

---

## ISSUE_LABELS

```
good first issue   — beginner friendly
bug                — something is broken
enhancement        — new feature or improvement
ui                 — visual / design work
api                — Jedach Fuel API integration
docs               — documentation
discussion         — needs community input before work starts
```

---

## DESIGN_SYSTEM

The aesthetic is brutalist terminal. Don't break it.

- **Background:** `#0a0a0a`
- **Accent:** `#F5A623` (amber)
- **Typography:** Space Grotesk (headings) + Inter (body)
- **Border radius:** `0px` — hard edges only
- **Labels:** monospace, uppercase, underscore-separated (`PUMP_ELIGIBILITY`, `FUEL_STATUS`)
- **No rounded corners. No gradients. No shadows.**

If it looks polished, you're doing it wrong.
