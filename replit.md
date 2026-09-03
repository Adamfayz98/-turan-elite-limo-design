# TuranEliteLimo

A luxury chauffeur marketing and booking website for TuranEliteLimo.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/turan-elite-limo run dev` — run the website through its managed workflow
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/turan-elite-limo/src/App.tsx` — homepage content and interactive quote flow
- `artifacts/turan-elite-limo/src/index.css` — TuranEliteLimo visual system, responsive layout, and motion

## Architecture decisions

- This remains an interactive design prototype only: no production backend, external APIs, production architecture, or deployment work unless the user explicitly changes direction.
- The quote journey uses local mock data and progressive disclosure without storing or sending customer data.
- Blacklane is a structural and interaction reference only. TuranEliteLimo uses original branding, copy, layouts, and visual assets.

## Product

- Cinematic luxury chauffeur landing page
- Responsive navigation and animated storytelling
- Interactive airport, point-to-point, hourly, and special-occasion quote flow
- Service, fleet, standards, journal, testimonial, and contact content

## User preferences

- Preserve the approved warm ivory/cream/stone editorial direction, large typography, generous whitespace, varied section compositions, restrained dark accents, and carefully limited gold.
- Luxury should come from typography, spacing, composition, photography, proportion, restraint, motion, and interaction—not a conventional black-and-gold limousine treatment.
- Keep motion subtle and finite: fade/rise, gentle reveals, controlled 250–350ms state changes, no bouncing, aggressive parallax, rotating carousels, floating cars, or constant animation.
- Use supplied vehicle and logo assets exactly as provided; never redraw, recolor, distort, stretch, or replace them with generated substitutes.

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
