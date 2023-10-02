import { t } from "i18next";
import React from "react";
import { PageInput } from "./PageInput";
import { render, screen } from "@/Tests/testing-library";
import { allBreakpoints } from "@/Tests/utils";

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

    it.each(allBreakpoints)("should render placeholder in %s screen", (breakpoint) => {
        render(
            <PageInput
                onSubmit={vi.fn()}
                onChange={vi.fn()}
                onClose={vi.fn()}
                totalPages={10}
            />,
            { breakpoint },
        );

        if (breakpoint === "xs") {
            expect(screen.getByTestId("Pagination__PageInput__input")).toHaveAttribute(
                "placeholder",
                t("common.pagination_input_placeholder_mobile").toString(),
            );
        } else {
            expect(screen.getByTestId("Pagination__PageInput__input")).toHaveAttribute(
                "placeholder",
                t("common.pagination_input_placeholder").toString(),
            );
        }
    });
});
