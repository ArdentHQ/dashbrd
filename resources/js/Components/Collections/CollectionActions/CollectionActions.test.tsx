import { type Page, type PageProps, type VisitOptions } from "@inertiajs/core";
import { router } from "@inertiajs/react";
import React from "react";
import { CollectionActions } from "./CollectionActions";
import CollectionFactory from "@/Tests/Factories/Collections/CollectionFactory";
import { render, screen, userEvent, waitFor } from "@/Tests/testing-library";

const collection = new CollectionFactory().create();

describe("CollectionActions", () => {
    it.each([true, false])("should render", (isHidden) => {
        render(
            <CollectionActions
                collection={collection}
                isHidden={isHidden}
                onChanged={vi.fn()}
            />,
        );

        expect(screen.getByTestId("CollectionActions")).toBeInTheDocument();
        expect(screen.queryByTestId("CollectionActions__popup")).not.toBeInTheDocument();
        expect(screen.queryByTestId("CollectionActions__action")).not.toBeInTheDocument();
    });

    it("should toggle popup", async () => {
        render(
            <CollectionActions
                collection={collection}
                onChanged={vi.fn()}
            />,
        );

        expect(screen.getByTestId("CollectionActions")).toBeInTheDocument();
        expect(screen.getByTestId("CollectionActions__trigger")).toBeInTheDocument();
        expect(screen.queryByTestId("CollectionActions__popup")).not.toBeInTheDocument();
        expect(screen.queryByTestId("CollectionActions__action")).not.toBeInTheDocument();

        await userEvent.click(screen.getByTestId("CollectionActions__trigger"));

        expect(screen.queryByTestId("CollectionActions__popup")).toBeInTheDocument();

        await userEvent.click(screen.getByTestId("CollectionActions__trigger"));

        await waitFor(() => {
            expect(screen.queryByTestId("CollectionActions__popup")).not.toBeInTheDocument();
        });
    });

    it("should disable reporting if already reported", async () => {
        render(
            <CollectionActions
                collection={collection}
                alreadyReported
                onChanged={vi.fn()}
            />,
        );

        await userEvent.click(screen.getByTestId("CollectionActions__trigger"));

        expect(screen.getByTestId("CollectionActions__report")).toHaveAttribute("disabled");
    });

    it("should disable reporting if throttled message", async () => {
        render(
            <CollectionActions
                collection={collection}
                reportAvailableIn="1 minute"
                onChanged={vi.fn()}
            />,
        );

        await userEvent.click(screen.getByTestId("CollectionActions__trigger"));

        expect(screen.getByTestId("CollectionActions__report")).toHaveAttribute("disabled");
    });

    it("can hide a collection", async () => {
        render(
            <CollectionActions
                collection={collection}
                onChanged={vi.fn()}
            />,
        );

        expect(screen.getByTestId("CollectionActions")).toBeInTheDocument();
        expect(screen.getByTestId("CollectionActions__trigger")).toBeInTheDocument();
        expect(screen.queryByTestId("CollectionActions__popup")).not.toBeInTheDocument();
        expect(screen.queryByTestId("CollectionActions__hide")).not.toBeInTheDocument();

        await userEvent.click(screen.getByTestId("CollectionActions__trigger"));

        await waitFor(() => {
            expect(screen.queryByTestId("CollectionActions__popup")).toBeInTheDocument();
        });

        const hideButton = screen.getByTestId("CollectionActions__hide");

        const function_ = vi.fn();
        const routerSpy = vi.spyOn(router, "post").mockImplementation(function_);

        await userEvent.click(hideButton);

        expect(routerSpy).toHaveBeenCalled();
    });

    it("can show a collection", async () => {
        render(
            <CollectionActions
                isHidden={true}
                collection={collection}
                onChanged={vi.fn()}
            />,
        );

        const function_ = vi.fn();
        const routerSpy = vi.spyOn(router, "delete").mockImplementation(function_);

        expect(screen.getByTestId("CollectionActions")).toBeInTheDocument();
        expect(screen.getByTestId("CollectionActions__trigger")).toBeInTheDocument();
        expect(screen.queryByTestId("CollectionActions__popup")).not.toBeInTheDocument();
        expect(screen.queryByTestId("CollectionActions__hide")).not.toBeInTheDocument();

        await userEvent.click(screen.getByTestId("CollectionActions__trigger"));

        expect(screen.queryByTestId("CollectionActions__popup")).toBeInTheDocument();

        await userEvent.click(screen.getByTestId("CollectionActions__hide"));

        await waitFor(() => {
            expect(screen.queryByTestId("CollectionActions__popup")).not.toBeInTheDocument();
        });

        await userEvent.click(screen.getByTestId("CollectionActions__trigger"));

        expect(screen.queryByTestId("CollectionActions__popup")).toBeInTheDocument();

        const showButton = screen.getByTestId("CollectionActions__hide");

        await userEvent.click(showButton);

        expect(routerSpy).toHaveBeenCalled();
    });

    it("can show and manage report modal state", async () => {
        render(
            <CollectionActions
                collection={collection}
                isHidden={false}
                onChanged={vi.fn()}
            />,
        );

        expect(screen.queryByTestId("ReportModal")).not.toBeInTheDocument();

        await userEvent.click(screen.getByTestId("CollectionActions__trigger"));

        expect(screen.queryByTestId("CollectionActions__popup")).toBeInTheDocument();

        const reportButton = screen.getByTestId("CollectionActions__report");

        await userEvent.click(reportButton);

        expect(screen.getByTestId("ReportModal")).toBeInTheDocument();

        const closeButton = screen.getByTestId("ConfirmationDialog__close");

        await userEvent.click(closeButton);

        expect(screen.queryByTestId("ReportModal")).not.toBeInTheDocument();
    });

    it("should report a collection", async () => {
        const onReportMock = vi.fn();

        const t: unknown = {};
        const routerSpy = vi.spyOn(router, "post").mockImplementation((_, __, options?: VisitOptions) => {
            options?.onSuccess?.(t as Page<PageProps>);
        });

        render(
            <CollectionActions
                collection={collection}
                isHidden={false}
                onChanged={vi.fn()}
                onReportCollection={onReportMock}
                reportReasons={{ reason: "reason" }}
            />,
        );

        expect(screen.queryByTestId("ReportModal")).not.toBeInTheDocument();

        await userEvent.click(screen.getByTestId("CollectionActions__trigger"));

        expect(screen.queryByTestId("CollectionActions__popup")).toBeInTheDocument();

        const reportButton = screen.getByTestId("CollectionActions__report");

        await userEvent.click(reportButton);

        await waitFor(() => {
            expect(screen.getByTestId("ReportModal")).toBeInTheDocument();
        });

        expect(screen.getAllByTestId("ReportModal__radio")).toHaveLength(1);

        await userEvent.click(screen.getByTestId("ReportModal__radio"));

        const confirmButton = screen.getByTestId("ConfirmationDialog__confirm");

        await userEvent.click(confirmButton);

        expect(screen.queryByTestId("ReportModal")).not.toBeInTheDocument();
        expect(routerSpy).toHaveBeenCalled();
    });
});
