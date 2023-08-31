import React from "react";
import { BalanceHeader } from "./BalanceHeader";
import { SliderContext } from "@/Components/Slider";
import { render, screen, userEvent } from "@/Tests/testing-library";
import { allBreakpoints, Breakpoint } from "@/Tests/utils";
import { formatAddress } from "@/Utils/format-address";

describe("BalanceHeader", () => {
    const address = "0x1234567890123456789012345678901234567890";

    const balance = "34253.75";

    it.each(allBreakpoints)("should render in %s screen", (breakpoint) => {
        const function_ = vi.fn();

        render(
            <SliderContext.Provider value={{ isOpen: false, setOpen: function_ }}>
                <BalanceHeader
                    balance={balance}
                    address={formatAddress(address)}
                    assets={[]}
                    currency="usd"
                />
            </SliderContext.Provider>,
            { breakpoint },
        );

        if (breakpoint !== "xs") {
            expect(screen.getByTestId("BalanceHeader")).toBeInTheDocument();
            expect(screen.getAllByText("$34,253.75")).toBeTruthy();
            expect(screen.getByText("0x123456…34567890")).toBeInTheDocument();
        } else {
            expect(screen.getByTestId("BalanceHeaderMobile")).toBeInTheDocument();
            expect(screen.getAllByText("$34,253.75")).toBeTruthy();
        }
    });

    it.each(allBreakpoints)("should render loading skeleton in %s screen", (breakpoint) => {
        const function_ = vi.fn();

        render(
            <SliderContext.Provider value={{ isOpen: false, setOpen: function_ }}>
                <BalanceHeader
                    isLoading
                    balance={balance}
                    address={formatAddress(address)}
                    assets={[]}
                    currency="usd"
                />
            </SliderContext.Provider>,
            { breakpoint },
        );

        if (breakpoint !== "xs") {
            expect(screen.getByTestId("BalanceHeaderSkeleton")).toBeInTheDocument();
        } else {
            expect(screen.getByTestId("BalanceHeaderMobileSkeleton")).toBeInTheDocument();
        }
    });

    it("should skip user auth hook if not listening for inertia", () => {
        const function_ = vi.fn();

        render(
            <SliderContext.Provider value={{ isOpen: false, setOpen: function_ }}>
                <BalanceHeader
                    balance={balance}
                    address={formatAddress(address)}
                    assets={[]}
                    currency="usd"
                />
            </SliderContext.Provider>,
        );

        expect(screen.getByTestId("BalanceHeader")).toBeInTheDocument();
        expect(screen.getAllByText("$34,253.75")).toBeTruthy();
        expect(screen.getByText("0x123456…34567890")).toBeInTheDocument();
    });

    it("should open slider for desktop on more details click", async () => {
        const setOpen = vi.fn();

        render(
            <SliderContext.Provider value={{ isOpen: false, setOpen }}>
                <BalanceHeader
                    balance="34253.75"
                    address={formatAddress(address)}
                    assets={[]}
                    currency="usd"
                />
            </SliderContext.Provider>,
        );

        expect(screen.getByTestId("BalanceHeader__more-details")).toBeInTheDocument();
        expect(setOpen).toHaveBeenCalledTimes(0);

        await userEvent.click(screen.getByTestId("BalanceHeader__more-details"));

        expect(setOpen).toHaveBeenCalledTimes(1);
    });

    it("should open slider for mobile on more details click", async () => {
        const setOpen = vi.fn();

        render(
            <SliderContext.Provider value={{ isOpen: false, setOpen }}>
                <BalanceHeader
                    balance="34253.75"
                    address={formatAddress(address)}
                    assets={[]}
                    currency="usd"
                />
            </SliderContext.Provider>,
            { breakpoint: Breakpoint.xs },
        );

        expect(screen.getByTestId("BalanceHeaderMobile__more-details")).toBeInTheDocument();
        expect(setOpen).toHaveBeenCalledTimes(0);

        await userEvent.click(screen.getByTestId("BalanceHeaderMobile__more-details"));

        expect(setOpen).toHaveBeenCalledTimes(1);
    });
});
