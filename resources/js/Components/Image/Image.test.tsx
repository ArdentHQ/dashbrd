import React from "react";
import { type SpyInstance } from "vitest";
import { Img } from "./Image";
import * as ImageLoaderHook from "./useImageLoader";
import * as useDarkModeContext from "@/Contexts/DarkModeContext";
import { mockViewportVisibilitySensor } from "@/Tests/Mocks/Handlers/viewport";
import { act, render, screen, waitFor } from "@/Tests/testing-library";

describe("Image", () => {
    let useDarkModeContextSpy: SpyInstance;

    const image = new Image();

    beforeAll(() => {
        process.env.REACT_APP_IS_UNIT = "false";
        vi.spyOn(window, "Image").mockImplementation(() => image);
    });

    beforeEach(() => {
        useDarkModeContextSpy = vi
            .spyOn(useDarkModeContext, "useDarkModeContext")
            .mockReturnValue({ isDark: false, toggleDarkMode: vi.fn() });
    });

    afterEach(() => {
        useDarkModeContextSpy.mockRestore();
    });

    afterAll(() => {
        vi.restoreAllMocks();
    });

    it("should load a valid image", async () => {
        render(
            <Img
                src="skdfj jfa sfkj@#$##%##%"
                data-testid="Img"
            />,
        );

        expect(screen.queryByTestId("Skeleton")).toBeInTheDocument();

        // Trigger load event
        act(() => {
            image.onload?.(new Event(""));
        });

        await waitFor(() => {
            expect(screen.getByTestId("Img")).toBeInTheDocument();
            expect(screen.queryByTestId("Skeleton")).not.toBeInTheDocument();
        });
    });

    it("should not load image if already loading", () => {
        const mockData = {
            isLoaded: false,
            isErrored: false,
            isLoading: true,
            loadImage: vi.fn(() => {
                mockData.isLoading = true;
            }),
        };

        const useImageLoaderMock = vi.spyOn(ImageLoaderHook, "useImageLoader").mockImplementation(() => mockData);

        render(<Img src="skdfj jfa sfkj@#$##%##%" />);

        expect(mockData.loadImage).toHaveBeenCalledTimes(0);
        expect(mockData.isLoaded).toBe(false);
        expect(mockData.isErrored).toBe(false);
        expect(mockData.isLoading).toBe(true);

        useImageLoaderMock.mockRestore();
    });

    it("should not load image if already loaded", () => {
        const mockData = {
            isLoaded: true,
            isErrored: false,
            isLoading: false,
            loadImage: vi.fn(() => {
                mockData.isLoading = true;
            }),
        };

        const useImageLoaderMock = vi.spyOn(ImageLoaderHook, "useImageLoader").mockImplementation(() => mockData);

        render(<Img src="skdfj jfa sfkj@#$##%##%" />);

        expect(mockData.loadImage).toHaveBeenCalledTimes(0);
        expect(mockData.isLoaded).toBe(true);
        expect(mockData.isErrored).toBe(false);
        expect(mockData.isLoading).toBe(false);

        useImageLoaderMock.mockRestore();
    });

    it("should not load image if already errored", () => {
        const mockData = {
            isLoaded: false,
            isErrored: true,
            isLoading: false,
            loadImage: vi.fn(() => {
                mockData.isLoading = true;
            }),
        };

        const useImageLoaderMock = vi.spyOn(ImageLoaderHook, "useImageLoader").mockImplementation(() => mockData);

        render(<Img src="skdfj jfa sfkj@#$##%##%" />);

        expect(mockData.loadImage).toHaveBeenCalledTimes(0);
        expect(mockData.isLoaded).toBe(false);
        expect(mockData.isErrored).toBe(true);
        expect(mockData.isLoading).toBe(false);

        useImageLoaderMock.mockRestore();
    });

    it("should render error placeholder if image fails to load", async () => {
        const onErrorMock = vi.fn();

        render(
            <Img
                src="@!##$%%%%$@#"
                data-testid="Img"
                onError={onErrorMock}
            />,
        );

        // Trigger error event
        act(() => {
            image.onerror?.(new Event(""));
        });

        expect(screen.queryByTestId("Img")).not.toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByTestId("ImageErrorPlaceholer"));
            expect(screen.queryByTestId("Skeleton")).not.toBeInTheDocument();
        });

        expect(onErrorMock).toHaveBeenCalled();
    });

    it("should render error placeholder if image fails to load in dark mode", async () => {
        const onErrorMock = vi.fn();

        useDarkModeContextSpy = vi
            .spyOn(useDarkModeContext, "useDarkModeContext")
            .mockReturnValue({ isDark: true, toggleDarkMode: vi.fn() });

        render(
            <Img
                src="@!##$%%%%$@#"
                data-testid="Img"
                onError={onErrorMock}
            />,
        );

        // Trigger error event
        act(() => {
            image.onerror?.(new Event(""));
        });

        expect(screen.queryByTestId("Img")).not.toBeInTheDocument();

        await waitFor(() => {
            expect(screen.queryByTestId("Skeleton")).not.toBeInTheDocument();
        });

        expect(screen.getByTestId("ImageErrorPlaceholer"));

        expect(onErrorMock).toHaveBeenCalled();
    });

    it("should render error placeholder if image src is undefined", async () => {
        const onErrorMock = vi.fn();

        render(
            <Img
                data-testid="Img"
                onError={onErrorMock}
            />,
        );

        // Trigger error event
        act(() => {
            image.onerror?.(new Event(""));
        });

        expect(screen.queryByTestId("Img")).not.toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByTestId("ImageErrorPlaceholer"));
            expect(screen.queryByTestId("Skeleton")).not.toBeInTheDocument();
        });

        expect(onErrorMock).toHaveBeenCalled();
    });

    it("should render error placeholder with custom error message", async () => {
        render(
            <Img
                src="skdfj jfa sfkj@#$##%##%"
                data-testid="Img"
                errorMessage="Failed to load"
            />,
        );

        // Trigger error event
        act(() => {
            image.onerror?.(new Event(""));
        });

        expect(screen.queryByTestId("Img")).not.toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText("Failed to load"));
            expect(screen.queryByTestId("Skeleton")).not.toBeInTheDocument();
        });
    });

    it("should not load image if it is not in viewport", async () => {
        vi.restoreAllMocks();

        mockViewportVisibilitySensor({
            inViewport: false,
        });

        render(
            <Img
                src="skdfj jfa sfkj@#$##%##%"
                data-testid="Img"
            />,
        );

        expect(screen.getByTestId("Skeleton")).toBeInTheDocument();

        // Trigger load event
        act(() => {
            image.onload?.(new Event(""));
        });

        await waitFor(() => {
            expect(screen.queryByTestId("Img")).not.toBeInTheDocument();
        });
    });
});
