/**
 * obsidian-test-kit/setup
 *
 * The jsdom setup barrel. Reference it from Vitest's `setupFiles` in a jsdom
 * project to install every polyfill Obsidian plugin code expects. Importing this
 * module runs each install once; the individual installers are re-exported so a
 * test can re-run a specific one (each is guarded and idempotent).
 *
 * This entry installs polyfills only. Add the jest-dom matchers via the separate
 * `obsidian-test-kit/matchers` entry when you want them.
 */

import "./dom.js";
import "./moment.js";
import "./globals.js";
import "./waapi.js";

export { installDom } from "./dom.js";
export { installMoment } from "./moment.js";
export { installGlobals } from "./globals.js";
export { installWaapi } from "./waapi.js";
