import React from "react";
import { MobileButton } from "./MobileButton";
import { render, screen } from "@/Tests/testing-library";

describe("Pagination__MobileButton", () => {
    it("renders", () => {
        render(
            <MobileButton
                page={1}
                totalPages={10}
            />,
        );

        expect(screen.getByTestId("Pagination__MobileButton_text").textContent).toBe("Page 1 of 10");
    });

    it("formats the page and total pages number", () => {
        render(
            <MobileButton
                page={1000}
                totalPages={11000}
            />,
        );

        expect(screen.getByTestId("Pagination__MobileButton_text").textContent).toBe("Page 1,000 of 11,000");
    });
});
