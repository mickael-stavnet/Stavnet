<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project Rules

- Use `GEMINI.md` as a source of project rules and conventions.
- Never write comments in code files. Avoid line comments, block comments, JSX comments, and explanatory TODO comments.
- The current priority is frontend reproduction of the original FileMaker Pro application.
- FileMaker screenshots are the visual source of truth. Reproduce pages and interactions as closely as possible, pixel-perfect when screenshots are provided.
- Custom components are allowed and expected when needed to match the FileMaker screenshots. This project-specific pixel-perfect requirement overrides generic UI-library rules from `GEMINI.md` when they conflict.
- The app must support French, English, Hebrew, Arabic, German, and Spanish through i18n.
- Hebrew and Arabic require proper RTL support.
