import { describe, expect, it } from "vitest";

// Under jsdom with the matchers entry loaded via setupFiles.
describe("matchers entry", () => {
	it("registers jest-dom matchers on expect", () => {
		const node = document.body.appendChild(document.createElement("button"));
		node.className = "mod-cta";
		node.textContent = "Save";

		expect(node).toBeInTheDocument();
		expect(node).toHaveClass("mod-cta");
		expect(node).toHaveTextContent("Save");
		expect(() => expect(node).not.toBeInTheDocument()).toThrow();

		node.remove();
		expect(node).not.toBeInTheDocument();
	});
});
