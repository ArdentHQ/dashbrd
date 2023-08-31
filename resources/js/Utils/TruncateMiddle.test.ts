import { TruncateMiddle } from "./TruncateMiddle";
import { render, screen } from "@/Tests/testing-library";

describe("TruncateMiddle", () => {
    it("should middle truncate long values", () => {
        render(TruncateMiddle({ text: "long value to test with", length: 10 }));

        expect(screen.getByText("long … with")).toBeTruthy();
    });

    it("should not truncate short values", () => {
        render(TruncateMiddle({ text: "short", length: 10 }));

        expect(screen.getByText("short")).toBeTruthy();
    });

    it("should handle empty string", () => {
        const { container } = render(TruncateMiddle({ text: "", length: 10 }));

        expect(container.innerHTML).toHaveLength(0);
    });

    it("should handle undefined", () => {
        const { container } = render(TruncateMiddle({ text: undefined, length: 10 }));

        expect(container.innerHTML).toHaveLength(0);
    });

    it.each([
        [0, "…"],
        [1, "…"],
        [4, "lo…th"],
        [5, "lo…th"],
        [10, "long … with"],
        [12, "long v…t with"],
        [20, "long value… test with"],
        [30, "long value to test with"],
        [50, "long value to test with"],
    ])("should allow customizing length to truncate", (length, expected) => {
        render(TruncateMiddle({ text: "long value to test with", length }));

        expect(screen.getByText(expected)).toBeTruthy();
    });

    it.each([
        ["---", "long --- with"],
        ["??", "long ?? with"],
        ["abc", "long abc with"],
        [".", "long . with"],
        ["long value to test with", "long long value to test with with"],
    ])("should allow customizing the separator", (separator, expected) => {
        render(TruncateMiddle({ text: "long value to test with", length: 10, separator }));

        expect(screen.getByText(expected)).toBeTruthy();
    });
});
