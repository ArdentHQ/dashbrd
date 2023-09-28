import { expect } from "vitest";
import { DisplayType, DisplayTypes } from "@/Components/DisplayType";
import { render, screen, userEvent } from "@/Tests/testing-library";

describe("DisplayType", () => {
    it("should render the component", () => {
        const { rerender } = render(<DisplayType displayType={DisplayTypes.List} />);

        expect(screen.getByTestId("icon-Bars").closest("button")).toHaveClass("bg-white");
        expect(screen.getByTestId("icon-GridDots").closest("button")).not.toHaveClass("bg-white");

        rerender(<DisplayType displayType={DisplayTypes.Grid} />);

        expect(screen.getByTestId("icon-Bars").closest("button")).not.toHaveClass("bg-white");
        expect(screen.getByTestId("icon-GridDots").closest("button")).toHaveClass("bg-white");
    });

    it("should toggle display type when clicked", async () => {
        const onSelect = vi.fn();

        render(
            <DisplayType
                displayType={DisplayTypes.List}
                onSelectDisplayType={onSelect}
            />,
        );

        await userEvent.click(screen.getByTestId("icon-GridDots").closest("button") as HTMLButtonElement);

        expect(onSelect).toHaveBeenCalledOnce();
        expect(onSelect).toHaveBeenCalledWith(DisplayTypes.Grid);
    });
});
