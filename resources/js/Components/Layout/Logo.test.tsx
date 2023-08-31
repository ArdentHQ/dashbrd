import { Logo } from "./Logo";
import { render, screen } from "@/Tests/testing-library";

describe("Logo", () => {
    it("should render", () => {
        render(<Logo />);

        expect(screen.getByTestId("Logo")).toBeInTheDocument();
    });

    it("should render app name", () => {
        process.env.VITE_APP_NAME = "Testing";

        render(<Logo displayHeading />);

        expect(screen.getByText("Testing")).toBeInTheDocument();
    });

    it("should not render dot separator by default", () => {
        render(<Logo />);

        expect(screen.queryByTestId("DotSeparator")).not.toBeInTheDocument();
    });

    it("should render dot separator when renderDotSeparator is true", () => {
        render(<Logo renderDotSeparator={true} />);

        expect(screen.getByTestId("DotSeparator")).toBeInTheDocument();
    });

    it("should render heading when displayHeading is true", () => {
        process.env.VITE_APP_NAME = "Testing";
        render(<Logo displayHeading={true} />);

        expect(screen.getByText("Testing")).toBeInTheDocument();
    });

    it("should only render heading for screen readers when displayHeading is false", () => {
        process.env.VITE_APP_NAME = "Testing";
        render(<Logo displayHeading={false} />);

        expect(screen.getByText("Testing").className).toContain("sr-only");
    });

    it("should support custom classnames", () => {
        render(<Logo className="h-10" />);

        expect(screen.getByTestId("Logo")).toHaveClass("h-10");
    });

    it("should not hide small icon by default", () => {
        render(<Logo />);

        expect(screen.getByTestId("Logo__icon_small")).not.toHaveClass("hidden");
        expect(screen.getByTestId("Logo__icon_medium")).toHaveClass("hidden");
    });

    it("should hide small icon when hideSmallIcon is true", () => {
        render(<Logo hideSmallIcon={true} />);

        expect(screen.getByTestId("Logo__icon_small")).toHaveClass("hidden");
        expect(screen.getByTestId("Logo__icon_medium")).not.toHaveClass("hidden");
    });
});
