// A tiny, dependency-free stand-in for Obsidian's bundled moment. It is
// DOM-free so the stub entry can export it without pulling in `window`, and the
// setup entry installs the same factory on `window.moment`.
//
// Fidelity note: this is NOT moment.js. It supports the handful of tokens and
// chainable methods the three consumer plugins actually use, formats in UTC so
// results are deterministic across timezones, and returns a chainable object.
// Assert real moment semantics (locales, DST, arbitrary tokens) in live e2e
// tests, not against this stub.

const MONTHS = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
] as const;

const pad = (value: number): string => value.toString().padStart(2, "0");

function formatDate(date: Date, pattern: string): string {
	const monthIndex = date.getUTCMonth();
	const tokens: Record<string, string> = {
		YYYY: date.getUTCFullYear().toString(),
		MMMM: MONTHS[monthIndex] ?? "",
		MMM: (MONTHS[monthIndex] ?? "").slice(0, 3),
		MM: pad(monthIndex + 1),
		DD: pad(date.getUTCDate()),
		HH: pad(date.getUTCHours()),
		mm: pad(date.getUTCMinutes()),
		ss: pad(date.getUTCSeconds()),
	};

	// Single pass so a replacement's output is never itself re-matched. The
	// alternation lists longer tokens first so `MMMM` wins over `MM`.
	return pattern.replace(/YYYY|MMMM|MMM|MM|DD|HH|mm|ss/g, (token) => tokens[token] ?? token);
}

const UNIT_MS: Record<string, number> = {
	millisecond: 1,
	milliseconds: 1,
	second: 1000,
	seconds: 1000,
	minute: 60_000,
	minutes: 60_000,
	hour: 3_600_000,
	hours: 3_600_000,
	day: 86_400_000,
	days: 86_400_000,
	week: 604_800_000,
	weeks: 604_800_000,
};

export interface StubMoment {
	format(pattern?: string): string;
	startOf(unit?: string): StubMoment;
	endOf(unit?: string): StubMoment;
	add(amount: number, unit?: string): StubMoment;
	subtract(amount: number, unit?: string): StubMoment;
	seconds(value: number): StubMoment;
	isValid(): boolean;
	toISOString(): string;
	toDate(): Date;
	valueOf(): number;
	unix(): number;
}

export function createMoment(input?: Date | string | number): StubMoment {
	let date =
		input instanceof Date ? new Date(input.getTime()) : input != null ? new Date(input) : new Date();

	const api: StubMoment = {
		format: (pattern = "YYYY-MM-DD") => formatDate(date, pattern),
		startOf: (unit) => {
			if (unit === "day") {
				date = new Date(
					Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0),
				);
			}
			return api;
		},
		endOf: (unit) => {
			if (unit === "day") {
				date = new Date(
					Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999),
				);
			}
			return api;
		},
		add: (amount, unit = "milliseconds") => {
			date = new Date(date.getTime() + amount * (UNIT_MS[unit] ?? 0));
			return api;
		},
		subtract: (amount, unit = "milliseconds") => {
			date = new Date(date.getTime() - amount * (UNIT_MS[unit] ?? 0));
			return api;
		},
		seconds: (value) => {
			const updated = new Date(date);
			updated.setUTCSeconds(value, 0);
			date = updated;
			return api;
		},
		isValid: () => !Number.isNaN(date.getTime()),
		toISOString: () => date.toISOString(),
		toDate: () => new Date(date),
		valueOf: () => date.getTime(),
		unix: () => Math.floor(date.getTime() / 1000),
	};

	return api;
}
