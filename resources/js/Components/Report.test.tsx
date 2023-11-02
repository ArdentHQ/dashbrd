import { router } from "@inertiajs/react";
import { t } from "i18next";
import React from "react";
import { expect, type SpyInstance } from "vitest";
import { Report } from "./Report";
import * as useMetaMaskContext from "@/Contexts/MetaMaskContext";
import * as useAuthorizedActionMock from "@/Hooks/useAuthorizedAction";
import * as useAuthOverlay from "@/Hooks/useAuthOverlay";
import CollectionDetailDataFactory from "@/Tests/Factories/Collections/CollectionDetailDataFactory";
import NftFactory from "@/Tests/Factories/Nfts/NftFactory";
import UserDataFactory from "@/Tests/Factories/UserDataFactory";
import WalletFactory from "@/Tests/Factories/Wallet/WalletFactory";
import { getSampleMetaMaskState } from "@/Tests/SampleData/SampleMetaMaskState";
import { mockAuthContext, render, screen, userEvent } from "@/Tests/testing-library";
import { act } from "@testing-library/react-hooks";

let routerSpy: SpyInstance;
let useAuthorizedActionSpy: SpyInstance;
const signedActionMock = vi.fn();

describe("Report", () => {
    const showConnectOverlayMock = vi.fn().mockImplementation((callback) => {
        callback();
    });

    beforeEach(() => {
        const function_ = vi.fn();
        routerSpy = vi.spyOn(router, "reload").mockImplementation(function_);

        signedActionMock.mockImplementation((action) => {
            action({ authenticated: false, signed: false });
        });

        useAuthorizedActionSpy = vi.spyOn(useAuthorizedActionMock, "useAuthorizedAction").mockReturnValue({
            signedAction: signedActionMock,
            authenticatedAction: vi.fn(),
        });
    });

    beforeAll(() => {
        vi.spyOn(useMetaMaskContext, "useMetaMaskContext").mockReturnValue({
            ...getSampleMetaMaskState(),
            showConnectOverlay: showConnectOverlayMock,
        });

        vi.spyOn(useAuthOverlay, "useAuthOverlay").mockReturnValue({
            showAuthOverlay: false,
            showCloseButton: false,
            closeOverlay: vi.fn(),
        });

        mockAuthContext({
            user: new UserDataFactory().create(),
            wallet: new WalletFactory().create(),
        });
    });

    afterAll(() => {
        vi.restoreAllMocks();
    });

    afterEach(() => {
        routerSpy.mockRestore();
        useAuthorizedActionSpy.mockRestore();
    });

    it("should render with nft", () => {
        const nft = new NftFactory().create();

        render(
            <Report
                model={nft}
                modelType={"nft"}
                show={false}
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
                show={false}
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
                show={false}
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
                show={false}
            />,
        );

        await userEvent.click(screen.getByTestId("Report_flag"));
        expect(screen.getByTestId("ReportModal")).toBeInTheDocument();

        await userEvent.click(screen.getByTestId("ConfirmationDialog__close"));
        expect(screen.queryByTestId("ReportModal")).not.toBeInTheDocument();
    });

    it("show report modal on load", () => {
        const collection = new CollectionDetailDataFactory().create();

        act(() => {
            render(
                <Report
                    model={collection}
                    modelType={"collection"}
                    show={true}
                />,
            );
        });

        expect(screen.getByTestId("ReportModal")).toBeInTheDocument();
    });

    it("doesnt show report modal on load if cant report", () => {
        const collection = new CollectionDetailDataFactory().create();

        render(
            <Report
                model={collection}
                modelType={"collection"}
                show={true}
                allowReport={false}
            />,
        );

        expect(screen.queryByTestId("ReportModal")).not.toBeInTheDocument();
    });

    it("should show auth overlay if guest clicks on it", async () => {
        const collection = new CollectionDetailDataFactory().create();

        mockAuthContext({});

        render(
            <Report
                model={collection}
                modelType={"collection"}
                show={false}
            />,
        );

        await userEvent.click(screen.getByTestId("Report_flag"));

        expect(routerSpy).toHaveBeenCalledWith({
            data: {
                report: true,
            },
        });
    });

    it("should render with default tooltip if display default tooltip is true", async () => {
        const nft = new NftFactory().create();

        render(
            <Report
                model={nft}
                modelType={"nft"}
                displayDefaultTooltip={true}
                show={false}
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
                show={false}
            />,
        );

        await userEvent.hover(screen.getByTestId("Report_flag"));
        expect(screen.queryByText(t("common.report"))).not.toBeInTheDocument();
    });

    it("should render with custom class names for icon button", () => {
        const nft = new NftFactory().create();

        render(
            <Report
                model={nft}
                modelType={"nft"}
                className="custom-class"
                show={false}
            />,
        );

        expect(screen.getByTestId("Report_flag")).toHaveClass("custom-class");
    });
});
