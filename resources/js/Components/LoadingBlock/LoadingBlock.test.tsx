import React from "react";
import { LoadingBlock } from "./LoadingBlock";
import { render } from "@/Tests/testing-library";

describe("LoadingBlock", () => {
    it("should render", () => {
        const { getByTestId } = render(<LoadingBlock>Loading...</LoadingBlock>);

        expect(getByTestId("LoadingBlock")).toBeInTheDocument();
    });
});
