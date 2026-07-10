import { describe, expect, it } from "vitest";

// Under jsdom with the setup barrel loaded via setupFiles. Exercises the
// Element-prototype helpers Obsidian adds at runtime.
type El = HTMLElement & {
	createEl: (tag: string, options?: unknown) => HTMLElement;
	createDiv: (options?: unknown) => HTMLElement;
	createSpan: (options?: unknown) => HTMLElement;
	empty: () => void;
	addClass: (...c: string[]) => void;
	removeClass: (...c: string[]) => void;
	setAttr: (name: string, value: unknown) => void;
	setText: (text: string) => void;
	setCssStyles: (styles: Partial<CSSStyleDeclaration>) => void;
	setCssProps: (props: Record<string, string>) => void;
};

const el = () => document.createElement("div") as unknown as El;

describe("createEl / createDiv / createSpan", () => {
	it("creates and appends children with options", () => {
		const parent = el();
		const child = parent.createEl("a", { text: "link", href: "https://x.test", cls: "c" });
		expect(child.tagName).toBe("A");
		expect(child.textContent).toBe("link");
		expect(child.getAttribute("href")).toBe("https://x.test");
		expect(child.className).toBe("c");
		expect(parent.contains(child)).toBe(true);
	});

	it("createDiv/createSpan use the right tag", () => {
		const parent = el();
		expect(parent.createDiv().tagName).toBe("DIV");
		expect(parent.createSpan({ text: "s" }).tagName).toBe("SPAN");
	});

	it("accepts a bare class string and an attr map", () => {
		const parent = el();
		const child = parent.createEl("div", { cls: "x", attr: { "data-id": "7", hidden: null } });
		expect(child.className).toBe("x");
		expect(child.getAttribute("data-id")).toBe("7");
		expect(child.hasAttribute("hidden")).toBe(false);
	});
});

describe("classList / attribute / text / style helpers", () => {
	it("addClass and removeClass", () => {
		const node = el();
		node.addClass("a", "b");
		expect(node.classList.contains("a")).toBe(true);
		node.removeClass("a");
		expect(node.classList.contains("a")).toBe(false);
		expect(node.classList.contains("b")).toBe(true);
	});

	it("setAttr sets, and removes on null/false", () => {
		const node = el();
		node.setAttr("data-x", "1");
		expect(node.getAttribute("data-x")).toBe("1");
		node.setAttr("data-x", null);
		expect(node.hasAttribute("data-x")).toBe(false);
	});

	it("setText and empty", () => {
		const node = el();
		node.setText("hello");
		expect(node.textContent).toBe("hello");
		node.createDiv();
		node.empty();
		expect(node.childNodes).toHaveLength(0);
	});

	it("setCssStyles and setCssProps", () => {
		const node = el();
		node.setCssStyles({ color: "red" });
		expect(node.style.color).toBe("red");
		node.setCssProps({ "--custom": "3px" });
		expect(node.style.getPropertyValue("--custom")).toBe("3px");
	});
});

describe("DocumentFragment container helpers", () => {
	it("createEl works on a fragment", () => {
		const frag = document.createDocumentFragment() as unknown as {
			createEl: (tag: string, o?: unknown) => HTMLElement;
		};
		const child = frag.createEl("span", { text: "f" });
		expect(child.tagName).toBe("SPAN");
		expect(child.textContent).toBe("f");
	});
});
