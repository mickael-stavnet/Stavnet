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
- The app must support French, English, Hebrew, Arabic, German, and Spanish through i18n.
- Hebrew and Arabic require proper RTL support.
