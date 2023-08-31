import { fireEvent } from "@testing-library/dom";
import React from "react";
import { NftReportModal } from "./NftReportModal";
import NftFactory from "@/Tests/Factories/Nfts/NftFactory";
import { mockInertiaUseForm, render, screen } from "@/Tests/testing-library";

const nft = new NftFactory().create();
describe("NftReportModal", () => {
    it("should render when opened", () => {
        const function_ = vi.fn();

        render(
            <NftReportModal
                isOpen={true}
                onClose={function_}
                nft={nft}
                reportReasons={{
                    reason: "reason",
                    secondReason: "reason2",
                }}
            />,
        );

        expect(screen.getByTestId("ReportModal")).toBeInTheDocument();
    });

    it("can be closed", () => {
        const closeFunction = vi.fn();

        render(
            <NftReportModal
                isOpen={true}
                onClose={closeFunction}
                nft={nft}
                reportReasons={{
                    reason: "reason",
                    secondReason: "reason2",
                }}
            />,
        );

        expect(screen.getByTestId("ReportModal")).toBeInTheDocument();

        const closeButton = screen.getByTestId("ConfirmationDialog__close");

        fireEvent.click(closeButton);

        expect(closeFunction).toHaveBeenCalled();
    });

    it("can be submitted with a valid reason", () => {
        const data: Record<string, unknown> = {
            reason: "first",
        };

        const postFunction = vi.fn();

        mockInertiaUseForm({
            data,
            setData: (key, value) => {
                data[key] = value;
            },
            post: postFunction,
        });

        const function_ = vi.fn();

        render(
            <NftReportModal
                isOpen={true}
                onClose={function_}
                nft={nft}
                reportReasons={{
                    reason: "reason",
                }}
            />,
        );

        expect(screen.getByTestId("ReportModal")).toBeInTheDocument();

        const radioButtons = screen.getAllByTestId("ReportModal__radio");

        fireEvent.click(radioButtons[0]);

        const submitButton = screen.getByTestId("ConfirmationDialog__confirm");

        fireEvent.click(submitButton);

        expect(postFunction).toHaveBeenCalled();
    });

    it("can show an error message if something went wrong trying to report", () => {
        const data: Record<string, unknown> = {
            reason: "first",
        };

        mockInertiaUseForm({
            data,
            setData: (key, value) => {
                data[key] = value;
            },
            post: (_, options) => {
                options?.onError?.({ error: "error" });
            },
        });

        const function_ = vi.fn();

        render(
            <NftReportModal
                isOpen={true}
                onClose={function_}
                nft={nft}
                reportReasons={{
                    reason: "reason",
                }}
            />,
        );

        expect(screen.getByTestId("ReportModal")).toBeInTheDocument();

        const radioButtons = screen.getAllByTestId("ReportModal__radio");

        fireEvent.click(radioButtons[0]);

        const submitButton = screen.getByTestId("ConfirmationDialog__confirm");

        fireEvent.click(submitButton);

        expect(screen.getByTestId("ReportModal__failed")).toBeInTheDocument();
    });
});
