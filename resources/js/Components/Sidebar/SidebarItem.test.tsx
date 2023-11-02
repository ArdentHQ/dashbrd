import React from "react";
import { SidebarItem } from "./SidebarItem";
import { render, screen } from "@/Tests/testing-library";

describe("SidebarItem", () => {
    it("should render", () => {
        render(
            <SidebarItem
                icon="Cog"
                title="General"
                href="/"
            />,
        );

        expect(screen.getByTestId("SidebarItem")).toBeInTheDocument();

        expect(screen.queryByText("1234")).not.toBeInTheDocument();
    });

    it("should render with rightText", () => {
        render(
            <SidebarItem
                icon="Cog"
                title="General"
                rightText="1234"
                href="/"
            />,
        );

        expect(screen.getByTestId("SidebarItem")).toBeInTheDocument();

        expect(screen.getByText("1234")).toBeInTheDocument();
    });

    it("should render disabled item", () => {
        render(
            <SidebarItem
                icon="Cog"
                title="General"
                href="/"
                isDisabled
            />,
        );
        expect(screen.getByTestId("SidebarItem__disabled")).toBeInTheDocument();
    });
            
    it("should render disabled with rightText", () => {
        render(
            <SidebarItem
                icon="Cog"
                title="General"
                rightText="1234"
            />,
        );

        expect(screen.getByTestId("SidebarItem__disabled")).toBeInTheDocument();
        expect(screen.getByText("1234")).toBeInTheDocument();
    });

    it("should render disabled item if href is undefined", () => {
        render(
            <SidebarItem
                icon="Cog"
                title="General"
            />,
        );

        expect(screen.getByTestId("SidebarItem__disabled")).toBeInTheDocument();
    });
});
