import { useTranslation } from "react-i18next";
import { Sidebar, SidebarItem } from "@/Components/Sidebar";

export const SettingsSidebar = (): JSX.Element => {
    const { t } = useTranslation();

    return (
        <Sidebar
            title={t("pages.settings.general.title").toString()}
            subtitle={t("pages.settings.general.subtitle").toString()}
        >
            <SidebarItem
                icon="Cog"
                title={t("pages.settings.sidebar.general")}
                isSelected={route().current("settings.general")}
                href={route("settings.general")}
            />

            <SidebarItem
                icon="Bell"
                title={t("pages.settings.sidebar.notifications")}
                isDisabled
                tooltip={t("common.coming_soon").toString()}
            />

            <SidebarItem
                icon="Laptop"
                title={t("pages.settings.sidebar.session_history")}
                isDisabled
                tooltip={t("common.coming_soon").toString()}
            />
        </Sidebar>
    );
};
