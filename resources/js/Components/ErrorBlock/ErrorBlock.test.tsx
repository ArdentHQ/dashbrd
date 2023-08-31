import React from "react";
import { ErrorBlock } from "./ErrorBlock";
import { render, screen } from "@/Tests/testing-library";

describe("ErrorBlock", () => {
    it("should render 500 error", () => {
        render(
            <ErrorBlock
                statusCode={500}
                contactEmail="test@email.com"
            />,
        );

        expect(screen.getByTestId("ErrorContent")).toBeInTheDocument();
        expect(screen.getAllByTestId("ButtonLink--anchor")).toHaveLength(2);
    });

    it("should not render contact button if email is not provided", () => {
        render(
            <ErrorBlock
                statusCode={500}
                contactEmail=""
            />,
        );

        expect(screen.getByTestId("ErrorContent")).toBeInTheDocument();
        expect(screen.getAllByTestId("ButtonLink--anchor")).toHaveLength(1);
    });

    it("should render 503 error", () => {
        render(
            <ErrorBlock
                statusCode={503}
                contactEmail=""
            />,
        );

        expect(screen.getByTestId("ErrorContent")).toBeInTheDocument();
        expect(screen.getByText("Dashbrd is currently down for scheduled maintenance.")).toBeInTheDocument();
    });
});
