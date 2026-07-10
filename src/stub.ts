/**
 * obsidian-test-kit/stub
 *
 * A runtime stand-in for the `obsidian` module, aliased to `obsidian` in a
 * consumer's Vitest config. It provides just enough behaviour for unit tests of
 * plugin logic.
 *
 * Two hard constraints hold this file together:
 *
 * 1. Import-safe without a DOM. Some consumers run Vitest with
 *    `environment: "node"` (no jsdom). Nothing at module top level may touch
 *    `document`/`window`. Class constructors MAY create DOM nodes, but only when
 *    executed, and DOM-touching constructors guard on `typeof document`.
 * 2. No `vi.*` usage. This module must import cleanly outside a test runner so
 *    tools can `import()` it in bare Node. Per-test spies belong in the
 *    consumer's test via `vi.mock(... importActual ...)`.
 */

import { createMoment } from "./moment.js";

// Re-exported so consumers get `import { moment } from "obsidian"`. The setup
// entry installs the same factory on `window.moment`; this export does NOT.
export const moment = createMoment;

/* -------------------------------------------------------------------------- */
/* Components                                                                 */
/* -------------------------------------------------------------------------- */

export class BaseComponent {
	disabled = false;

	then(cb: (component: this) => unknown): this {
		cb(this);
		return this;
	}

	setDisabled(disabled: boolean): this {
		this.disabled = disabled;
		return this;
	}
}

export class Component extends BaseComponent {
	app?: App;
	load(): void {}
	onload(): void {}
	unload(): void {}
	onunload(): void {}
	addChild<T>(child: T): T {
		return child;
	}
	removeChild<T>(child: T): T {
		return child;
	}
	register(_cb: () => unknown): void {}
	registerEvent(_eventRef: unknown): void {}
	registerDomEvent(): void {}
	registerInterval(id: number): number {
		return id;
	}
}

export class ButtonComponent extends BaseComponent {
	buttonEl: HTMLButtonElement;

	constructor(containerEl: HTMLElement) {
		super();
		this.buttonEl = document.createElement("button");
		containerEl.appendChild(this.buttonEl);
	}

	setButtonText(text: string): this {
		this.buttonEl.textContent = text;
		return this;
	}

	setIcon(icon: string): this {
		this.buttonEl.setAttribute("data-icon", icon);
		return this;
	}

	setTooltip(tooltip: string): this {
		this.buttonEl.title = tooltip;
		return this;
	}

	setClass(cls: string): this {
		this.buttonEl.className = cls;
		return this;
	}

	setCta(): this {
		this.buttonEl.classList.add("mod-cta");
		return this;
	}

	removeCta(): this {
		this.buttonEl.classList.remove("mod-cta");
		return this;
	}

	setWarning(): this {
		this.buttonEl.classList.add("mod-warning");
		return this;
	}

	override setDisabled(disabled: boolean): this {
		super.setDisabled(disabled);
		this.buttonEl.disabled = disabled;
		return this;
	}

	onClick(cb: (evt: MouseEvent) => void): this {
		this.buttonEl.addEventListener("click", cb as EventListener);
		return this;
	}
}

export class ToggleComponent extends BaseComponent {
	toggleEl: HTMLInputElement;

	constructor(containerEl: HTMLElement) {
		super();
		this.toggleEl = document.createElement("input");
		this.toggleEl.type = "checkbox";
		containerEl.appendChild(this.toggleEl);
	}

	getValue(): boolean {
		return this.toggleEl.checked;
	}

	setValue(value: boolean): this {
		this.toggleEl.checked = value;
		return this;
	}

	setTooltip(): this {
		return this;
	}

	onChange(cb: (value: boolean) => void): this {
		this.toggleEl.addEventListener("change", () => cb(this.toggleEl.checked));
		return this;
	}
}

export class DropdownComponent extends BaseComponent {
	selectEl: HTMLSelectElement;

	constructor(containerEl: HTMLElement) {
		super();
		this.selectEl = document.createElement("select");
		containerEl.appendChild(this.selectEl);
	}

	// quickadd uses addOption(value, text); podnotes uses addOptions(record).
	// Both are supported so either call site works against this stub.
	addOption(value: string, text: string): this {
		const option = document.createElement("option");
		option.value = value;
		option.textContent = text;
		this.selectEl.appendChild(option);
		return this;
	}

	addOptions(options: Record<string, string>): this {
		for (const [value, label] of Object.entries(options)) {
			this.addOption(value, label);
		}
		return this;
	}

	getValue(): string {
		return this.selectEl.value;
	}

	setValue(value: string): this {
		this.selectEl.value = value;
		return this;
	}

	override setDisabled(disabled: boolean): this {
		super.setDisabled(disabled);
		this.selectEl.disabled = disabled;
		return this;
	}

	onChange(cb: (value: string) => void): this {
		this.selectEl.addEventListener("change", () => cb(this.selectEl.value));
		return this;
	}
}

export class SliderComponent extends BaseComponent {
	sliderEl: HTMLInputElement;

	constructor(containerEl: HTMLElement) {
		super();
		this.sliderEl = document.createElement("input");
		this.sliderEl.type = "range";
		containerEl.appendChild(this.sliderEl);
	}

	setLimits(min: number, max: number, step = 1): this {
		this.sliderEl.min = String(min);
		this.sliderEl.max = String(max);
		this.sliderEl.step = String(step);
		return this;
	}

	getValue(): number {
		return Number(this.sliderEl.value);
	}

	setValue(value: number): this {
		this.sliderEl.value = String(value);
		return this;
	}

	setDynamicTooltip(): this {
		return this;
	}

	onChange(cb: (value: number) => void): this {
		this.sliderEl.addEventListener("input", () => cb(Number(this.sliderEl.value)));
		return this;
	}
}

export class TextComponent extends BaseComponent {
	inputEl: HTMLInputElement;

	constructor(containerEl: HTMLElement) {
		super();
		this.inputEl = document.createElement("input");
		containerEl.appendChild(this.inputEl);
	}

	getValue(): string {
		return this.inputEl.value;
	}

	setValue(value: string): this {
		this.inputEl.value = value;
		return this;
	}

	setPlaceholder(value: string): this {
		this.inputEl.placeholder = value;
		return this;
	}

	setTooltip(): this {
		return this;
	}

	override setDisabled(disabled: boolean): this {
		super.setDisabled(disabled);
		this.inputEl.disabled = disabled;
		return this;
	}

	onChange(cb: (value: string) => void): this {
		this.inputEl.addEventListener("input", () => cb(this.inputEl.value));
		return this;
	}
}

export class TextAreaComponent extends BaseComponent {
	inputEl: HTMLTextAreaElement;

	constructor(containerEl: HTMLElement) {
		super();
		this.inputEl = document.createElement("textarea");
		containerEl.appendChild(this.inputEl);
	}

	getValue(): string {
		return this.inputEl.value;
	}

	setValue(value: string): this {
		this.inputEl.value = value;
		return this;
	}

	setPlaceholder(value: string): this {
		this.inputEl.placeholder = value;
		return this;
	}

	setTooltip(): this {
		return this;
	}

	onChange(cb: (value: string) => void): this {
		this.inputEl.addEventListener("input", () => cb(this.inputEl.value));
		return this;
	}
}

// quickadd's SecretComponent takes (app, containerEl). Kept for surface parity.
export class SecretComponent extends BaseComponent {
	inputEl: HTMLInputElement;

	constructor(_app: App, containerEl: HTMLElement) {
		super();
		this.inputEl = document.createElement("input");
		containerEl.appendChild(this.inputEl);
	}

	setValue(value: string): this {
		this.inputEl.value = value;
		return this;
	}

	onChange(cb: (value: string) => void): this {
		this.inputEl.addEventListener("input", () => cb(this.inputEl.value));
		return this;
	}
}

export class Setting {
	settingEl: HTMLElement;
	infoEl: HTMLElement;
	nameEl: HTMLElement;
	descEl: HTMLElement;
	controlEl: HTMLElement;
	components: BaseComponent[] = [];

	constructor(containerEl: HTMLElement) {
		this.settingEl = document.createElement("div");
		this.infoEl = document.createElement("div");
		this.nameEl = document.createElement("div");
		this.descEl = document.createElement("div");
		this.controlEl = document.createElement("div");
		this.settingEl.appendChild(this.infoEl);
		this.settingEl.appendChild(this.controlEl);
		containerEl.appendChild(this.settingEl);
	}

	setName(name: string | DocumentFragment): this {
		if (typeof name === "string") this.nameEl.textContent = name;
		else this.nameEl.appendChild(name);
		if (!this.infoEl.contains(this.nameEl)) this.infoEl.appendChild(this.nameEl);
		return this;
	}

	setDesc(desc: string | DocumentFragment): this {
		if (typeof desc === "string") this.descEl.textContent = desc;
		else this.descEl.appendChild(desc);
		if (!this.infoEl.contains(this.descEl)) this.infoEl.appendChild(this.descEl);
		return this;
	}

	setClass(cls: string): this {
		this.settingEl.classList.add(cls);
		return this;
	}

	setTooltip(): this {
		return this;
	}

	setHeading(): this {
		this.settingEl.classList.add("setting-item-heading");
		return this;
	}

	setDisabled(): this {
		return this;
	}

	addButton(cb: (component: ButtonComponent) => unknown): this {
		const component = new ButtonComponent(this.controlEl);
		this.components.push(component);
		cb(component);
		return this;
	}

	addToggle(cb: (component: ToggleComponent) => unknown): this {
		const component = new ToggleComponent(this.controlEl);
		this.components.push(component);
		cb(component);
		return this;
	}

	addText(cb: (component: TextComponent) => unknown): this {
		const component = new TextComponent(this.controlEl);
		this.components.push(component);
		cb(component);
		return this;
	}

	addTextArea(cb: (component: TextAreaComponent) => unknown): this {
		const component = new TextAreaComponent(this.controlEl);
		this.components.push(component);
		cb(component);
		return this;
	}

	addDropdown(cb: (component: DropdownComponent) => unknown): this {
		const component = new DropdownComponent(this.controlEl);
		this.components.push(component);
		cb(component);
		return this;
	}

	addSlider(cb: (component: SliderComponent) => unknown): this {
		const component = new SliderComponent(this.controlEl);
		this.components.push(component);
		cb(component);
		return this;
	}

	addComponent<T extends BaseComponent>(cb: (el: HTMLElement) => T): this {
		const el = document.createElement("div");
		this.controlEl.appendChild(el);
		this.components.push(cb(el));
		return this;
	}

	then(cb: (setting: this) => unknown): this {
		cb(this);
		return this;
	}
}

export class SettingGroup {
	groupEl: HTMLElement;

	constructor(containerEl: HTMLElement) {
		this.groupEl = document.createElement("div");
		containerEl.appendChild(this.groupEl);
	}

	setHeading(text: string | DocumentFragment): this {
		const headingEl = document.createElement("h3");
		if (typeof text === "string") headingEl.textContent = text;
		else headingEl.appendChild(text);
		this.groupEl.appendChild(headingEl);
		return this;
	}

	addClass(cls: string): this {
		this.groupEl.classList.add(cls);
		return this;
	}

	addSetting(cb: (setting: Setting) => void): this {
		cb(new Setting(this.groupEl));
		return this;
	}
}

/* -------------------------------------------------------------------------- */
/* App, Plugin, Views                                                         */
/* -------------------------------------------------------------------------- */

export class App {
	private secretStore = new Map<string, string>();
	secretStorage = {
		getSecret: (name: string) => this.secretStore.get(name) ?? null,
		setSecret: (name: string, value: string) => {
			this.secretStore.set(name, value);
		},
		listSecrets: () => Array.from(this.secretStore.keys()),
		delete: async (name: string) => {
			this.secretStore.delete(name);
		},
	};
	workspace: Record<string, unknown> = {
		getActiveViewOfType: () => undefined,
		getActiveFile: () => null,
		getLeaf: () => ({}),
		getLeavesOfType: () => [],
		setActiveLeaf: () => {},
		iterateRootLeaves: () => {},
		getLastOpenFiles: () => [],
		on: () => ({}),
		off: () => {},
		trigger: () => {},
	};
	vault: Record<string, unknown> = {
		configDir: ".obsidian",
		getRoot: () => ({ path: "" }),
		getAllLoadedFiles: () => [],
		getMarkdownFiles: () => [],
		getFiles: () => [],
		getAbstractFileByPath: () => null,
		read: async () => "",
		modify: async () => {},
		cachedRead: async () => "",
		process: async (_file: unknown, fn: (data: string) => string) => fn(""),
		on: () => ({}),
		off: () => {},
	};
	metadataCache: Record<string, unknown> = {
		getFileCache: () => undefined,
		getCache: () => undefined,
		isUserIgnored: () => false,
		fileToLinktext: (file: { basename?: string } | null) => file?.basename ?? "",
		on: () => ({}),
		off: () => {},
	};
	commands: Record<string, unknown> = {
		commands: {},
		editorCommands: {},
		findCommand: () => undefined,
		executeCommandById: () => false,
	};
	fileManager: Record<string, unknown> = {
		generateMarkdownLink: () => "",
		processFrontMatter: async () => {},
	};
	keymap: Record<string, unknown> = {};
	scope: Scope = new Scope();
	plugins: Record<string, unknown> = {
		plugins: {},
		getPlugin: () => null,
		enabledPlugins: new Set<string>(),
	};
}

export interface PluginManifest {
	id: string;
	name: string;
	version: string;
	minAppVersion: string;
	dir: string;
}

export class Plugin extends Component {
	override app: App;
	manifest: PluginManifest;

	constructor(app?: App, manifest?: Partial<PluginManifest>) {
		super();
		this.app = app ?? new App();
		this.manifest = {
			id: "",
			name: "",
			version: "0.0.0",
			minAppVersion: "0.0.0",
			dir: "",
			...manifest,
		};
	}

	addRibbonIcon(): HTMLElement | { addClass(): void; setAttr(): void } {
		if (typeof document !== "undefined") return document.createElement("div");
		return { addClass() {}, setAttr() {} };
	}
	addStatusBarItem(): HTMLElement | Record<string, never> {
		if (typeof document !== "undefined") return document.createElement("div");
		return {};
	}
	addCommand<T extends object>(command: T): T {
		return command;
	}
	addSettingTab(): void {}
	async loadData(): Promise<unknown> {
		return null;
	}
	async saveData(_data: unknown): Promise<void> {}
	override onload(): void {}
	override onunload(): void {}
}

export class PluginSettingTab {
	app: App;
	plugin?: Plugin;
	containerEl: HTMLElement;
	icon?: string;

	constructor(app: App, plugin?: Plugin) {
		this.app = app;
		this.plugin = plugin;
		this.containerEl = document.createElement("div");
	}

	display(): void {}
	hide(): void {}
}

export class TAbstractFile {
	path = "";
	name = "";
	parent: TFolder | null = null;
	vault: unknown;
}

export class TFile extends TAbstractFile {
	basename = "";
	extension = "";
	stat = { ctime: 0, mtime: 0, size: 0 };

	// path is optional so `new TFile()` followed by field assignment works
	// (quickadd/podnotes patterns), while `new TFile("a/b.md")` parses the
	// name/basename/extension (metaedit's faithful constructor).
	constructor(path?: string) {
		super();
		if (path === undefined) return;
		this.path = path;
		const normalized = path.replace(/\\/g, "/");
		const parts = normalized.split("/");
		this.name = parts[parts.length - 1] ?? "";
		const dotIndex = this.name.lastIndexOf(".");
		if (dotIndex > -1) {
			this.basename = this.name.slice(0, dotIndex);
			this.extension = this.name.slice(dotIndex + 1);
		} else {
			this.basename = this.name;
			this.extension = "";
		}
	}
}

export class TFolder extends TAbstractFile {
	children: TAbstractFile[] = [];

	isRoot(): boolean {
		return this.path === "" || this.path === "/";
	}
}

export class WorkspaceLeaf {
	view: unknown;
	getViewState(): { state: Record<string, unknown> } {
		return { state: {} };
	}
	setViewState(): void {}
	openFile(): void {}
	detach(): void {}
}

export class View extends Component {
	leaf?: WorkspaceLeaf;
	constructor(leaf?: WorkspaceLeaf) {
		super();
		this.leaf = leaf;
	}
	getViewType(): string {
		return "";
	}
	getDisplayText(): string {
		return "";
	}
	async onOpen(): Promise<void> {}
	async onClose(): Promise<void> {}
}

export class ItemView extends View {
	getIcon(): string {
		return "";
	}
}

export class FileView extends ItemView {
	file?: TFile;
}

export class MarkdownView extends FileView {
	editor = {
		getCursor() {
			return { line: 0, ch: 0 };
		},
		replaceSelection() {},
		setCursor() {},
		getValue() {
			return "";
		},
		setValue() {},
	};
	getMode(): string {
		return "source";
	}
}

/* -------------------------------------------------------------------------- */
/* Modals & suggesters                                                        */
/* -------------------------------------------------------------------------- */

export class Modal {
	app: App;
	containerEl: HTMLElement;
	modalEl: HTMLElement;
	contentEl: HTMLElement;
	titleEl: HTMLElement;

	constructor(app: App) {
		this.app = app;
		this.containerEl = document.createElement("div");
		this.modalEl = document.createElement("div");
		this.titleEl = document.createElement("div");
		this.contentEl = document.createElement("div");
		this.modalEl.appendChild(this.titleEl);
		this.modalEl.appendChild(this.contentEl);
		this.containerEl.appendChild(this.modalEl);
	}

	// Attach to the document on open (not in the constructor) and detach on
	// close, so lifecycle tests observe the modal entering and leaving the DOM.
	open(): void {
		document.body.appendChild(this.containerEl);
		this.onOpen();
	}

	close(): void {
		this.onClose();
		this.containerEl.remove();
	}

	setTitle(title: string): this {
		this.titleEl.textContent = title;
		return this;
	}

	// Real Obsidian defines no-op lifecycle hooks so subclasses may call
	// super.onOpen()/super.onClose().
	onOpen(): void {}
	onClose(): void {}
}

export interface FuzzyMatch<T> {
	item: T;
	match: { score: number; matches: Array<[number, number]> };
}

export class SuggestModal<T = unknown> extends Modal {
	inputEl: HTMLInputElement;
	resultContainerEl: HTMLElement;
	limit = 0;
	emptyStateText = "";
	chooser: { values: Array<FuzzyMatch<T>>; selectedItem: number };

	constructor(app: App) {
		super(app);
		this.inputEl = document.createElement("input");
		this.resultContainerEl = document.createElement("div");
		this.modalEl.appendChild(this.inputEl);
		this.modalEl.appendChild(this.resultContainerEl);
		this.chooser = { values: [], selectedItem: 0 };
	}

	setPlaceholder(placeholder: string): void {
		this.inputEl.placeholder = placeholder;
	}

	setInstructions(): void {}

	getSuggestions(_query: string): Array<FuzzyMatch<T>> | FuzzyMatch<T>[] {
		return [];
	}

	renderSuggestion(_value: FuzzyMatch<T>, _el: HTMLElement): void {}

	onChooseSuggestion(_value: FuzzyMatch<T>, _evt: MouseEvent | KeyboardEvent): void {}

	selectSuggestion(value: FuzzyMatch<T>, evt: MouseEvent | KeyboardEvent): void {
		this.onChooseSuggestion(value, evt);
	}
}

export class FuzzySuggestModal<T = unknown> extends SuggestModal<T> {
	getItems(): T[] {
		return [];
	}

	getItemText(_item: T): string {
		return "";
	}

	onChooseItem(_item: T, _evt?: MouseEvent | KeyboardEvent): void {}

	// Graded scoring standing in for Obsidian's fuzzy matcher: exact match beats
	// prefix beats substring. An empty query keeps every item (score 0). This is
	// NOT subsequence fuzzy matching; assert real ranking in live e2e tests.
	override getSuggestions(query: string): Array<FuzzyMatch<T>> {
		const normalizedQuery = query.toLowerCase();

		const suggestions = this.getItems()
			.map((item) => {
				const text = this.getItemText(item);
				const lowerText = text.toLowerCase();

				let score = -Infinity;
				if (!normalizedQuery) score = 0;
				else if (lowerText === normalizedQuery) score = 3;
				else if (lowerText.startsWith(normalizedQuery)) score = 2;
				else if (lowerText.includes(normalizedQuery)) score = 1;

				return { item, match: { score, matches: [] as Array<[number, number]> } };
			})
			.filter((suggestion) => (normalizedQuery ? suggestion.match.score > -Infinity : true))
			.sort((a, b) => b.match.score - a.match.score);

		this.chooser.values = suggestions;
		this.chooser.selectedItem = 0;
		return suggestions;
	}

	override renderSuggestion(value: FuzzyMatch<T>, el: HTMLElement): void {
		el.textContent = this.getItemText(value.item);
	}

	override onChooseSuggestion(value: FuzzyMatch<T>, evt: MouseEvent | KeyboardEvent): void {
		this.onChooseItem(value.item, evt);
	}
}

export class AbstractInputSuggest<T = unknown> {
	app: App;
	inputEl: HTMLInputElement;

	constructor(app: App, inputEl: HTMLInputElement) {
		this.app = app;
		this.inputEl = inputEl;
	}

	getSuggestions(_query: string): T[] | Promise<T[]> {
		return [];
	}

	renderSuggestion(_value: T, _el: HTMLElement): void {}

	selectSuggestion(_value: T): void {}

	onSelect(_cb: (value: T, evt: MouseEvent | KeyboardEvent) => void): this {
		return this;
	}

	setValue(_value: string): void {}

	close(): void {}
}

/* -------------------------------------------------------------------------- */
/* Notice, Scope, Menu                                                        */
/* -------------------------------------------------------------------------- */

export class Notice {
	// Records every Notice constructed. quickadd asserts against the instances;
	// metaedit asserts against the flattened `messages`. reset() clears both
	// between tests.
	static instances: Notice[] = [];

	static get messages(): string[] {
		return Notice.instances.map((instance) => instance.message);
	}

	static reset(): void {
		Notice.instances.length = 0;
	}

	message: string;
	timeout?: number;
	noticeEl?: HTMLElement;
	containerEl?: HTMLElement;
	messageEl?: HTMLElement;

	// DOM nodes are built only when a document exists, so node-environment tests
	// (metaedit) can construct a Notice while jsdom tests still get messageEl.
	constructor(message?: string | DocumentFragment, timeout?: number) {
		this.message = typeof message === "string" ? message : (message?.textContent ?? "");
		this.timeout = timeout;
		if (typeof document !== "undefined") {
			this.containerEl = document.createElement("div");
			this.messageEl = document.createElement("div");
			this.noticeEl = this.messageEl;
			this.containerEl.appendChild(this.messageEl);
			this.messageEl.textContent = this.message;
		}
		Notice.instances.push(this);
	}

	setMessage(message: string | DocumentFragment): this {
		this.message = typeof message === "string" ? message : (message.textContent ?? "");
		if (this.messageEl) this.messageEl.textContent = this.message;
		return this;
	}

	hide(): void {}
}

export class Scope {
	callbacks = new Map<string, (event: unknown) => unknown>();

	register(_hotkeys: unknown, key: unknown, callback?: (event: unknown) => unknown): void {
		if (typeof key === "string" && typeof callback === "function") {
			this.callbacks.set(key, callback);
		} else if (typeof key === "function") {
			this.callbacks.set("", key as (event: unknown) => unknown);
		}
	}

	unregister(): void {}

	trigger(key: string, event: unknown = { isComposing: false }): unknown {
		return this.callbacks.get(key)?.(event);
	}
}

export class MenuItem {
	title = "";
	icon = "";
	disabled = false;
	clickHandler: (() => void) | null = null;

	setTitle(title: string): this {
		this.title = title;
		return this;
	}
	setIcon(icon: string): this {
		this.icon = icon;
		return this;
	}
	setDisabled(disabled: boolean): this {
		this.disabled = disabled;
		return this;
	}
	setChecked(): this {
		return this;
	}
	setSection(): this {
		return this;
	}
	onClick(handler: () => void): this {
		this.clickHandler = handler;
		return this;
	}
}

export class Menu {
	// Records how the menu was shown so tests can assert the keyboard vs mouse path.
	static lastShown: Menu | null = null;
	items: MenuItem[] = [];
	shownAt: { type: "mouse" | "position"; detail: unknown } | null = null;

	addItem(cb: (item: MenuItem) => void): this {
		const item = new MenuItem();
		cb(item);
		this.items.push(item);
		return this;
	}
	addSeparator(): this {
		return this;
	}
	showAtMouseEvent(evt: MouseEvent): this {
		this.shownAt = { type: "mouse", detail: evt };
		Menu.lastShown = this;
		return this;
	}
	showAtPosition(pos: { x: number; y: number }): this {
		this.shownAt = { type: "position", detail: pos };
		Menu.lastShown = this;
		return this;
	}
	hide(): this {
		return this;
	}
}

/* -------------------------------------------------------------------------- */
/* Rendering & networking                                                     */
/* -------------------------------------------------------------------------- */

export const MarkdownRenderer = {
	async render(
		_app: unknown,
		source: string,
		el: HTMLElement,
		sourcePath: string,
		component: unknown,
	): Promise<void> {
		await MarkdownRenderer.renderMarkdown(source, el, sourcePath, component);
	},

	// Renders **bold** spans only; everything else is emitted as text. Enough to
	// assert that bold markup produced <strong> nodes.
	async renderMarkdown(
		source: string,
		el: HTMLElement,
		_sourcePath: string,
		_component: unknown,
	): Promise<void> {
		el.replaceChildren();
		const strongPattern = /\*\*([^*]+)\*\*/g;
		let cursor = 0;
		let match: RegExpExecArray | null;

		while ((match = strongPattern.exec(source)) !== null) {
			if (match.index > cursor) {
				el.appendChild(document.createTextNode(source.slice(cursor, match.index)));
			}
			const strong = document.createElement("strong");
			strong.textContent = match[1] ?? "";
			el.appendChild(strong);
			cursor = match.index + match[0].length;
		}

		if (cursor < source.length) {
			el.appendChild(document.createTextNode(source.slice(cursor)));
		}
	},
};

export const htmlToMarkdown = (html: string): string => html;

export interface RequestUrlParam {
	url: string;
	method?: string;
	headers?: Record<string, string>;
	body?: string | ArrayBuffer;
	throw?: boolean;
}

export interface RequestUrlResponse {
	status: number;
	headers: Record<string, string>;
	arrayBuffer: ArrayBuffer;
	text: string;
	readonly json: unknown;
}

// fetch-backed, with the faithful RequestUrlResponse shape: `json` is a lazily
// evaluated PROPERTY (getter over the already-read body), not a method, matching
// the real API so `response.json` works and `vi.mock` overrides stay realistic.
export async function requestUrl(
	request: string | RequestUrlParam,
): Promise<RequestUrlResponse> {
	const param: RequestUrlParam = typeof request === "string" ? { url: request } : request;
	const response = await fetch(param.url, {
		method: param.method,
		headers: param.headers,
		body: param.body,
	});

	const arrayBuffer = await response.arrayBuffer();
	const text = new TextDecoder().decode(arrayBuffer);

	const headers: Record<string, string> = {};
	response.headers?.forEach?.((value: string, key: string) => {
		headers[key] = value;
	});

	return {
		status: response.status,
		headers,
		arrayBuffer,
		text,
		get json() {
			return JSON.parse(text);
		},
	};
}

/* -------------------------------------------------------------------------- */
/* Pure helpers                                                               */
/* -------------------------------------------------------------------------- */

// Mirrors real Obsidian: convert separators to `/`, collapse repeats, trim edge
// slashes, NFC-normalize, and return "/" for an emptied path. Deliberately does
// NOT resolve `..`/`.` segments -- real normalizePath leaves them in place, so
// resolving here would mask genuine path bugs in a consumer.
export function normalizePath(path: string): string {
	let result = path.replace(/([\\/])+/g, "/");
	result = result.replace(/(^\/+|\/+$)/g, "");
	result = result.normalize("NFC");
	if (result === "") result = "/";
	return result;
}

// Returns the path portion of a link, dropping the `#heading`/`#^block` subpath.
export function getLinkpath(linktext: string): string {
	const hashIndex = linktext.indexOf("#");
	return hashIndex === -1 ? linktext : linktext.slice(0, hashIndex);
}

export interface FrontMatterInfo {
	exists: boolean;
	frontmatter: string;
	from: number;
	to: number;
	contentStart: number;
}

// The opening `---` must be at offset 0 and the block closes with a `---` line.
// `frontmatter` is the text between the fences. Handles a closing fence at EOF
// without a trailing newline.
export function getFrontMatterInfo(content: string): FrontMatterInfo {
	const none: FrontMatterInfo = {
		exists: false,
		frontmatter: "",
		from: 0,
		to: 0,
		contentStart: 0,
	};

	const open = /^---(\r?\n)/.exec(content);
	if (!open) return none;
	const from = open[0].length;

	const close = /---(\r?\n|$)/g;
	close.lastIndex = from;
	let match = close.exec(content);
	while (match && content.charAt(match.index - 1) !== "\n") {
		match = close.exec(content);
	}
	if (!match) return none;

	return {
		exists: true,
		frontmatter: content.slice(from, match.index),
		from,
		to: match.index,
		contentStart: close.lastIndex,
	};
}

// Minimal YAML: flat `key: value` pairs with scalar values, inline arrays
// ([a, b]), simple block lists, quoted strings, numbers, booleans and null.
// NOT a full parser -- assert real YAML semantics in live e2e tests.
export function parseYaml(yaml: string): Record<string, unknown> {
	const result: Record<string, unknown> = {};
	const lines = yaml.split(/\r?\n/);
	let currentKey: string | null = null;

	const parseScalar = (raw: string): unknown => {
		const value = raw.trim();
		if (value === "") return null;
		if (value === "true") return true;
		if (value === "false") return false;
		if (value === "null" || value === "~") return null;
		if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value);
		if (/^\[.*\]$/.test(value)) {
			const inner = value.slice(1, -1).trim();
			return inner === "" ? [] : inner.split(",").map((item) => parseScalar(item));
		}
		if (/^(['"]).*\1$/.test(value)) return value.slice(1, -1);
		return value;
	};

	for (const line of lines) {
		if (!line.trim() || line.trim().startsWith("#")) continue;

		const listMatch = /^\s+-\s*(.*)$/.exec(line);
		if (listMatch && currentKey) {
			if (!Array.isArray(result[currentKey])) result[currentKey] = [];
			(result[currentKey] as unknown[]).push(parseScalar(listMatch[1] ?? ""));
			continue;
		}

		const kvMatch = /^([^:\s][^:]*):\s*(.*)$/.exec(line);
		if (kvMatch) {
			const key = (kvMatch[1] ?? "").trim();
			currentKey = key;
			result[key] = (kvMatch[2] ?? "").trim() === "" ? null : parseScalar(kvMatch[2] ?? "");
		}
	}

	return result;
}

/* -------------------------------------------------------------------------- */
/* DOM helpers usable without the jsdom setup                                 */
/* -------------------------------------------------------------------------- */

// Replaces the element's existing icon with a single <svg data-icon="...">.
// Does NOT clear textContent, so surrounding labels survive an icon swap.
export function setIcon(parent: HTMLElement, iconId: string): void {
	const existing = parent.querySelector("svg");
	if (existing) existing.remove();
	const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	svg.setAttribute("data-icon", iconId);
	parent.appendChild(svg);
}

// Reflects the tooltip into aria-label so it stays assertable; clears it when empty.
export function setTooltip(el: HTMLElement, tooltip: string): void {
	if (tooltip) el.setAttribute("aria-label", tooltip);
	else el.removeAttribute("aria-label");
}

/* -------------------------------------------------------------------------- */
/* Timing & search                                                            */
/* -------------------------------------------------------------------------- */

export interface Debounced<T extends (...args: never[]) => unknown> {
	(...args: Parameters<T>): void;
	cancel(): void;
}

// setTimeout(0)-based with a working cancel(). Deferring to a timer (rather than
// running synchronously) is what makes cancel() meaningful: a consumer that
// debounces then cancels before the timer flushes must observe the call being
// dropped. Under fake timers, flush with vi.runAllTimers().
export function debounce<T extends (...args: never[]) => unknown>(
	fn: T,
	_wait = 0,
	_resetTimer = false,
): Debounced<T> {
	let timeout: ReturnType<typeof setTimeout> | undefined;

	const debounced = (...args: Parameters<T>): void => {
		if (timeout) clearTimeout(timeout);
		timeout = setTimeout(() => fn(...args), 0);
	};

	debounced.cancel = (): void => {
		if (timeout) {
			clearTimeout(timeout);
			timeout = undefined;
		}
	};

	return debounced;
}

// Substring (NOT subsequence) matcher standing in for Obsidian's fuzzy search.
// Returns a SearchResult-like object when the query is a case-insensitive
// substring of the text, else null. Scores are always 0; the single match range
// covers the first hit. Do NOT assert graded fuzzy scores against this.
export function prepareFuzzySearch(
	query: string,
): (text: string) => { score: number; matches: Array<[number, number]> } | null {
	const q = query.toLowerCase();
	return (text: string) => {
		if (q.length === 0) return { score: 0, matches: [] };
		const idx = text.toLowerCase().indexOf(q);
		return idx >= 0 ? { score: 0, matches: [[idx, idx + q.length]] } : null;
	};
}

/* -------------------------------------------------------------------------- */
/* Platform & filesystem                                                      */
/* -------------------------------------------------------------------------- */

// Mutable so a test can simulate a different OS (e.g. set isMacOS false,
// isLinux true). Defaults to a desktop macOS profile.
export const Platform = {
	isDesktop: true,
	isMobile: false,
	isDesktopApp: true,
	isMobileApp: false,
	isPhone: false,
	isTablet: false,
	isWin: false,
	isMacOS: true,
	isLinux: false,
	isIosApp: false,
	isAndroidApp: false,
	isSafari: false,
};

export class FileSystemAdapter {
	private readonly basePath: string;
	constructor(basePath = "/vault") {
		this.basePath = basePath;
	}
	getBasePath(): string {
		return this.basePath;
	}
	getFullPath(normalizedPath: string): string {
		return `${this.basePath}/${normalizedPath}`.replace(/\/+/g, "/");
	}
}

/* -------------------------------------------------------------------------- */
/* Default export mirror                                                      */
/* -------------------------------------------------------------------------- */

export default {
	moment,
	BaseComponent,
	Component,
	ButtonComponent,
	ToggleComponent,
	DropdownComponent,
	SliderComponent,
	TextComponent,
	TextAreaComponent,
	SecretComponent,
	Setting,
	SettingGroup,
	App,
	Plugin,
	PluginSettingTab,
	TAbstractFile,
	TFile,
	TFolder,
	WorkspaceLeaf,
	View,
	ItemView,
	FileView,
	MarkdownView,
	Modal,
	SuggestModal,
	FuzzySuggestModal,
	AbstractInputSuggest,
	Notice,
	Scope,
	Menu,
	MenuItem,
	MarkdownRenderer,
	htmlToMarkdown,
	requestUrl,
	normalizePath,
	getLinkpath,
	getFrontMatterInfo,
	parseYaml,
	setIcon,
	setTooltip,
	debounce,
	prepareFuzzySearch,
	Platform,
	FileSystemAdapter,
};
