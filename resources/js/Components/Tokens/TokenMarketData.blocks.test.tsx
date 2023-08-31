import React from "react";
import { TokenPricePeriod } from "./TokenMarketData.blocks";
import { Period } from "@/Components/Tokens/Tokens.contracts";
import { render, screen, userEvent } from "@/Tests/testing-library";

describe("TokenPricePeriod", () => {
    it("should render", () => {
        render(<TokenPricePeriod onChange={vi.fn()} />);

        expect(screen.getByText(Period.DAY)).toBeTruthy();
        expect(screen.getByText(Period.WEEK)).toBeTruthy();
        expect(screen.getByText(Period.MONTH)).toBeTruthy();
        expect(screen.getByText(Period.YEAR)).toBeTruthy();
    });

    it("should execute onChange callback when clicked", async () => {
        const onChange = vi.fn();

        render(<TokenPricePeriod onChange={onChange} />);

        await userEvent.click(screen.getByText(Period.WEEK));

        expect(onChange).toHaveBeenCalledWith(Object.values(Period).indexOf(Period.WEEK));
    });
});
