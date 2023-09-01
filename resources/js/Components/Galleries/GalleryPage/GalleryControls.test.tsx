import React from "react";
import { type SpyInstance } from "vitest";
import { GalleryControls } from "@/Components/Galleries/GalleryPage/GalleryControls";
import * as useMetaMaskContext from "@/Contexts/MetaMaskContext";
import * as useAuth from "@/Hooks/useAuth";
import * as useLikes from "@/Hooks/useLikes";
import GalleryDataFactory from "@/Tests/Factories/Gallery/GalleryDataFactory";
import UserDataFactory from "@/Tests/Factories/UserDataFactory";
import WalletFactory from "@/Tests/Factories/Wallet/WalletFactory";
import { BASE_URL, requestMockOnce, server } from "@/Tests/Mocks/server";
import { getSampleMetaMaskState } from "@/Tests/SampleData/SampleMetaMaskState";
import { render, screen, userEvent } from "@/Tests/testing-library";
const gallery = new GalleryDataFactory().create();

const user = new UserDataFactory().create();
const wallet = new WalletFactory().create();

let useAuthSpy: SpyInstance;
let useMetamaskSpy: SpyInstance;

const defaultMetamaskConfig = getSampleMetaMaskState();

describe("GalleryControls", () => {
    beforeEach(() => {
        useMetamaskSpy = vi.spyOn(useMetaMaskContext, "useMetaMaskContext").mockReturnValue(defaultMetamaskConfig);

        useAuthSpy = vi.spyOn(useAuth, "useAuth").mockReturnValue({
            user,
            wallet,
            authenticated: true,
            showAuthOverlay: false,
            showCloseButton: false,
            closeOverlay: vi.fn(),
        });
    });

    afterEach(() => {
        useMetamaskSpy.mockRestore();
        useAuthSpy.mockRestore();
        vi.clearAllMocks();
    });

    it("should render", () => {
        render(
            <GalleryControls
                likesCount={3}
                wallet={gallery.wallet}
                gallery={gallery}
            />,
        );

        expect(screen.getByTestId("GalleryControls")).toBeInTheDocument();
    });

    it("should render as viewer", () => {
        render(
            <GalleryControls
                likesCount={3}
                wallet={gallery.wallet}
                gallery={{
                    ...gallery,
                    isOwner: false,
                }}
            />,
        );

        expect(screen.getByTestId("GalleryControls")).toBeInTheDocument();
        expect(screen.getByTestId("GalleryControls__copy-button")).toBeInTheDocument();
        expect(screen.queryByTestId("GalleryControls__edit-button")).not.toBeInTheDocument();
        expect(screen.getByTestId("GalleryControls__flag-button")).toBeInTheDocument();
    });

    it("should render as owner", () => {
        render(
            <GalleryControls
                likesCount={3}
                wallet={gallery.wallet}
                gallery={{
                    ...gallery,
                    isOwner: true,
                }}
            />,
        );

        expect(screen.queryByTestId("GalleryControls")).toBeInTheDocument();
        expect(screen.queryByTestId("GalleryControls__copy-button")).toBeInTheDocument();
        expect(screen.queryByTestId("icon-Pencil")).toBeInTheDocument(); // Edit button
        expect(screen.queryByTestId("GalleryControls__flag-button")).not.toBeInTheDocument();
    });

    it("should be possible to add and removes likes from a gallery", async () => {
        server.use(
            requestMockOnce(
                `${BASE_URL}/galleries/like`, // Route based on vitest.setup.ts setupRoute
                {
                    likes: 4,
                    hasLiked: true,
                },
                {
                    status: 201,
                    method: "post",
                },
            ),
        );

        render(
            <GalleryControls
                likesCount={3}
                wallet={gallery.wallet}
                gallery={gallery}
            />,
        );

        expect(screen.queryByTestId("GalleryControls")).toBeInTheDocument();
        expect(screen.queryByText("3")).toBeInTheDocument();

        await userEvent.click(screen.getByTestId("GalleryControls__like-button"));

        expect(screen.queryByText("3")).not.toBeInTheDocument();

        expect(screen.queryByText("4")).toBeInTheDocument();
    });

    it("can not like if no gallery ", async () => {
        const likeMock = vi.fn();

        vi.spyOn(useLikes, "useLikes").mockReturnValue({
            likes: 0,
            hasLiked: false,
            like: likeMock,
        });

        render(
            <GalleryControls
                likesCount={3}
                wallet={gallery.wallet}
                gallery={undefined}
            />,
        );

        await userEvent.click(screen.getByTestId("GalleryControls__like-button"));

        expect(likeMock).not.toHaveBeenCalled();
    });

    it("can not like if no likes count ", async () => {
        const likeMock = vi.fn();

        vi.spyOn(useLikes, "useLikes").mockReturnValue({
            likes: 0,
            hasLiked: false,
            like: likeMock,
        });

        render(
            <GalleryControls
                likesCount={undefined}
                wallet={gallery.wallet}
                gallery={gallery}
            />,
        );

        await userEvent.click(screen.getByTestId("GalleryControls__like-button"));

        expect(likeMock).not.toHaveBeenCalled();
    });

    it("can like if gallery is defined", async () => {
        const likeMock = vi.fn();

        vi.spyOn(useLikes, "useLikes").mockReturnValue({
            likes: 0,
            hasLiked: false,
            like: likeMock,
        });

        render(
            <GalleryControls
                likesCount={3}
                wallet={gallery.wallet}
                gallery={gallery}
            />,
        );

        await userEvent.click(screen.getByTestId("GalleryControls__like-button"));

        expect(likeMock).toHaveBeenCalled();
    });

    it("opens auth overlay if no authenticated", async () => {
        useAuthSpy = vi.spyOn(useAuth, "useAuth").mockReturnValue({
            user: null,
            wallet: null,
            authenticated: false,
            showAuthOverlay: false,
            showCloseButton: false,
            closeOverlay: vi.fn(),
        });

        const showConnectOverlay = vi.fn();

        useMetamaskSpy = vi.spyOn(useMetaMaskContext, "useMetaMaskContext").mockReturnValue(
            getSampleMetaMaskState({
                showConnectOverlay,
            }),
        );

        const likeMock = vi.fn();

        vi.spyOn(useLikes, "useLikes").mockReturnValue({
            likes: 0,
            hasLiked: false,
            like: likeMock,
        });

        render(
            <GalleryControls
                likesCount={3}
                wallet={gallery.wallet}
                gallery={gallery}
            />,
        );

        await userEvent.click(screen.getByTestId("GalleryControls__like-button"));

        expect(showConnectOverlay).toHaveBeenCalled();

        expect(likeMock).not.toHaveBeenCalled();
    });

    it("can show disabled buttons if disabled", () => {
        render(
            <GalleryControls
                wallet={gallery.wallet}
                isDisabled
            />,
        );

        expect(screen.getByTestId("GalleryControls__like-button")).toBeDisabled();
        expect(screen.getByTestId("GalleryControls__copy-button")).toBeDisabled();
        expect(screen.getByTestId("GalleryControls__flag-button")).toBeDisabled();
        expect(screen.queryByTestId("GalleryControls__edit-button")).not.toBeInTheDocument();
    });
});
