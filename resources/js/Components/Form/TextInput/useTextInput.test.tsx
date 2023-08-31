import { useRef } from "react";
import { useTextInput } from "./useTextInput";
import { render, screen, userEvent } from "@/Tests/testing-library";

describe("useTextInput", () => {
    const Component = (): JSX.Element => {
        const input = useRef<HTMLInputElement>(null);

        const { isMouseOver, handleMouseOut, handleMouseOver } = useTextInput({
            input,
        });

        return (
            <div
                ref={input}
                data-testid="wrapper"
                onMouseOver={handleMouseOver}
                onClick={handleMouseOut}
            >
                {isMouseOver && <div data-testid="mouseover-true" />}
                {!isMouseOver && <div data-testid="mouseover-false" />}
            </div>
        );
    };

    it("should handle mouseover", async () => {
        render(<Component />);

        await userEvent.hover(screen.getByTestId("wrapper"));

        expect(screen.queryByTestId("mouseover-true")).toBeInTheDocument();
    });

    it("should handle mouseout", async () => {
        render(<Component />);

        await userEvent.click(screen.getByTestId("wrapper"));

        expect(screen.queryByTestId("mouseover-false")).toBeInTheDocument();
    });
});
