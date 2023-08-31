import { Sidebar, SidebarItem } from "@/Components/Sidebar";

export default {
    title: "Base/Sidebar",
    component: Sidebar,
};

const WithTitleAndSubtitle = () => (
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
    </Sidebar>
);

const WithDisabledItems = () => (
    <Sidebar
        title="Settings"
        subtitle="Customize your App Experience"
    >
        <SidebarItem
            icon="Cog"
            title="General (Enabled)"
        />

        <SidebarItem
            icon="Bell"
            title="Notifications"
            isDisabled
        />

        <SidebarItem
            icon="Laptop"
            title="Sessions History"
            isDisabled
        />
    </Sidebar>
);

const WithSelectedItem = () => (
    <Sidebar
        title="Settings"
        subtitle="Customize your App Experience"
    >
        <SidebarItem
            icon="Cog"
            title="General"
            isSelected
        />

        <SidebarItem
            icon="Bell"
            title="Notifications"
        />

        <SidebarItem
            icon="Laptop"
            title="Sessions History"
        />
    </Sidebar>
);

const WithoutTitle = () => (
    <Sidebar subtitle="Customize your App Experience">
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
    </Sidebar>
);

const WithFocusedItem = () => {
    return (
        <div>
            <div className="mb-10 text-theme-secondary-700">Hit Tab to view the focused state.</div>
            <Sidebar subtitle="Customize your App Experience">
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
            </Sidebar>
        </div>
    );
};

export const Default = WithTitleAndSubtitle.bind({});
export const WithDisabledOptions = WithDisabledItems.bind({});
export const WithSelectedOption = WithSelectedItem.bind({});
export const WithSubtitleOnly = WithoutTitle.bind({});
export const WithFocusedOption = WithFocusedItem.bind({});
