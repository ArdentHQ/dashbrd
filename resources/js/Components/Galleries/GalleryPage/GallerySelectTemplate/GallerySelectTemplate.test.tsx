import { GallerySelectTemplate } from "./GallerySelectTemplate";
import * as useDarkModeContext from "@/Contexts/DarkModeContex";
import { render, screen } from "@/Tests/testing-library";

describe("GallerySelectTemplate", () => {
    beforeAll(() => {
        vi.spyOn(useDarkModeContext, "useDarkModeContext").mockReturnValue({ isDark: false, toggleDarkMode: vi.fn() });
    });

    afterAll(() => {
        vi.restoreAllMocks();
    });

    it("should render", () => {
        render(<GallerySelectTemplate />);

        expect(screen.getByTestId("GallerySelectTemplate")).toBeInTheDocument();
    });

    it("should support onCancel prop", () => {
        const onCancel = vi.fn();

        render(<GallerySelectTemplate onCancel={onCancel} />);

        screen.getByTestId("SliderFormActionsToolbar__cancel").click();
        expect(onCancel).toHaveBeenCalled();
    });

    it("should support custom classNames", () => {
        render(<GallerySelectTemplate className="custom-class" />);

        expect(screen.getByTestId("GallerySelectTemplate__wrapper")).toHaveClass("custom-class");
    });

    it("should render basic image in light mode", () => {
        render(<GallerySelectTemplate />);

        expect(screen.getByTestId("GallerySelectTemplate__basic_light")).toBeInTheDocument();
    });

    it("should render alt basic image in dark mode", () => {
        vi.spyOn(useDarkModeContext, "useDarkModeContext").mockReturnValue({ isDark: true, toggleDarkMode: vi.fn() });

        render(<GallerySelectTemplate />);

        expect(screen.getByTestId("GallerySelectTemplate__basic_dark")).toBeInTheDocument();
    });
});
