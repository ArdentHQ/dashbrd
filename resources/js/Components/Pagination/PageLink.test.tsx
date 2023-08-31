import React from "react";
import { PageLink } from "./PageLink";
import { render, screen } from "@/Tests/testing-library";

describe("Pagination__PageLink", () => {
    it("renders", () => {
        render(
            <PageLink
                href="/test"
                page={1}
                isActive
            />,
        );

        expect(screen.getByTestId("Pagination__PageLink__link").textContent).toBe("1");
    });

    it("renders if not active", () => {
        render(
            <PageLink
                href="/test"
                page={1}
                isActive={false}
            />,
        );

        expect(screen.getByTestId("Pagination__PageLink__link").textContent).toBe("1");
    });

    it("renders without the isActive prop", () => {
        render(
            <PageLink
                href="/test"
                page={1}
            />,
        );

        expect(screen.getByTestId("Pagination__PageLink__link").textContent).toBe("1");
    });

    it("formats the page number", () => {
        render(
            <PageLink
                href="/test"
                page={1000}
                isActive
            />,
        );

        expect(screen.getByTestId("Pagination__PageLink__link").textContent).toBe("1,000");
    });
});
