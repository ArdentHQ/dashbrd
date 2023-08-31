import { AddressingOverview } from "./AddressingOverview";
import { render, screen } from "@/Tests/testing-library";

describe("AddressingOverview", () => {
    const properties = {
        fromAddress: "0x0000000",
        toAddress: "0x0000001",
    };

    it("should render", () => {
        render(<AddressingOverview {...properties} />);

        expect(screen.getByTestId("AddressingOverview__Container")).toBeInTheDocument();
    });

    it("should display the correct from address", () => {
        render(<AddressingOverview {...properties} />);

        expect(screen.getByText(properties.fromAddress)).toBeInTheDocument();
    });

    it("should display the correct to address", () => {
        render(<AddressingOverview {...properties} />);

        expect(screen.getByText(properties.toAddress)).toBeInTheDocument();
    });
});
