import { t } from "i18next";
import React from "react";
import { type SpyInstance } from "vitest";
import { GalleryUploadCover } from "./GalleryUploadCover";
import * as ToastsHook from "@/Hooks/useToasts";
import { render, screen, userEvent, waitFor } from "@/Tests/testing-library";
import { allBreakpoints } from "@/Tests/utils";

vi.mock("browser-fs-access", async () => {
    const actual: object = await vi.importActual("browser-fs-access");

    return {
        ...actual,
        fileOpen: () => new File(["test"], "nft.png"),
    };
});

describe("GalleryFormSlider", () => {
    const GlobalFileReader = FileReader;
    const fileReader = new FileReader();
    const GlobalImage = Image;
    const showToastMock = vi.fn();
    let fileReaderMock: SpyInstance;

    const forceImageSize = (width = 10, height = 10): void => {
        global.Image = class extends GlobalImage {
            constructor() {
                super(width, height);

                setTimeout(() => {
                    this.dispatchEvent(new ProgressEvent("load")); // simulate success
                }, 100);
            }
        };
    };

    afterAll(() => {
        global.Image = GlobalImage;
    });

    beforeEach(() => {
        fileReaderMock = vi.spyOn(window, "FileReader").mockImplementation(() => fileReader);
        vi.spyOn(ToastsHook, "useToasts").mockImplementation(() => ({
            showToast: showToastMock,
            clear: vi.fn(),
        }));

        forceImageSize();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it.each(allBreakpoints)("should render in %s screen", (breakpoint) => {
        render(<GalleryUploadCover />, { breakpoint });

        expect(screen.getByTestId("GalleryUploadCover")).toBeInTheDocument();
    });

    it("should render with existing cover image", () => {
        render(<GalleryUploadCover coverUrl="/src.png" />);

        expect(screen.getByTestId("GalleryUploadCover")).toBeInTheDocument();
        expect(screen.getByTestId("ImageEditActions")).toBeInTheDocument();
    });

    it("should not allow image if it exceeds max upload size", async () => {
        render(<GalleryUploadCover maxUploadSize={2} />);

        expect(screen.getByTestId("GalleryUploadCover")).toBeInTheDocument();

        await userEvent.click(screen.getByTestId("ImageUploadActions__button"));

        expect(screen.queryByTestId("ImageEditActions")).not.toBeInTheDocument();

        expect(showToastMock).toHaveBeenCalledWith({
            isExpanded: true,
            message: t("common.image_size_error"),
            type: "error",
        });
    });

    it("should not allow image if it is smaller than dimensions", async () => {
        render(<GalleryUploadCover />);

        expect(screen.getByTestId("GalleryUploadCover")).toBeInTheDocument();

        await userEvent.click(screen.getByTestId("ImageUploadActions__button"));

        expect(screen.queryByTestId("ImageEditActions")).not.toBeInTheDocument();

        await waitFor(() => {
            expect(showToastMock).toHaveBeenCalledWith({
                isExpanded: true,
                message: t("common.image_dimensions_error"),
                type: "error",
            });
        });
    });

    it("should do nothing if file cannot be loaded", async () => {
        const fileReaderMockInstance = new GlobalFileReader();
        const readDataUrlMock = vi.fn(() => {
            fileReaderMockInstance.dispatchEvent(new ProgressEvent("load"));
        });

        fileReaderMock.mockImplementation(() => {
            fileReaderMockInstance.readAsDataURL = readDataUrlMock;

            return fileReaderMockInstance;
        });

        render(<GalleryUploadCover />);

        expect(screen.getByTestId("GalleryUploadCover")).toBeInTheDocument();

        await userEvent.click(screen.getByTestId("ImageUploadActions__button"));

        expect(screen.queryByTestId("ImageEditActions")).not.toBeInTheDocument();
        expect(screen.queryByTestId("ImageUploadActions")).toBeInTheDocument();
        expect(readDataUrlMock).toHaveBeenCalledTimes(1);
        expect(showToastMock).toHaveBeenCalledTimes(0);
    });

    it("should add a cover image", async () => {
        forceImageSize(300, 300);

        render(<GalleryUploadCover />);

        expect(screen.getByTestId("GalleryUploadCover")).toBeInTheDocument();

        await userEvent.click(screen.getByTestId("ImageUploadActions__button"));

        await waitFor(() => {
            expect(screen.getByTestId("ImageEditActions")).toBeInTheDocument();
        });
    });

    it("should add a cover image and save", async () => {
        forceImageSize(300, 300);

        const onSave = vi.fn();
        render(<GalleryUploadCover onSave={onSave} />);

        expect(screen.getByTestId("GalleryUploadCover")).toBeInTheDocument();

        await userEvent.click(screen.getByTestId("ImageUploadActions__button"));

        await waitFor(() => {
            expect(screen.getByTestId("ImageEditActions")).toBeInTheDocument();
        });

        await userEvent.click(screen.getByTestId("SliderFormActionsToolbar__save"));

        expect(onSave).toHaveBeenCalledWith({
            blob: new File(["test"], "nft.png"),
            imageDataURI: "data:application/octet-stream;base64,dGVzdA==",
        });
    });

    it("should add and remove a cover image", async () => {
        forceImageSize(300, 300);

        render(<GalleryUploadCover />);

        expect(screen.getByTestId("GalleryUploadCover")).toBeInTheDocument();

        await userEvent.click(screen.getByTestId("ImageUploadActions__button"));

        await waitFor(() => {
            expect(screen.getByTestId("ImageEditActions")).toBeInTheDocument();
        });

        await userEvent.click(screen.getByTestId("ImageEditActions__remove"));

        expect(screen.getByTestId("ImageUploadActions")).toBeInTheDocument();

        expect(screen.queryByTestId("ImageEditActions")).not.toBeInTheDocument();
    });

    it("should change cover image", async () => {
        render(<GalleryUploadCover coverUrl="/src.png" />);

        expect(screen.getByTestId("GalleryUploadCover")).toBeInTheDocument();
        expect(screen.getByTestId("ImageEditActions")).toBeInTheDocument();

        await userEvent.click(screen.getByTestId("ImageEditActions__upload"));

        expect(screen.getByTestId("Img")).not.toHaveAttribute("/src.png");
    });
});
