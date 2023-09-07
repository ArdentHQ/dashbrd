import { router } from "@inertiajs/react";
import React from "react";
import { type SpyInstance } from "vitest";
import { GalleryControls } from "@/Components/Galleries/GalleryPage/GalleryControls";
import * as useAuthorizedActionMock from "@/Hooks/useAuthorizedAction";
import * as useLikes from "@/Hooks/useLikes";
import GalleryDataFactory from "@/Tests/Factories/Gallery/GalleryDataFactory";
import { BASE_URL, requestMockOnce, server } from "@/Tests/Mocks/server";
import { render, screen, userEvent } from "@/Tests/testing-library";
const gallery = new GalleryDataFactory().create();

let useAuthorizedActionSpy: SpyInstance;
const signedActionMock = vi.fn();

describe("GalleryControls", () => {
    beforeEach(() => {
        signedActionMock.mockImplementation((action) => {
            action({ authenticated: true, signed: true });
        });

        useAuthorizedActionSpy = vi.spyOn(useAuthorizedActionMock, "useAuthorizedAction").mockReturnValue({
            signedAction: signedActionMock,
        });
    });

    afterEach(() => {
        useAuthorizedActionSpy.mockRestore();
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
        const routerSpy = vi.spyOn(router, "reload").mockImplementation(() => vi.fn());

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

        routerSpy.mockRestore();
    });

    it("does not like if signed action does not finish", async () => {
        signedActionMock.mockImplementation(() => {
            // Do nothing
        });

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

        expect(signedActionMock).toHaveBeenCalled();

        expect(likeMock).not.toHaveBeenCalled();
    });

    it("likes and reloads the page after logged in", async () => {
        const routerSpy = vi.spyOn(router, "reload").mockImplementation(() => vi.fn());

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

        expect(signedActionMock).toHaveBeenCalled();

        expect(routerSpy).toHaveBeenCalled();

        routerSpy.mockRestore();
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

    it("edits after checking for signature", async () => {
        signedActionMock.mockImplementation((action) => {
            action({ authenticated: true, signed: true });
        });

        const routerSpy = vi.spyOn(router, "get").mockImplementation(() => vi.fn());

        render(
            <GalleryControls
                wallet={gallery.wallet}
                likesCount={3}
                gallery={{
                    ...gallery,
                    isOwner: true,
                }}
            />,
        );

        await userEvent.click(screen.getByTestId("GalleryControls__edit-button"));

        expect(routerSpy).toHaveBeenCalled();
    });
    it("does not edits if no validates signature", async () => {
        signedActionMock.mockImplementation(() => {
            // Do nothing...
        });

        const routerSpy = vi.spyOn(router, "get").mockImplementation(() => vi.fn());

        render(
            <GalleryControls
                wallet={gallery.wallet}
                likesCount={3}
                gallery={{
                    ...gallery,
                    isOwner: true,
                }}
            />,
        );

        await userEvent.click(screen.getByTestId("GalleryControls__edit-button"));

        expect(routerSpy).not.toHaveBeenCalled();
    });
});
