import { NftHiddenCollectionsToggle } from "./NftHiddenCollectionsToggle";
import { render, screen } from "@/Tests/testing-library";

describe("NftHiddenCollectionsToggle", () => {
    it("should render", () => {
        render(
            <NftHiddenCollectionsToggle
                showHidden={true}
                setShowHidden={vi.fn()}
            />,
        );

        expect(screen.getByTestId("NftHiddenCollectionsToggle")).toBeInTheDocument();
    });

    it("should display the toggle as checked if showHidden is true", () => {
        const { asFragment } = render(
            <NftHiddenCollectionsToggle
                showHidden={true}
                setShowHidden={vi.fn()}
            />,
        );

        expect(screen.getByTestId("Toggle")).toBeInTheDocument();
        expect(asFragment()).toMatchSnapshot();
    });

    it("should display the toggle as unchecked if showHidden is false", () => {
        const { asFragment } = render(
            <NftHiddenCollectionsToggle
                showHidden={false}
                setShowHidden={vi.fn()}
            />,
        );

        expect(screen.getByTestId("Toggle")).toBeInTheDocument();
        expect(asFragment()).toMatchSnapshot();
    });

    it("should call setShowHidden when the toggle is clicked", () => {
        const setShowHidden = vi.fn();

        render(
            <NftHiddenCollectionsToggle
                showHidden={false}
                setShowHidden={setShowHidden}
            />,
        );

        screen.getByTestId("Toggle").click();

        expect(setShowHidden).toHaveBeenCalled();
    });

    it("should render a custom class name", () => {
        render(
            <NftHiddenCollectionsToggle
                showHidden={false}
                setShowHidden={vi.fn()}
                className="custom-class"
            />,
        );

        expect(screen.getByTestId("NftHiddenCollectionsToggle")).toHaveClass("custom-class");
    });
});
