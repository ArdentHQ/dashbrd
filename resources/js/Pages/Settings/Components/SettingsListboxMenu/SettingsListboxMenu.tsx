import { useTranslation } from "react-i18next";
import { Listbox } from "@/Components/Form/Listbox";
import { SidebarHead } from "@/Components/Sidebar/SidebarHead";

export const SettingsListboxMenu = (): JSX.Element => {
    const { t } = useTranslation();

    return (
        <>
            <div
                className="mb-6 px-8"
                data-testid="SettingsListboxMenu__head"
            >
                <SidebarHead
                    title={t("pages.settings.general.title").toString()}
                    subtitle={t("pages.settings.general.subtitle").toString()}
                />
            </div>

            <div
                className="bg-theme-secondary-100 px-6 py-4 sm:px-8"
                data-testid="SettingsListboxMenu"
            >
                <Listbox
                    isNavigation
                    value={route("settings.general")}
                    label={t("pages.settings.sidebar.general")}
                >
                    <Listbox.Option value={route("settings.general")}>
                        {t("pages.settings.sidebar.general")}
                    </Listbox.Option>

                    <Listbox.Option
                        value="/notifications"
                        isDisabled
                    >
                        {t("pages.settings.sidebar.notifications")}
                    </Listbox.Option>

                    <Listbox.Option
                        value="/history"
                        isDisabled
                    >
                        {t("pages.settings.sidebar.session_history")}
                    </Listbox.Option>
                </Listbox>
            </div>
        </>
    );
};
