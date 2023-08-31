import React from "react";
import { ApplicationLogo } from "./ApplicationLogo";
import { render, screen } from "@/Tests/testing-library";

describe("ApplicationLogo", () => {
    it("should render", () => {
        render(<ApplicationLogo className="" />);

        expect(screen.getByTestId("ApplicationLogo")).toBeInTheDocument();
    });
});
