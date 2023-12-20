import React from "react";
import { GridHeader } from "./GridHeader";
import { render, screen } from "@/Tests/testing-library";

describe("GridHeader", () => {
    it("should render", () => {
        render(
            <GridHeader
                title="Test Grid"
                value="Test Value"
            />,
        );

        expect(screen.getByTestId("GridHeader__title")).toHaveTextContent("Test Grid");
        expect(screen.getByTestId("GridHeader__value")).toHaveTextContent("Test Value");
    });

    it("should handle no value", () => {
        render(
            <GridHeader
                title="Test Grid"
                value={null}
            />,
        );

        expect(screen.getByTestId("GridHeader__title")).toHaveTextContent("Test Grid");
        expect(screen.getByTestId("GridHeader__value")).toHaveTextContent("N/A");
    });

    it("should handle overriding empty value", () => {
        render(
            <GridHeader
                title="Test Grid"
                value={null}
                emptyValue="Missing Value"
            />,
        );

        expect(screen.getByTestId("GridHeader__title")).toHaveTextContent("Test Grid");
        expect(screen.getByTestId("GridHeader__value")).toHaveTextContent("Missing Value");
    });

    it("should handle custom class name for wrapper", () => {
        render(
            <GridHeader
                title="Test Grid"
                value="Test Value"
                wrapperClassName="test-wrapper"
            />,
        );

        expect(screen.getByTestId("GridHeader__wrapper")).toHaveClass("test-wrapper");
    });
});
