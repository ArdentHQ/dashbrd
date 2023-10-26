import { useTranslation } from "react-i18next";
import { Listbox } from "@/Components/Form/Listbox";
import { SidebarHead } from "@/Components/Sidebar/SidebarHead";

export const MyGalleryListboxMenu = (): JSX.Element => {
    const { t } = useTranslation();

    return (
        <>
            <div
                className="mb-6 px-8"
                data-testid="SettingsListboxMenu__head"
            >
                <SidebarHead
                    title={t("pages.galleries.my_galleries.title").toString()}
                    subtitle={t("pages.galleries.my_galleries.subtitle").toString()}
                />
            </div>

            <div
                className="bg-theme-secondary-100 px-6 py-4 dark:bg-theme-dark-800 sm:px-8"
                data-testid="SettingsListboxMenu"
            >
                <Listbox
                    isNavigation
                    value={route("my-galleries")}
                    label={t("common.published")}
                >
                    <Listbox.Option value={route("my-galleries")}>{t("common.published")}</Listbox.Option>

                    <Listbox.Option
                        value="#"
                        isDisabled
                    >
                        {t("common.drafts")}
                    </Listbox.Option>
                </Listbox>
            </div>
        </>
    );
};
