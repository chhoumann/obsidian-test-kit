import { defineConfig } from "tsdown";

export default defineConfig({
	entry: [
		"src/stub.ts",
		"src/setup/index.ts",
		"src/setup/dom.ts",
		"src/setup/moment.ts",
		"src/setup/globals.ts",
		"src/setup/waapi.ts",
		"src/matchers.ts",
	],
	format: ["esm"],
	platform: "neutral",
	target: "node22",
	dts: true,
	sourcemap: true,
	clean: true,
	fixedExtension: true,
	// The kit ships its own exports map in package.json; don't let tsdown rewrite it.
	exports: false,
});
