/**
 * obsidian-test-kit/setup/moment
 *
 * Installs the shared moment factory on `window.moment`, matching how Obsidian
 * exposes moment globally. Guarded so an existing `window.moment` (a test's own
 * override, or a double-import) is left untouched.
 */

import { createMoment } from "../moment.js";

export function installMoment(): void {
	if (typeof window === "undefined") return;
	const target = window as unknown as { moment?: unknown };
	if (target.moment === undefined) target.moment = createMoment;
}

installMoment();
