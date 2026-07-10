/**
 * obsidian-test-kit/matchers
 *
 * Registers the @testing-library/jest-dom matchers (toBeInTheDocument,
 * toHaveAttribute, ...) on Vitest's expect. Reference it from a jsdom project's
 * `setupFiles`, alongside `obsidian-test-kit/setup`.
 *
 * @testing-library/jest-dom is an optional peer dependency: install it in the
 * consumer only if you use this entry.
 */

import "@testing-library/jest-dom/vitest";
