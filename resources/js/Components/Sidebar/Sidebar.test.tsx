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
                    href="#"
                    icon="Cog"
                    title="General"
                />

                <SidebarItem
                    href="#"
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
        expect(screen.getAllByTestId("SidebarItem")).toHaveLength(2);
        expect(screen.getAllByTestId("SidebarItem__disabled")).toHaveLength(1);
    });

    it("should not render sidebar head if title and subtitle are undefined", () => {
        render(
            <Sidebar>
                <SidebarItem
                    href="/first"
                    icon="Cog"
                    title="General"
                />

                <SidebarItem
                    isDisabled
                    icon="Bell"
                    title="Notifications"
                />

                <SidebarItem
                    isDisabled
                    icon="Laptop"
                    title="Sessions History"
                />
            </Sidebar>,
        );

        expect(screen.queryByText("SidebarHead")).not.toBeTruthy();
        expect(screen.getAllByTestId("SidebarItem")).toHaveLength(1);
        expect(screen.getAllByTestId("SidebarItem__disabled")).toHaveLength(2);
    });
});
