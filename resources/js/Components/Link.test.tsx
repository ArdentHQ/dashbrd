import React from "react";
import { expect } from "vitest";
import { Link, LinkButton } from "@/Components/Link";
import { ExternalLinkContextProvider } from "@/Contexts/ExternalLinkContext";
import { render, screen, userEvent } from "@/Tests/testing-library";

describe("Link", () => {
    it("should render", () => {
        const { asFragment } = render(
            <Link href="/test-link">
                <span data-testid="test"></span>
            </Link>,
        );

        expect(screen.getByTestId("test")).toBeInTheDocument();
        expect(asFragment()).toMatchSnapshot();
    });

    it("should render as external", () => {
        const { asFragment } = render(
            <Link
                href="/test-link"
                external
                iconClassName="text-base"
            >
                <span data-testid="test"></span>
            </Link>,
        );

        expect(screen.getByTestId("Link__anchor")).toBeInTheDocument();
        expect(screen.getByTestId("icon-ArrowExternalSmall")).toBeInTheDocument();
        expect(screen.getByTestId("icon-ArrowExternalSmall")).toHaveClass("text-base");
        expect(asFragment()).toMatchSnapshot();
    });

    it("should render with link variant classname", () => {
        const { asFragment } = render(
            <Link
                href="/test-link"
                external
                variant="link"
            >
                <span data-testid="test"></span>
            </Link>,
        );

        expect(screen.getByTestId("Link__anchor")).toBeInTheDocument();
        expect(asFragment()).toMatchSnapshot();
    });

    it("should render with a link without an external icon", () => {
        render(
            <Link
                href="/test-link"
                external
                variant="link"
                showExternalIcon={false}
            >
                <span data-testid="test"></span>
            </Link>,
        );

        expect(screen.getByTestId("Link__anchor")).toBeInTheDocument();
        expect(screen.queryByTestId("icon-ArrowExternalSmall")).not.toBeInTheDocument();
    });

    it("should render with custom text color", () => {
        render(
            <Link
                href="/test-link"
                external
                textColor="text-theme-primary-600"
                variant="link"
            >
                <span data-testid="test"></span>
            </Link>,
        );

        expect(screen.getByTestId("Link__anchor")).toBeInTheDocument();
        expect(screen.getByTestId("Link__anchor")).toHaveClass("text-theme-primary-600");
    });
});

describe("LinkButton", () => {
    it("should render", () => {
        const { asFragment } = render(
            <LinkButton onClick={() => vi.fn()}>
                <span data-testid="test"></span>
            </LinkButton>,
        );

        expect(screen.getByTestId("test")).toBeInTheDocument();
        expect(asFragment()).toMatchSnapshot();
    });

    it("should render with link variant classname", () => {
        const { asFragment } = render(
            <LinkButton
                onClick={() => vi.fn()}
                variant="link"
            >
                <span data-testid="test"></span>
            </LinkButton>,
        );

        expect(screen.getByTestId("Link__button")).toBeInTheDocument();
        expect(asFragment()).toMatchSnapshot();
    });

    it("should render as external with confirm", () => {
        render(
            <Link
                href="https://duhverse.com"
                external
                confirmBeforeProceeding
                iconClassName="text-base"
            >
                <span data-testid="test"></span>
            </Link>,
        );

        expect(screen.getByTestId("Link__anchor")).toBeInTheDocument();
        expect(screen.getByTestId("icon-ArrowExternalSmall")).toBeInTheDocument();
        expect(screen.getByTestId("icon-ArrowExternalSmall")).toHaveClass("text-base");
    });

    it("should open and close external confirm modal", async () => {
        render(
            <ExternalLinkContextProvider allowedExternalDomains={[]}>
                <Link
                    href="https://test.com"
                    external
                    confirmBeforeProceeding
                >
                    <span data-testid="test"></span>
                </Link>
            </ExternalLinkContextProvider>,
        );

        await userEvent.click(screen.getByTestId("Link__anchor"));

        expect(screen.getByTestId("Toast")).toBeInTheDocument();
        expect(screen.getByTestId("ExternalLinkConfirmModal__info")).toBeInTheDocument();

        await userEvent.click(screen.getByTestId("ConfirmationDialog__close"));

        expect(screen.queryByTestId("Toast")).not.toBeInTheDocument();
        expect(screen.queryByTestId("ExternalLinkConfirmModal__info")).not.toBeInTheDocument();
    });

    it("should not open external confirm modal if user disabled it previously", async () => {
        window.localStorage.setItem("has_disabled_link_warning", "true");

        render(
            <ExternalLinkContextProvider allowedExternalDomains={["test.com"]}>
                <Link
                    href="https://test.com"
                    external
                    confirmBeforeProceeding
                >
                    <span data-testid="test"></span>
                </Link>
            </ExternalLinkContextProvider>,
        );

        await userEvent.click(screen.getByTestId("Link__anchor"));

        expect(screen.queryByTestId("ExternalLinkConfirmModal__info")).not.toBeInTheDocument();
        window.localStorage.setItem("has_disabled_link_warning", "false");
    });

    it("should not open modal if domain is not allowed", async () => {
        render(
            <ExternalLinkContextProvider allowedExternalDomains={[]}>
                <Link
                    href="https://test.com"
                    external
                    confirmBeforeProceeding
                >
                    <span data-testid="test"></span>
                </Link>
            </ExternalLinkContextProvider>,
        );

        await userEvent.click(screen.getByTestId("Link__anchor"));

        expect(screen.getByTestId("Toast")).toBeInTheDocument();
        expect(screen.getByTestId("ExternalLinkConfirmModal__info")).toBeInTheDocument();

        await userEvent.click(screen.getByTestId("ConfirmationDialog__close"));

        expect(screen.queryByTestId("Toast")).not.toBeInTheDocument();
        expect(screen.queryByTestId("ExternalLinkConfirmModal__info")).not.toBeInTheDocument();
    });

    it("should not open confirmation link if confirmBeforeProceeding is not true", async () => {
        render(
            <ExternalLinkContextProvider allowedExternalDomains={[]}>
                <Link
                    href="https://test.com"
                    external
                >
                    <span data-testid="test"></span>
                </Link>
            </ExternalLinkContextProvider>,
        );

        await userEvent.click(screen.getByTestId("Link__anchor"));

        expect(screen.queryByTestId("Toast")).not.toBeInTheDocument();
        expect(screen.queryByTestId("ExternalLinkConfirmModal__info")).not.toBeInTheDocument();
    });

    it("should avoid external confirm modal", async () => {
        render(
            <Link
                href="https://duhverse.com"
                external
                confirmBeforeProceeding
            >
                <span data-testid="test"></span>
            </Link>,
        );

        await userEvent.click(screen.getByTestId("Link__anchor"));

        expect(screen.queryByTestId("Toast")).not.toBeInTheDocument();
        expect(screen.queryByTestId("ExternalLinkConfirmModal__info")).not.toBeInTheDocument();
    });

    it("should render an anchor if href is a link to a section", () => {
        render(
            <Link
                href="#test"
                useAnchorTag
                confirmBeforeProceeding
            >
                <span data-testid="test"></span>
            </Link>,
        );

        expect(screen.getByTestId("Link__anchor")).toBeInTheDocument();
    });

    it("should render an anchor if useAnchorTag is true", () => {
        render(
            <Link
                href="#test"
                confirmBeforeProceeding
                useAnchorTag
            >
                <span data-testid="test"></span>
            </Link>,
        );

        expect(screen.getByTestId("Link__anchor")).toBeInTheDocument();
    });
});
