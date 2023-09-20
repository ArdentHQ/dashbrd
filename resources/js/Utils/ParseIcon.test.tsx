import { type ButtonContentProperties } from "@/Components/Buttons";
import { Icon } from "@/Components/Icon";
import { render, screen } from "@/Tests/testing-library";
import { ParseIcon } from "@/Utils/ParseIcon";

describe("ParseIcon", () => {
    it("should render a icon by string", () => {
        render(
            <ParseIcon
                icon="ArrowUp"
                className="bg-red-500"
            />,
        );

        const icon = screen.getByTestId("icon-ArrowUp");

        expect(icon).toBeInTheDocument();

        expect(icon).toHaveClass("bg-red-500");
    });

    it("should render a icon by JSX.Element", () => {
        const icon = <Icon name="ArrowUp" />;

        render(<ParseIcon icon={icon} />);

        expect(screen.getByTestId("icon-ArrowUp")).toBeInTheDocument();
    });

    it("should render in sm size by default", () => {
        render(
            <ParseIcon
                icon="ArrowUp"
                size={undefined}
            />,
        );

        expect(screen.getByTestId("icon-ArrowUp")).toHaveClass("h-4 w-4");
    });

    it.each(["2xs", "xs", "sm", "md"] as Array<ButtonContentProperties["iconSize"]>)(
        "should render in custom sizes",
        (size) => {
            render(
                <ParseIcon
                    icon="ArrowUp"
                    size={size}
                />,
            );

            if (size === "2xs") {
                expect(screen.getByTestId("icon-ArrowUp")).toHaveClass("h-2 w-2");
            }

            if (size === "xs") {
                expect(screen.getByTestId("icon-ArrowUp")).toHaveClass("h-3 w-3");
            }

            if (size === "sm") {
                expect(screen.getByTestId("icon-ArrowUp")).toHaveClass("h-4 w-4");
            }

            if (size === "md") {
                expect(screen.getByTestId("icon-ArrowUp")).toHaveClass("h-5 w-5");
            }
        },
    );
});
