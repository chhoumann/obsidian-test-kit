import { defineConfig } from "vitest/config";

// Two projects mirror the two ways consumers run Vitest: a jsdom project (the
// common case: DOM present, setup + matchers installed) and a node project (no
// DOM at all, proving the stub is import-safe without a document). Node tests
// are named `*.node.test.ts`; everything else runs under jsdom.
export default defineConfig({
	test: {
		projects: [
			{
				test: {
					name: "jsdom",
					environment: "jsdom",
					include: ["tests/**/*.test.ts"],
					exclude: ["tests/**/*.node.test.ts"],
					setupFiles: ["./src/setup/index.ts", "./src/matchers.ts"],
				},
			},
			{
				test: {
					name: "node",
					environment: "node",
					include: ["tests/**/*.node.test.ts"],
				},
			},
		],
	},
});
