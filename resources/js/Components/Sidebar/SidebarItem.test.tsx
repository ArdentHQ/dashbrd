import React from "react";
import { SidebarItem } from "./SidebarItem";
import { render, screen } from "@/Tests/testing-library";

describe("SidebarItem", () => {
    it("should render", () => {
        render(
            <SidebarItem
                icon="Cog"
                title="General"
                href="/hello"
            />,
        );

        expect(screen.getByTestId("SidebarItem")).toBeInTheDocument();
    });

    it("should render with rightText", () => {
        render(
            <SidebarItem
                icon="Cog"
                title="General"
                rightText="1234"
                href="/hello"
            />,
        );

        expect(screen.getByTestId("SidebarItem")).toBeInTheDocument();

        expect(screen.getByText("1234")).toBeInTheDocument();
    });
});
