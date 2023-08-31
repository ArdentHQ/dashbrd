import React from "react";
import { CollectionReportModal } from "@/Components/Collections/CollectionReportModal";
import CollectionFactory from "@/Tests/Factories/Collections/CollectionFactory";
import { fireEvent, mockInertiaUseForm, render, screen } from "@/Tests/testing-library";

const collection = new CollectionFactory().create();

describe("CollectionActions", () => {
    it("should render when opened", () => {
        const function_ = vi.fn();

        render(
            <CollectionReportModal
                isOpen={true}
                onClose={function_}
                collection={collection}
            />,
        );

        expect(screen.getByTestId("ReportModal")).toBeInTheDocument();
    });

    it("can be closed", () => {
        const closeFunction = vi.fn();

        render(
            <CollectionReportModal
                isOpen={true}
                onClose={closeFunction}
                collection={collection}
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
            <CollectionReportModal
                isOpen={true}
                onClose={function_}
                collection={collection}
                reportReasons={{
                    reason: "test",
                    reason2: "test2",
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
            <CollectionReportModal
                isOpen={true}
                onClose={function_}
                collection={collection}
                reportReasons={{ reason: "test" }}
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
