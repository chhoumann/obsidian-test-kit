---
"obsidian-test-kit": minor
---

Node.js 22 or newer is now required (was `>=20`). Node 20 reached end-of-life in April 2026, and Vitest 5, jsdom 30 and `@testing-library/jest-dom` 7 no longer run on it. The build target is now `node22`, which on its own leaves the compiled output unchanged.

Peer ranges and the public API are unchanged: `vitest >=1.0.0` and `@testing-library/jest-dom >=6.0.0` (optional). If you use the `obsidian-test-kit/matchers` entry with jest-dom 7, install `@testing-library/dom` yourself, since jest-dom 7 made it a required peer.

The setup's mock `IntersectionObserver` now implements `scrollMargin`, which TypeScript 7's DOM types require.

The kit is now built and tested against Vitest 5, jsdom 30, `@testing-library/jest-dom` 7 and TypeScript 7. The dev-only `unrun` dependency was removed. The kit still has no runtime dependencies.

Releases now publish from GitHub Actions through npm trusted publishing, with provenance attestations.
