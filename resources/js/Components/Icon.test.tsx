import React from "react";
import { Icon } from "./Icon";
import { render } from "@/Tests/testing-library";

describe("Icon", () => {
    it("should render", () => {
        const { asFragment } = render(<Icon name="ArrowUp" />);

        expect(asFragment()).toMatchSnapshot();
    });

    it("should render with dimensions", () => {
        const { asFragment } = render(
            <Icon
                name="ArrowUp"
                dimensions={{ width: 10, height: 10 }}
            />,
        );

        expect(asFragment()).toMatchSnapshot();
    });

    it("should render with dimensions and default size", () => {
        const { asFragment } = render(
            <Icon
                name="ArrowUp"
                size={undefined}
                dimensions={{ width: 10, height: 10 }}
            />,
        );

        expect(asFragment()).toMatchSnapshot();
    });
});
