import React from "react";
import { InputError } from "@/Components/Form/InputError";
import { render, screen } from "@/Tests/testing-library";

describe("InputError", () => {
    const errorMessage = "error";

    it("should render", () => {
        render(<InputError message={errorMessage} />);

        expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it("should not render if message is undefined", () => {
        render(<InputError />);

        expect(screen.queryByText(errorMessage)).not.toBeInTheDocument();
    });

    it("should not render if message is empty string", () => {
        render(<InputError message="" />);

        expect(screen.queryByText(errorMessage)).not.toBeInTheDocument();
    });
});
