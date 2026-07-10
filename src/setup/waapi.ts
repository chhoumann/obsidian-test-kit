/**
 * obsidian-test-kit/setup/waapi
 *
 * jsdom does not implement the Web Animations API that Svelte transitions rely
 * on. This installs a minimal Element.prototype.animate returning a stub
 * Animation. Guarded and idempotent.
 *
 * Fidelity gaps (acceptable for rendering CSS transitions in component tests):
 * `onfinish` fires on a microtask rather than after the real duration,
 * `playState` is always "finished", and `finished` is pre-resolved and ignores
 * cancel(). If a test must assert mid-transition timing, replace this with a
 * timer-driven fake rather than leaning on these defaults.
 */

export function installWaapi(): void {
	if (typeof Element === "undefined") return;
	const proto = Element.prototype as unknown as { animate?: unknown };
	if (typeof proto.animate === "function") return;

	proto.animate = function animate() {
		let onfinish: (() => void) | null = null;
		const animation = {
			cancel() {},
			finish() {},
			play() {},
			pause() {},
			reverse() {},
			currentTime: 0,
			startTime: 0,
			playbackRate: 1,
			playState: "finished",
			finished: Promise.resolve(),
			effect: null,
			addEventListener() {},
			removeEventListener() {},
			get onfinish() {
				return onfinish;
			},
			set onfinish(fn: (() => void) | null) {
				onfinish = fn;
				if (fn) queueMicrotask(() => fn());
			},
			oncancel: null,
		};

		return animation as unknown as Animation;
	};
}

installWaapi();
