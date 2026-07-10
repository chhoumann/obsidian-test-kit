/**
 * obsidian-test-kit/setup/dom
 *
 * Installs the Element-prototype helpers Obsidian adds at runtime but jsdom does
 * not (createEl, createDiv, createSpan, empty, addClass/removeClass, setAttr,
 * setText, setCssStyles, setCssProps). Helpers land on HTMLElement, SVGElement,
 * and (for the container helpers) DocumentFragment prototypes.
 *
 * Every install is guarded: if a method already exists it is left untouched, so
 * a test that installs its own helper still wins and a double-import is a no-op.
 * Import for side effects, or call installDom() to run the guarded install again.
 */

type CreateElOptions = {
	cls?: string | string[];
	text?: string;
	href?: string;
	title?: string;
	type?: string;
	value?: string;
	placeholder?: string;
	attr?: Record<string, string | number | boolean | null | undefined>;
};

type Container = HTMLElement | SVGElement | DocumentFragment;

function applyOptions(el: HTMLElement, options?: string | CreateElOptions): void {
	if (options === undefined) return;
	if (typeof options === "string") {
		el.className = options;
		return;
	}
	if (options.cls) el.className = Array.isArray(options.cls) ? options.cls.join(" ") : options.cls;
	if (options.text !== undefined) el.textContent = options.text;
	if (options.href !== undefined) el.setAttribute("href", options.href);
	if (options.title !== undefined) el.setAttribute("title", options.title);
	if (options.type !== undefined) el.setAttribute("type", options.type);
	if (options.value !== undefined) (el as HTMLInputElement).value = options.value;
	if (options.placeholder !== undefined) el.setAttribute("placeholder", options.placeholder);
	if (options.attr) {
		for (const [key, value] of Object.entries(options.attr)) {
			if (value !== null && value !== undefined) el.setAttribute(key, String(value));
		}
	}
}

function createEl(
	this: Container,
	tag: string,
	options?: string | CreateElOptions,
	callback?: (el: HTMLElement) => void,
): HTMLElement {
	const el = document.createElement(tag);
	applyOptions(el, options);
	this.appendChild(el);
	callback?.(el);
	return el;
}

function createDiv(
	this: Container,
	options?: string | CreateElOptions,
	callback?: (el: HTMLElement) => void,
): HTMLElement {
	return createEl.call(this, "div", options, callback);
}

function createSpan(
	this: Container,
	options?: string | CreateElOptions,
	callback?: (el: HTMLElement) => void,
): HTMLElement {
	return createEl.call(this, "span", options, callback);
}

function empty(this: Container): void {
	while (this.firstChild) this.removeChild(this.firstChild);
}

function addClass(this: Element, ...classes: string[]): void {
	this.classList.add(...classes);
}

function removeClass(this: Element, ...classes: string[]): void {
	this.classList.remove(...classes);
}

function setAttr(this: Element, name: string, value: string | number | boolean | null): void {
	if (value === null || value === false) this.removeAttribute(name);
	else this.setAttribute(name, value === true ? "" : String(value));
}

function setText(this: Node, text: string): void {
	this.textContent = text;
}

function setCssStyles(this: { style: CSSStyleDeclaration }, styles: Partial<CSSStyleDeclaration>): void {
	Object.assign(this.style, styles);
}

function setCssProps(this: { style: CSSStyleDeclaration }, props: Record<string, string>): void {
	for (const [key, value] of Object.entries(props)) this.style.setProperty(key, value);
}

function define(proto: object, name: string, fn: (...args: never[]) => unknown): void {
	const target = proto as Record<string, unknown>;
	if (typeof target[name] !== "function") target[name] = fn;
}

export function installDom(): void {
	if (typeof HTMLElement === "undefined") return;

	// Container-creation + text helpers apply to element prototypes and to
	// DocumentFragment (Obsidian's createEl/createDiv work on fragments too).
	const containerProtos: object[] = [HTMLElement.prototype];
	if (typeof SVGElement !== "undefined") containerProtos.push(SVGElement.prototype);
	if (typeof DocumentFragment !== "undefined") containerProtos.push(DocumentFragment.prototype);

	for (const proto of containerProtos) {
		define(proto, "createEl", createEl as never);
		define(proto, "createDiv", createDiv as never);
		define(proto, "createSpan", createSpan as never);
		define(proto, "empty", empty as never);
		define(proto, "setText", setText as never);
	}

	// classList/attribute/style helpers apply to element prototypes only.
	const elementProtos: object[] = [HTMLElement.prototype];
	if (typeof SVGElement !== "undefined") elementProtos.push(SVGElement.prototype);

	for (const proto of elementProtos) {
		define(proto, "addClass", addClass as never);
		define(proto, "removeClass", removeClass as never);
		define(proto, "setAttr", setAttr as never);
		define(proto, "setCssStyles", setCssStyles as never);
		define(proto, "setCssProps", setCssProps as never);
	}
}

installDom();
