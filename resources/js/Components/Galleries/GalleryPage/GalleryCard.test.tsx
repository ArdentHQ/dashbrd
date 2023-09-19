import { GalleryCard } from "./GalleryCard";
import { render, screen } from "@/Tests/testing-library";
import { Breakpoint } from "@/Tests/utils";

describe("GalleryCard", () => {
    it("should render", () => {
        render(
            <GalleryCard isSelected={false}>
                <div>test</div>
            </GalleryCard>,
        );

        expect(screen.getByTestId("GalleryCard")).toBeInTheDocument();
    });

    it("should render children", () => {
        render(
            <GalleryCard isSelected={false}>
                <div>Gallery Card</div>
            </GalleryCard>,
        );

        expect(screen.getByText("Gallery Card")).toBeInTheDocument();
    });

    it("should render selected class", () => {
        render(
            <GalleryCard isSelected={true}>
                <div>Gallery Card</div>
            </GalleryCard>,
        );

        expect(screen.getByTestId("GalleryCard")).toHaveClass("outline-theme-hint-300");
    });

    it("should render fixedOnMobile class", () => {
        render(
            <GalleryCard
                isSelected={false}
                fixedOnMobile={true}
            >
                <div>Gallery Card</div>
            </GalleryCard>,
        );

        expect(screen.getByTestId("GalleryCard")).toHaveClass("lg:cursor-pointer");
    });

    it("should handle click when fixedOnMobile is true and isLgAndAbove is false", () => {
        const onClick = vi.fn();

        render(
            <GalleryCard
                isSelected={false}
                fixedOnMobile={true}
                onClick={onClick}
            >
                <div>Gallery Card</div>
            </GalleryCard>,
        );

        screen.getByTestId("GalleryCard").click();

        expect(onClick).toBeCalled();
    });

    it("should handle click when fixedOnMobile is false and isLgAndAbove is true", () => {
        const onClick = vi.fn();

        render(
            <GalleryCard
                isSelected={false}
                fixedOnMobile={false}
                onClick={onClick}
            >
                <div>Gallery Card</div>
            </GalleryCard>,
            { breakpoint: Breakpoint.lg },
        );

        screen.getByTestId("GalleryCard").click();

        expect(onClick).toBeCalled();
    });

    it("should not handle click when fixedOnMobile is false and isLgAndAbove is false", () => {
        const onClick = vi.fn();

        render(
            <GalleryCard
                isSelected={false}
                fixedOnMobile={true}
                onClick={onClick}
            >
                <div>Gallery Card</div>
            </GalleryCard>,
            { breakpoint: Breakpoint.sm },
        );

        screen.getByTestId("GalleryCard").click();

        expect(onClick).not.toBeCalled();
    });
});
