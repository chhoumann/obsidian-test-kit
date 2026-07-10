import { afterEach, describe, expect, it, vi } from "vitest";
import {
	App,
	debounce,
	FuzzySuggestModal,
	Modal,
	Notice,
	requestUrl,
	setIcon,
} from "../src/stub.js";

describe("debounce", () => {
	afterEach(() => {
		vi.useRealTimers();
	});

	it("does not fire synchronously; fires after the timer flushes", () => {
		vi.useFakeTimers();
		const fn = vi.fn();
		const debounced = debounce(fn, 100);

		debounced();
		expect(fn).not.toHaveBeenCalled();

		vi.runAllTimers();
		expect(fn).toHaveBeenCalledTimes(1);
	});

	it("collapses rapid calls into one", () => {
		vi.useFakeTimers();
		const fn = vi.fn();
		const debounced = debounce(fn, 100);

		debounced("a");
		debounced("b");
		debounced("c");
		vi.runAllTimers();

		expect(fn).toHaveBeenCalledTimes(1);
		expect(fn).toHaveBeenLastCalledWith("c");
	});

	it("cancel() drops a pending call", () => {
		vi.useFakeTimers();
		const fn = vi.fn();
		const debounced = debounce(fn, 100);

		debounced();
		debounced.cancel();
		vi.runAllTimers();

		expect(fn).not.toHaveBeenCalled();
	});
});

describe("Notice", () => {
	afterEach(() => {
		Notice.reset();
	});

	it("records instances and flattened messages", () => {
		new Notice("first");
		new Notice("second");

		expect(Notice.instances).toHaveLength(2);
		expect(Notice.messages).toEqual(["first", "second"]);
	});

	it("setMessage updates the current message and the messageEl", () => {
		const notice = new Notice("before");
		notice.setMessage("after");

		expect(notice.message).toBe("after");
		expect(notice.messageEl?.textContent).toBe("after");
		expect(Notice.messages).toEqual(["after"]);
	});

	it("hide() is callable and reset() clears state", () => {
		const notice = new Notice("x");
		expect(() => notice.hide()).not.toThrow();
		Notice.reset();
		expect(Notice.instances).toHaveLength(0);
		expect(Notice.messages).toEqual([]);
	});
});

describe("Modal lifecycle", () => {
	it("attaches on open and detaches on close, firing hooks", () => {
		const events: string[] = [];
		class MyModal extends Modal {
			override onOpen(): void {
				events.push("open");
			}
			override onClose(): void {
				events.push("close");
			}
		}

		const modal = new MyModal(new App());
		expect(document.body.contains(modal.containerEl)).toBe(false);

		modal.open();
		expect(document.body.contains(modal.containerEl)).toBe(true);
		expect(events).toEqual(["open"]);

		modal.close();
		expect(document.body.contains(modal.containerEl)).toBe(false);
		expect(events).toEqual(["open", "close"]);
	});
});

describe("setIcon", () => {
	it("swaps the svg rather than duplicating it, preserving siblings", () => {
		const parent = document.createElement("div");
		const label = document.createElement("span");
		label.textContent = "Label";
		parent.appendChild(label);

		setIcon(parent, "star");
		setIcon(parent, "check");

		const svgs = parent.querySelectorAll("svg");
		expect(svgs).toHaveLength(1);
		expect(svgs[0]?.getAttribute("data-icon")).toBe("check");
		expect(parent.contains(label)).toBe(true);
	});
});

describe("FuzzySuggestModal ordering", () => {
	it("ranks exact over prefix over substring", () => {
		class Picker extends FuzzySuggestModal<string> {
			override getItems(): string[] {
				return ["a cat", "cat", "category", "scatter"];
			}
			override getItemText(item: string): string {
				return item;
			}
		}

		const picker = new Picker(new App());
		const ordered = picker.getSuggestions("cat").map((s) => s.item);

		// exact ("cat") > prefix ("category") > substring ("a cat", "scatter")
		expect(ordered[0]).toBe("cat");
		expect(ordered[1]).toBe("category");
		expect(ordered.slice(2).sort()).toEqual(["a cat", "scatter"]);
		expect(picker.chooser.values[0]?.item).toBe("cat");
	});

	it("keeps every item for an empty query", () => {
		class Picker extends FuzzySuggestModal<string> {
			override getItems(): string[] {
				return ["one", "two"];
			}
			override getItemText(item: string): string {
				return item;
			}
		}
		expect(new Picker(new App()).getSuggestions("")).toHaveLength(2);
	});
});

describe("requestUrl", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("returns a faithful shape with json as a lazily-evaluated property", async () => {
		const payload = { hello: "world" };
		vi.stubGlobal(
			"fetch",
			vi.fn(async () => new Response(JSON.stringify(payload), { status: 200 })),
		);

		const response = await requestUrl("https://example.test/data.json");

		expect(response.status).toBe(200);
		expect(response.text).toBe(JSON.stringify(payload));
		// json is a property (getter), not a method call.
		expect(response.json).toEqual(payload);
		expect(typeof (response as unknown as { json: unknown }).json).not.toBe("function");
		expect(response.arrayBuffer).toBeInstanceOf(ArrayBuffer);

		vi.unstubAllGlobals();
	});

	it("can still be replaced wholesale by a consumer's vi.mock", async () => {
		// Sanity: the exported requestUrl is a plain async function, so a consumer
		// mocking the module (importActual + override) works against it.
		expect(requestUrl).toBeTypeOf("function");
	});
});
