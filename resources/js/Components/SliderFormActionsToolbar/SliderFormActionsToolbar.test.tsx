import React from "react";
import { SliderFormActionsToolbar } from ".";
import { render, screen } from "@/Tests/testing-library";

describe("SliderFormActionsToolbar", () => {
    it("should render", () => {
        render(<SliderFormActionsToolbar />);

        expect(screen.getByTestId("SliderFormActionsToolbar__cancel")).toBeInTheDocument();
        expect(screen.getByTestId("SliderFormActionsToolbar__save")).toBeInTheDocument();
    });

    it("should render with custom label for save & cancel buttons", () => {
        render(
            <SliderFormActionsToolbar
                cancelButtonLabel="back"
                saveButtonLabel="continue"
            />,
        );

        expect(screen.getByTestId("SliderFormActionsToolbar__cancel")).toHaveTextContent("back");
        expect(screen.getByTestId("SliderFormActionsToolbar__save")).toHaveTextContent("continue");
    });

    it("should render with save button enabled", () => {
        render(<SliderFormActionsToolbar isSaveEnabled />);

        expect(screen.getByTestId("SliderFormActionsToolbar__save")).toBeEnabled();
    });
});
