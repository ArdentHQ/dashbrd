import React from "react";
import { BalanceHeaderMobile } from "./BalanceHeaderMobile";
import { SliderContext } from "@/Components/Slider";
import { render, screen } from "@/Tests/testing-library";
import { Breakpoint } from "@/Tests/utils";

describe("BalanceHeaderMobile", () => {
    const address = "0x1234567890123456789012345678901234567890";
    const balance = "34253.75";

    it("should render", () => {
        const function_ = vi.fn();

        render(
            <SliderContext.Provider value={{ isOpen: false, setOpen: function_ }}>
                <BalanceHeaderMobile
                    balance={balance}
                    address={address}
                    assets={[]}
                    currency="usd"
                />
            </SliderContext.Provider>,
            { breakpoint: Breakpoint.xs },
        );

        expect(screen.getByTestId("BalanceHeaderMobile")).toBeInTheDocument();
        expect(screen.getAllByText("$34,253.75")).toHaveLength(1);
    });

    it("should render loading state", () => {
        const function_ = vi.fn();

        render(
            <SliderContext.Provider value={{ isOpen: false, setOpen: function_ }}>
                <BalanceHeaderMobile
                    isLoading
                    balance={balance}
                    address={address}
                    assets={[]}
                    currency="usd"
                />
            </SliderContext.Provider>,
            { breakpoint: Breakpoint.xs },
        );

        expect(screen.getByTestId("BalanceHeaderMobileSkeleton")).toBeInTheDocument();
        expect(screen.queryAllByText("$34,253.75")).toHaveLength(0);
    });
});
