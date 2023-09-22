import React from "react";
import { PageInput } from "./PageInput";
import { render, screen } from "@/Tests/testing-library";

describe("Pagination__PageInput", () => {
    it("renders", () => {
        const function1 = vi.fn();
        const function2 = vi.fn();
        const function3 = vi.fn();

        render(
            <PageInput
                onSubmit={function1}
                onChange={function2}
                onClose={function3}
                totalPages={10}
            />,
        );

        expect(screen.getByTestId("Pagination__PageInput__input")).toBeInTheDocument();
    });
});
