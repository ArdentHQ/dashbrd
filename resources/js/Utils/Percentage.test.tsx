import React from "react";
import { FormatPercentage } from "./Percentage";
import { render } from "@/Tests/testing-library";

describe("FormatPercentage", () => {
    it("should format a number", () => {
        const { container } = render(<FormatPercentage value={0.12345} />);

        expect(container).toHaveTextContent("12.3%");
    });

    it("should format a number without decimals", () => {
        const { container } = render(
            <FormatPercentage
                value={0.12345}
                decimals={0}
            />,
        );

        expect(container).toHaveTextContent("12%");
    });

    it("should omit decimals if 0", () => {
        const { container } = render(<FormatPercentage value={0.12045} />);

        expect(container).toHaveTextContent("12%");
    });

    it("should hide sign", () => {
        const { container } = render(
            <FormatPercentage
                value={0.121}
                showSign={false}
            />,
        );

        expect(container).toHaveTextContent("12.1");
    });
});
