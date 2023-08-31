import React from "react";
import { GalleryControls } from "@/Components/Galleries/GalleryPage/GalleryControls";
import * as useLikes from "@/Hooks/useLikes";
import GalleryDataFactory from "@/Tests/Factories/Gallery/GalleryDataFactory";
import { BASE_URL, requestMockOnce, server } from "@/Tests/Mocks/server";
import { render, screen, userEvent } from "@/Tests/testing-library";

const gallery = new GalleryDataFactory().create();

describe("GalleryControls", () => {
    afterEach(() => {
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
