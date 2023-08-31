import React from "react";
import { Sidebar } from "./Sidebar";
import { SidebarItem } from "./SidebarItem";
import { render, screen } from "@/Tests/testing-library";

describe("Sidebar", () => {
    it("should render in %s screen", () => {
        render(
            <Sidebar
                title="Settings"
                subtitle="Customize your App Experience"
            >
                <SidebarItem
                    icon="Cog"
                    title="General"
                />

                <SidebarItem
                    icon="Bell"
                    title="Notifications"
                />

                <SidebarItem
                    icon="Laptop"
                    title="Sessions History"
                />
            </Sidebar>,
        );

        expect(screen.getByText("Settings")).toBeTruthy();
        expect(screen.getByText("Customize your App Experience")).toBeTruthy();
        expect(screen.getAllByTestId("SidebarItem")).toHaveLength(3);
    });

    it("should not render sidebar head if title and subtitle are undefined", () => {
        render(
            <Sidebar>
                <SidebarItem
                    icon="Cog"
                    title="General"
                />

                <SidebarItem
                    icon="Bell"
                    title="Notifications"
                />

                <SidebarItem
                    icon="Laptop"
                    title="Sessions History"
                />
            </Sidebar>,
        );

        expect(screen.queryByText("SidebarHead")).not.toBeTruthy();
        expect(screen.getAllByTestId("SidebarItem")).toHaveLength(3);
    });
});
