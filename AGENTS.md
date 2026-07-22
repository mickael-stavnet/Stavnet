<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project Rules

- Use `GEMINI.md` as a source of project rules and conventions.
- Keep `CHANGELOG.md` concise and ordered.
- Add an entry to `CHANGELOG.md` only for major milestones: creation or replacement of a page, major visual redesign of a screen, important interaction changes, or shared architectural UI changes.
- Do not add changelog entries for minor tweaks such as removing a label or button, changing a small spacing value, or other micro-adjustments.
- In `CHANGELOG.md`, keep date sections in chronological order and list entries within each date from earliest time to latest time.
- Never write comments in code files. Avoid line comments, block comments, JSX comments, and explanatory TODO comments.
- The current priority is frontend reproduction of the original FileMaker Pro application.
- FileMaker screenshots are the visual source of truth. Reproduce pages and interactions as closely as possible, pixel-perfect when screenshots are provided.
- Custom components are allowed and expected when needed to match the FileMaker screenshots. This project-specific pixel-perfect requirement overrides generic UI-library rules from `GEMINI.md` when they conflict.
- For visual correction requests based on screenshots, first identify the exact visual elements involved, the relationship the user wants between them, and the relevant outer containers before editing any layout code.
- When a user refers to "this", "that", "block", "card", "truc", or another ambiguous visual target, infer the intended target from the screenshot and browser context by mapping the request to concrete page elements and layout constraints instead of making a fast structural guess.
- Before changing a screenshot-driven layout, run a short internal reasoning pass that distinguishes: the specific elements concerned, whether the user means the content box or the outer container, whether the requested change concerns width, height, spacing, alignment, or position, and whether the relationship is local or concerns the full composition.
- For screenshot-driven layout work, prefer matching the visible geometry of the reference image over preserving the current code structure; if necessary, replace brittle positioning with a clearer composition model.
- When the user asks for two visual elements to match, interpret that as a strict constraint unless the screenshot clearly indicates otherwise: same height means same outer height, same width means same outer width, centered means centered in the full visible composition, and "collé" means the gap should be minimized rather than merely reduced.
- After screenshot-based layout edits, verify that the resulting composition satisfies the user’s stated spatial relationship in the screenshot itself, not only in the DOM structure or through approximate code assumptions.
- The app must support French, English, Hebrew, Arabic, German, and Spanish through i18n.
- Hebrew and Arabic require proper RTL support.
- When a development server is needed, the agent may use `pnpm run dev:production-db` to start Next.js and the local Worker together with the production D1 database. Stop both processes with `Ctrl+C` when finished.
