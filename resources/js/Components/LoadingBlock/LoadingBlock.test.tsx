import React from "react";
import { LoadingBlock } from "./LoadingBlock";
import { render, screen } from "@/Tests/testing-library";

describe("LoadingBlock", () => {
    it("should render", () => {
        render(<LoadingBlock />);

        expect(screen.getByTestId("LoadingBlock")).toBeInTheDocument();
    });
});
