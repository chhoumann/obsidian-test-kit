import { describe, expect, it } from "vitest";

// This file runs under `environment: "node"` - there is NO document/window. It
// proves the stub entry is import-safe without a DOM and that DOM-free code
// paths (pure helpers, DOM-guarded constructors) work in bare Node, which is
// exactly how a metaedit-style consumer runs its suite.
describe("stub import-safety in node environment", () => {
	it("has no DOM available in this environment", () => {
		expect(typeof document).toBe("undefined");
		expect(typeof window).toBe("undefined");
	});

	it("imports the stub and constructs TFile from a path", async () => {
		const { TFile } = await import("../src/stub.js");
		const file = new TFile("a/b.md");
		expect(file.path).toBe("a/b.md");
		expect(file.name).toBe("b.md");
		expect(file.basename).toBe("b");
		expect(file.extension).toBe("md");
	});

	it("defaults TFile fields to empty strings when constructed without a path", async () => {
		const { TFile } = await import("../src/stub.js");
		const file = new TFile();
		expect(file.path).toBe("");
		expect(file.name).toBe("");
		expect(file.basename).toBe("");
		expect(file.extension).toBe("");
	});

	it("constructs a DOM-guarded class (Notice) without a document", async () => {
		const { Notice } = await import("../src/stub.js");
		Notice.reset();
		const notice = new Notice("hello");
		expect(notice.message).toBe("hello");
		expect(notice.messageEl).toBeUndefined();
		expect(Notice.messages).toEqual(["hello"]);
	});

	it("runs pure helpers in node", async () => {
		const { normalizePath, parseYaml } = await import("../src/stub.js");
		expect(normalizePath("a\\\\b//c")).toBe("a/b/c");
		expect(parseYaml("title: Hello")).toEqual({ title: "Hello" });
	});

	it("exposes the full export surface", async () => {
		const mod = await import("../src/stub.js");
		// Named exports minus the default export; a guard against accidental surface loss.
		const named = Object.keys(mod).filter((key) => key !== "default");
		expect(named.length).toBeGreaterThanOrEqual(40);
		expect(mod.default).toBeTypeOf("object");
	});
});
