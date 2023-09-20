import React from "react";
import { Toast, ToastTemplate } from "@/Components/Toast";
import { render, screen, waitFor } from "@/Tests/testing-library";

describe("Toast", () => {
    it("should render info", () => {
        render(
            <Toast
                message="test"
                type="info"
            />,
        );

        expect(screen.getByTestId("Toast")).toBeInTheDocument();
        expect(screen.getByTestId("Toast__wrapper")).toHaveClass("bg-theme-primary-100 text-theme-primary-700");
    });

    it("should render info by default", () => {
        render(<Toast message="test" />);

        expect(screen.getByTestId("Toast")).toBeInTheDocument();
        expect(screen.getByTestId("Toast__wrapper")).toHaveClass("bg-theme-primary-100 text-theme-primary-700");
    });

    it("should render pending", () => {
        render(
            <Toast
                message="test"
                type="pending"
            />,
        );

        expect(screen.getByTestId("Toast")).toBeInTheDocument();
        expect(screen.getByTestId("Toast__wrapper")).toHaveClass("bg-theme-secondary-200 text-theme-secondary-700");
    });

    it("should render success", () => {
        render(
            <Toast
                message="test"
                type="success"
            />,
        );

        expect(screen.getByTestId("Toast")).toBeInTheDocument();
        expect(screen.getByTestId("Toast__wrapper")).toHaveClass("bg-theme-success-100 text-theme-success-700");
    });

    it("should render warning", () => {
        render(
            <Toast
                message="test"
                type="warning"
            />,
        );

        expect(screen.getByTestId("Toast")).toBeInTheDocument();
        expect(screen.getByTestId("Toast__wrapper")).toHaveClass("bg-theme-warning-100 text-theme-warning-800");
    });

    it("should render error", () => {
        render(
            <Toast
                message="test"
                type="error"
            />,
        );

        expect(screen.getByTestId("Toast")).toBeInTheDocument();
        expect(screen.getByTestId("Toast__wrapper")).toHaveClass("bg-theme-danger-100 text-theme-danger-700");
    });

    it("should render expanded", () => {
        render(
            <Toast
                message="test"
                isExpanded
            />,
        );

        expect(screen.getByTestId("Toast")).toBeInTheDocument();
        expect(screen.getByTestId("Toast__wrapper")).toHaveClass("bg-theme-primary-100 text-theme-primary-700");
        expect(screen.getByText("Information")).toBeInTheDocument();
    });

    it("should render loading state", () => {
        render(
            <Toast
                message="test"
                isLoading
            />,
        );

        expect(screen.getByTestId("LoadingIcon")).toBeInTheDocument();
    });

    it("should render with close button", () => {
        const function_ = vi.fn();

        render(
            <Toast
                message="test"
                onClose={function_}
            />,
        );

        expect(screen.getByTestId("CloseButton")).toBeInTheDocument();
    });
});

describe("ToastTemplate", () => {
    it("should render", async () => {
        render(
            <ToastTemplate
                isVisible
                toastMessage={{
                    message: "test message",
                }}
            />,
        );

        await waitFor(() => {
            expect(screen.getByTestId("Toast")).toBeInTheDocument();
        });

        expect(screen.getByTestId("Toast__wrapper")).toHaveClass("bg-theme-primary-100 text-theme-primary-700");
    });
});
