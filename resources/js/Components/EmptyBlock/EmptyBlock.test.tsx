import React from "react";
import { EmptyBlock } from "./EmptyBlock";
import { render, screen } from "@/Tests/testing-library";

describe("EmptyBlock", () => {
    it("should render", () => {
        render(<EmptyBlock />);

        expect(screen.getByTestId("EmptyBlock")).toBeInTheDocument();
    });
});
