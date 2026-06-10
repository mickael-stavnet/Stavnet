# Project Memory

## Project Overview

- The application is a modernization of an Israeli literature database initially developed with FileMaker Pro.
- The new implementation uses Next.js 16.
- The current work priority is frontend implementation: pages, sections, navigation, responsive layouts, and UI interactions.
- The goal is not a free redesign. The frontend must reproduce the original FileMaker Pro screens as closely as possible, ideally pixel-perfect.
- The FileMaker screenshots provided by the user are the primary visual source of truth.

## Current Product Direction

- Around thirty FileMaker screens are expected.
- The user will provide screenshots progressively, page by page.
- The first page to implement has not been selected yet.
- Existing frontend code may be present, but the user considers current styling incorrect unless it matches the FileMaker reference.
- For now, real data is not required in the frontend. Use fake/mock data until the user asks otherwise.
- The real data exists in Supabase, but Supabase integration is not the current focus.
- The current focus is page creation and linking between pages.
- The `/[locale]/home` page is the FileMaker language/menu screen. It uses the STAVNET logo, a multilingual welcome panel, a language table, a books-table image, and a bottom icon navigation row.

## Frontend Requirements

- Reproduce both appearance and interactions from FileMaker Pro.
- Interactions must be inferred from screenshots because no videos are available.
- The app must be responsive on mobile, tablet, and desktop.
- The original FileMaker resolution may be square or close to square, and likely not directly 1920x1080. Screens must be adapted cleanly to 1920x1080 and responsive breakpoints.
- The home page must render fullscreen. The typographic background must cover the whole viewport, with no centered page frame or side bands.
- Normal frontend states are expected: loading, empty, error, selected, hover, focus, disabled, etc.
- Pixel-perfect reproduction from screenshots takes priority over generic component-library aesthetics.
- Custom components should be created when needed to match screenshots exactly.
- Tailwind CSS is available and should be used.
- shadcn/ui is not the default design authority for this project. Use custom UI when screenshots require it.

## Internationalization

- The site must support six languages:
  - French
  - English
  - Hebrew
  - Arabic
  - German
  - Spanish
- All site text must eventually be translated into these six languages through i18n.
- Hebrew and Arabic require RTL support.
- The project uses `next-intl`.

## Technical Context

- Framework: Next.js 16.2.7.
- React: 19.2.4.
- TypeScript is used.
- Tailwind CSS v4 is used.
- `next-intl` is installed.
- Supabase client is installed.
- The project has an `AGENTS.md` rule stating that this is not the usual Next.js and that relevant docs in `node_modules/next/dist/docs/` must be read before writing Next.js code.
- `GEMINI.md` is a source of project rules and conventions.

## Rules To Remember

- Before changing Next.js code, read the relevant guide from `node_modules/next/dist/docs/`.
- Never write comments in code files unless the user explicitly overrides this rule.
- Use `GEMINI.md` as a source of project rules.
- When `GEMINI.md` conflicts with the user requirement for FileMaker pixel-perfect custom UI, the FileMaker screenshot requirement wins.
- Do not assume existing UI is correct.
- Do not optimize for a modern-looking redesign unless the user explicitly changes direction.
- Ask for the screenshot/reference before implementing a FileMaker screen.

## Open Questions

- Which page will be implemented first?
- What exact reference dimensions should be used for each screenshot?
- How should square FileMaker layouts map to 16:9 desktop screens?
- Which interactions are expected on each screen?
- What fake data shape is needed for each page?
