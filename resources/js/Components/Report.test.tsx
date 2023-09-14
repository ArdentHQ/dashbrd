import { t } from "i18next";
import React from "react";
import { expect } from "vitest";
import { Report } from "./Report";
import * as useMetaMaskContext from "@/Contexts/MetaMaskContext";
import * as useAuth from "@/Hooks/useAuth";
import CollectionDetailDataFactory from "@/Tests/Factories/Collections/CollectionDetailDataFactory";
import NftFactory from "@/Tests/Factories/Nfts/NftFactory";
import { getSampleMetaMaskState } from "@/Tests/SampleData/SampleMetaMaskState";
import { render, screen, userEvent } from "@/Tests/testing-library";

describe("Report", () => {
    const showConnectOverlayMock = vi.fn();

    beforeAll(() => {
        vi.spyOn(useMetaMaskContext, "useMetaMaskContext").mockReturnValue({
            ...getSampleMetaMaskState(),
            showConnectOverlay: showConnectOverlayMock,
        });

        vi.spyOn(useAuth, "useAuth").mockReturnValue({
            user: null,
            wallet: null,
            authenticated: true,
            showAuthOverlay: false,
            showCloseButton: false,
            closeOverlay: vi.fn(),
        });
    });

    afterAll(() => {
        vi.restoreAllMocks();
    });

    it("should render with nft", () => {
        const nft = new NftFactory().create();

        render(
            <Report
                model={nft}
                modelType={"nft"}
            />,
        );

        expect(screen.getByTestId("Report_flag")).toBeInTheDocument();
        expect(screen.getByTestId("Report_nft")).toBeInTheDocument();
    });

    it("should render with collection", () => {
        const collection = new CollectionDetailDataFactory().create();

        render(
            <Report
                model={collection}
                modelType={"collection"}
            />,
        );

        expect(screen.getByTestId("Report_flag")).toBeInTheDocument();
        expect(screen.getByTestId("Report_collection")).toBeInTheDocument();
    });

    it("show/hide nft report modal", async () => {
        const nft = new NftFactory().create();

        render(
            <Report
                model={nft}
                modelType={"nft"}
            />,
        );

        await userEvent.click(screen.getByTestId("Report_flag"));
        expect(screen.getByTestId("ReportModal")).toBeInTheDocument();

        await userEvent.click(screen.getByTestId("ConfirmationDialog__close"));
        expect(screen.queryByTestId("ReportModal")).not.toBeInTheDocument();
    });

    it("show/hide collection report modal", async () => {
        const collection = new CollectionDetailDataFactory().create();

        render(
            <Report
                model={collection}
                modelType={"collection"}
            />,
        );

        await userEvent.click(screen.getByTestId("Report_flag"));
        expect(screen.getByTestId("ReportModal")).toBeInTheDocument();

        await userEvent.click(screen.getByTestId("ConfirmationDialog__close"));
        expect(screen.queryByTestId("ReportModal")).not.toBeInTheDocument();
    });

    it("should show auth overlay if guest clicks on it", async () => {
        const collection = new CollectionDetailDataFactory().create();

        vi.spyOn(useAuth, "useAuth").mockReturnValue({
            user: null,
            wallet: null,
            authenticated: false,
            showAuthOverlay: false,
            showCloseButton: false,
            closeOverlay: vi.fn(),
        });

        render(
            <Report
                model={collection}
                modelType={"collection"}
            />,
        );

        await userEvent.click(screen.getByTestId("Report_flag"));
        expect(showConnectOverlayMock).toHaveBeenCalledOnce();
    });

    it("should render with default tooltip if display default tooltip is true", async () => {
        const nft = new NftFactory().create();

        render(
            <Report
                model={nft}
                modelType={"nft"}
                displayDefaultTooltip={true}
            />,
        );

        await userEvent.hover(screen.getByTestId("Report_flag"));
        expect(screen.getByText(t("common.report"))).toBeInTheDocument();
    });

    it("should not render with default tooltip if display default tooltip is false", async () => {
        const nft = new NftFactory().create();

        render(
            <Report
                model={nft}
                modelType={"nft"}
                displayDefaultTooltip={false}
            />,
        );

        await userEvent.hover(screen.getByTestId("Report_flag"));
        expect(screen.queryByText(t("common.report"))).not.toBeInTheDocument();
    });
});
