# obsidian-test-kit

A shared, tested stand-in for the `obsidian` API for Vitest unit tests, plus the
jsdom polyfills Obsidian plugin code expects at runtime. You alias `obsidian` to
the kit's stub, add its setup to your Vitest config, and your plugin's pure logic
becomes testable without the Obsidian app - in either a jsdom or a bare `node`
test environment.

## Why this exists

Three plugins (QuickAdd, PodNotes, MetaEdit) each grew their own hand-written
`obsidian` stub and jsdom setup. They drifted, and the drift hid real bugs:

- **`debounce` that never debounced.** One copy returned the function unchanged
  and ran it synchronously, but the plugin's runtime called `.cancel()` on the
  result - a method that did not exist on the "immediate" version. The kit ships
  the timer-backed form with a working `.cancel()`, so a test can prove a pending
  call is actually dropped.
- **`normalizePath` that resolved `..`.** One copy collapsed `a/../b` to `b`.
  Real Obsidian does **not** resolve `.`/`..` segments, so that "helpful"
  resolution masked genuine path bugs. The kit matches the real behaviour
  (separator conversion, slash collapsing, edge trimming, NFC) and leaves `..`
  in place.

Consolidating into one tested package means those semantics are decided once,
verified once, and shared.

## Install

```bash
pnpm add -D obsidian-test-kit
```

Peer dependencies: `vitest` (required) and `@testing-library/jest-dom`
(optional - only needed if you use the `obsidian-test-kit/matchers` entry).

## Quickstart

### 1. Alias `obsidian` to the stub

The recommended pattern is a small local re-export file you alias to `obsidian`.
It gives you one place to add repo-only additions later (see
[Extending](#extending)).

```ts
// tests/obsidian.ts
export * from "obsidian-test-kit/stub";
export { default } from "obsidian-test-kit/stub";
```

### 2. Point Vitest at it

**jsdom consumer** (component/DOM tests):

```ts
// vitest.config.ts
import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["obsidian-test-kit/setup", "obsidian-test-kit/matchers"],
    alias: {
      obsidian: fileURLToPath(new URL("./tests/obsidian.ts", import.meta.url)),
    },
  },
});
```

**node consumer** (pure-logic tests, no DOM):

```ts
// vitest.config.ts
import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  test: {
    environment: "node",
    // No setup/matchers: those need a DOM. The stub is import-safe without one.
    alias: {
      obsidian: fileURLToPath(new URL("./tests/obsidian.ts", import.meta.url)),
    },
  },
});
```

The stub entry never touches `document`/`window` at import time, so it loads
cleanly under `environment: "node"`. DOM-backed classes (`Modal`, components)
only build nodes when you actually construct them.

## Entry points

| Entry                          | Purpose                                                                 | Environment |
| ------------------------------ | ----------------------------------------------------------------------- | ----------- |
| `obsidian-test-kit/stub`       | The `obsidian` module stand-in. Pure named exports, DOM-free at import. | node + jsdom |
| `obsidian-test-kit/setup`      | jsdom polyfills barrel (DOM helpers, moment, globals, WAAPI).           | jsdom       |
| `obsidian-test-kit/setup/dom`  | Element-prototype helpers only (`createEl`, `addClass`, ...).           | jsdom       |
| `obsidian-test-kit/setup/moment` | Installs the moment factory on `window.moment`.                       | jsdom       |
| `obsidian-test-kit/setup/globals` | `activeWindow`/`activeDocument`, localStorage, IntersectionObserver. | jsdom       |
| `obsidian-test-kit/setup/waapi` | `Element.prototype.animate` stub for Svelte transitions.               | jsdom       |
| `obsidian-test-kit/matchers`   | Registers `@testing-library/jest-dom` matchers on `expect`.            | jsdom       |

The default import (`obsidian-test-kit`) resolves to the stub as well.

Every `setup/*` installer is guarded and idempotent: it skips a helper that
already exists and survives a double-import, so a test can install its own
override and win.

## Extending

**Local re-export** - add repo-specific exports alongside the kit's:

```ts
// tests/obsidian.ts
export * from "obsidian-test-kit/stub";
export { default } from "obsidian-test-kit/stub";

// Something only your plugin needs:
export class MyPluginSpecificThing {}
```

**Per-test override with `vi.mock`** - keep the real stub but swap one export:

```ts
import { vi } from "vitest";

vi.mock("obsidian", async () => {
  const actual = await vi.importActual<typeof import("obsidian")>("obsidian");
  return {
    ...actual,
    requestUrl: vi.fn(async () => ({ status: 200, json: { ok: true } })),
  };
});
```

**Subclass** - the modals and components are real classes, so extend them:

```ts
import { FuzzySuggestModal } from "obsidian";

class FilePicker extends FuzzySuggestModal<string> {
  getItems() { return ["a.md", "b.md"]; }
  getItemText(item: string) { return item; }
}
```

## Fidelity notes

The kit aims for behaviour faithful enough to test plugin logic, not to
reimplement Obsidian. Because the real `obsidian` npm package is types-only (it
ships `obsidian.d.ts` with an empty `main` and no JS to import in Node), the pure
helpers are pinned against golden values documenting real-app behaviour rather
than compared to a live import.

- **Faithful** (matches real Obsidian; golden-value tested): `normalizePath`,
  `getFrontMatterInfo`, `getLinkpath`, `debounce` (+`.cancel()`), `setIcon`
  (swap, not duplicate), `setTooltip`, `Notice`, `Modal` open/close lifecycle,
  `TFile` path parsing, `requestUrl` response shape (`json` is a property).
- **Simplified** (enough for common cases, not spec-complete): `parseYaml`
  (flat scalars, inline arrays, block lists, quoted strings, numbers, booleans,
  null - not a full YAML parser); `moment` (a handful of tokens and chainable
  methods, UTC formatting); `MarkdownRenderer` (renders `**bold**` only).
- **Documented divergence**: `prepareFuzzySearch` is a **substring** matcher, not
  a subsequence fuzzy matcher, and always scores 0. `FuzzySuggestModal` ranks
  exact > prefix > substring, which is a coarse stand-in for the real fuzzy
  ranking.

For anything in the "simplified" or "documented divergence" buckets, assert the
real semantics in a live end-to-end test against Obsidian, not against this stub.

## Contributing

Issues and PRs welcome. Please keep the two invariants intact: the stub entry
must stay import-safe without a DOM (no top-level `document`/`window` access, no
`vi.*` usage), and every `setup/*` installer must stay guarded and idempotent.
Add a test for any behaviour you change - `pnpm test` runs the jsdom and node
projects, and `pnpm build` must stay clean.

## License

MIT (c) Christian B. B. Houmann
