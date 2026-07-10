/**
 * obsidian-test-kit/setup/globals
 *
 * Installs the ambient globals Obsidian code reaches for that jsdom lacks:
 * `activeWindow`/`activeDocument` (popout-window aware aliases), a memory
 * localStorage fallback, an IntersectionObserver that reports immediate
 * intersection, and Element.prototype.scrollIntoView. Every install is guarded
 * and idempotent.
 */

function createMemoryStorage(): Storage {
	const items = new Map<string, string>();
	return {
		get length() {
			return items.size;
		},
		clear: () => items.clear(),
		getItem: (key: string) => items.get(key) ?? null,
		key: (index: number) => Array.from(items.keys())[index] ?? null,
		removeItem: (key: string) => {
			items.delete(key);
		},
		setItem: (key: string, value: string) => {
			items.set(key, value);
		},
	};
}

function ensureLocalStorage(): void {
	if (typeof window === "undefined") return;
	let storage: Storage | undefined;
	try {
		storage = window.localStorage;
	} catch {
		storage = undefined;
	}
	if (!storage) storage = createMemoryStorage();

	Object.defineProperty(globalThis, "localStorage", { configurable: true, value: storage });
	Object.defineProperty(window, "localStorage", { configurable: true, value: storage });
}

function ensureActiveWindowDocument(): void {
	if (typeof window === "undefined") return;
	const g = globalThis as { activeWindow?: unknown; activeDocument?: unknown };
	if (typeof g.activeWindow === "undefined") {
		Object.defineProperty(globalThis, "activeWindow", { configurable: true, get: () => window });
	}
	if (typeof g.activeDocument === "undefined") {
		Object.defineProperty(globalThis, "activeDocument", {
			configurable: true,
			get: () => document,
		});
	}
}

function ensureIntersectionObserver(): void {
	if (typeof IntersectionObserver !== "undefined") return;

	class MockIntersectionObserver implements IntersectionObserver {
		readonly root: Element | Document | null = null;
		readonly rootMargin: string;
		readonly thresholds: ReadonlyArray<number> = [0];

		constructor(
			private callback: IntersectionObserverCallback,
			options?: IntersectionObserverInit,
		) {
			this.rootMargin = options?.rootMargin ?? "0px";
		}

		disconnect(): void {}
		observe(target: Element): void {
			this.callback(
				[
					{
						isIntersecting: true,
						target,
						intersectionRatio: 1,
						boundingClientRect: target.getBoundingClientRect(),
						intersectionRect: target.getBoundingClientRect(),
						rootBounds: null,
						time: 0,
					} as IntersectionObserverEntry,
				],
				this,
			);
		}
		takeRecords(): IntersectionObserverEntry[] {
			return [];
		}
		unobserve(): void {}
	}

	(globalThis as { IntersectionObserver?: unknown }).IntersectionObserver = MockIntersectionObserver;
}

function ensureScrollIntoView(): void {
	if (typeof Element === "undefined") return;
	if (!Element.prototype.scrollIntoView) {
		Element.prototype.scrollIntoView = function scrollIntoView() {};
	}
}

export function installGlobals(): void {
	ensureLocalStorage();
	ensureActiveWindowDocument();
	ensureIntersectionObserver();
	ensureScrollIntoView();
}

installGlobals();
