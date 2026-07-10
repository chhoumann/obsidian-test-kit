import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";
import {
	getFrontMatterInfo,
	getLinkpath,
	normalizePath,
	parseYaml,
	prepareFuzzySearch,
} from "../src/stub.js";

// The `obsidian` npm package is types-only ("main": "", no JS): the real
// implementations live in the Obsidian app and cannot be imported in Node. So
// the pure helpers below are pinned against GOLDEN VALUES taken from documented
// real-app behaviour rather than compared to a live import. The check below
// keeps that rationale honest: if a future obsidian release ships a runtime,
// this test flips and we should upgrade to a direct comparison.
describe("real obsidian package is types-only", () => {
	it("ships no runtime entry point (empty main)", () => {
		const require = createRequire(import.meta.url);
		const pkg = JSON.parse(readFileSync(require.resolve("obsidian/package.json"), "utf8")) as {
			main?: string;
			types?: string;
		};
		// An empty `main` with a `.d.ts` `types` is the tell: types-only, no JS to
		// import in Node. That is why the helpers below use golden values.
		expect(pkg.main).toBe("");
		expect(pkg.types).toMatch(/\.d\.ts$/);
	});
});

// Faithful helpers: these match real Obsidian and are held to golden values.
describe("normalizePath (faithful)", () => {
	it("converts separators and collapses repeats", () => {
		expect(normalizePath("a\\b")).toBe("a/b");
		expect(normalizePath("a//b//c")).toBe("a/b/c");
		expect(normalizePath("a\\\\b")).toBe("a/b");
	});

	it("trims edge slashes and returns '/' for an emptied path", () => {
		expect(normalizePath("/leading/trailing/")).toBe("leading/trailing");
		expect(normalizePath("")).toBe("/");
		expect(normalizePath("///")).toBe("/");
	});

	it("does NOT resolve '.' or '..' segments (matches real Obsidian)", () => {
		expect(normalizePath("a/./b")).toBe("a/./b");
		expect(normalizePath("a/../b")).toBe("a/../b");
	});

	it("NFC-normalizes unicode", () => {
		// "cafe" + combining acute -> composed "café".
		expect(normalizePath("café")).toBe("café");
	});
});

describe("getFrontMatterInfo (faithful)", () => {
	it("reports offsets for a standard block", () => {
		const info = getFrontMatterInfo("---\ntitle: x\n---\nbody\n");
		expect(info).toEqual({
			exists: true,
			frontmatter: "title: x\n",
			from: 4,
			to: 13,
			contentStart: 17,
		});
	});

	it("handles a closing fence at EOF without a trailing newline", () => {
		const info = getFrontMatterInfo("---\ntitle: x\n---");
		expect(info.exists).toBe(true);
		expect(info.frontmatter).toBe("title: x\n");
		expect(info.contentStart).toBe(16);
	});

	it("returns not-exists when the opening fence is absent", () => {
		expect(getFrontMatterInfo("body").exists).toBe(false);
		expect(getFrontMatterInfo("  ---\nx\n---\n").exists).toBe(false);
	});
});

describe("getLinkpath (faithful)", () => {
	it("drops the subpath after '#'", () => {
		expect(getLinkpath("note")).toBe("note");
		expect(getLinkpath("note#heading")).toBe("note");
		expect(getLinkpath("note#^block")).toBe("note");
		expect(getLinkpath("folder/note#h")).toBe("folder/note");
		expect(getLinkpath("#heading")).toBe("");
	});
});

// Documented divergences: these are intentionally simplified stand-ins. The
// tests pin the stub's own behaviour so the divergence stays visible and does
// not silently drift. Do NOT read these as real Obsidian semantics.
describe("parseYaml (documented divergence: minimal parser)", () => {
	it("handles the scalar/array/list subset it supports", () => {
		const yaml = ["title: Hello", "count: 3", "done: true", "tags: [a, b]", "list:", "  - one", "  - two"].join(
			"\n",
		);
		expect(parseYaml(yaml)).toEqual({
			title: "Hello",
			count: 3,
			done: true,
			tags: ["a", "b"],
			list: ["one", "two"],
		});
	});
});

describe("prepareFuzzySearch (documented divergence: substring, not subsequence)", () => {
	it("matches case-insensitive substrings only", () => {
		const search = prepareFuzzySearch("cat");
		expect(search("category")).toEqual({ score: 0, matches: [[0, 3]] });
		expect(search("a Cat")).toEqual({ score: 0, matches: [[2, 5]] });
		// A real fuzzy (subsequence) matcher would match "c-a-t" in "contact";
		// this substring stand-in deliberately does not.
		expect(search("contact")).toBeNull();
	});
});
