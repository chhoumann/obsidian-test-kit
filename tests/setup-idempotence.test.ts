import { describe, expect, it } from "vitest";

// Under jsdom. The setup barrel is already loaded via vitest setupFiles; this
// re-imports it (a no-op thanks to the module cache) and, more importantly,
// re-runs each guarded installer to prove a second install neither throws nor
// duplicates behaviour.
describe("setup idempotence", () => {
	it("re-imports the setup barrel without error", async () => {
		await import("../src/setup/index.js");
		await import("../src/setup/index.js");
		expect(typeof (HTMLElement.prototype as unknown as { createEl?: unknown }).createEl).toBe(
			"function",
		);
	});

	it("re-running installers leaves a single working helper (no duplication)", async () => {
		const { installDom, installGlobals, installMoment, installWaapi } = await import(
			"../src/setup/index.js"
		);

		installDom();
		installDom();
		installGlobals();
		installMoment();
		installWaapi();

		const div = document.createElement("div");
		const child = (div as unknown as { createDiv: (o?: unknown) => HTMLElement }).createDiv({
			text: "once",
		});
		expect(child.textContent).toBe("once");
		expect(div.children).toHaveLength(1);
	});

	it("does not overwrite a caller's own helper when re-installed", async () => {
		const { installDom } = await import("../src/setup/index.js");
		const proto = HTMLElement.prototype as unknown as { addClass: unknown };
		const original = proto.addClass;
		installDom();
		expect(proto.addClass).toBe(original);
	});

	it("installs window.moment via setup", () => {
		expect(typeof (window as unknown as { moment?: unknown }).moment).toBe("function");
	});
});
