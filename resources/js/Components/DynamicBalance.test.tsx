import { DynamicBalance } from "@/Components/DynamicBalance";
import { render } from "@/Tests/testing-library";

describe("DynamicBalance", () => {
    it("should render shortened balance when above threshold", () => {
        const { container } = render(
            <DynamicBalance
                balance="1000000"
                currency="USD"
            />,
        );

        expect(container).toHaveTextContent("$1M");
    });

    it("should render full balance when below threshold", () => {
        const { container } = render(
            <DynamicBalance
                balance="1000"
                currency="USD"
            />,
        );

        expect(container).toHaveTextContent("$1,000.00");
    });
});
