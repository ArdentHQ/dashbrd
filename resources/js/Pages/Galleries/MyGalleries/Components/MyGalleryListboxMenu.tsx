import { useTranslation } from "react-i18next";
import { CreateGalleryButton } from "./CreateGalleryButton";
import { Listbox } from "@/Components/Form/Listbox";
import { SidebarHead } from "@/Components/Sidebar/SidebarHead";

export const MyGalleryListboxMenu = ({ nftCount }: { nftCount: number }): JSX.Element => {
    const { t } = useTranslation();

    return (
        <>
            <div
                className="mb-6 flex flex-col space-y-3 px-8 sm:flex-row sm:items-end sm:justify-between sm:space-y-0"
                data-testid="MyGalleryListboxMenu__head"
            >
                <SidebarHead
                    title={t("pages.galleries.my_galleries.title").toString()}
                    subtitle={t("pages.galleries.my_galleries.subtitle").toString()}
                />

                <CreateGalleryButton nftCount={nftCount} />
            </div>

            <div
                className="bg-theme-secondary-100 px-6 py-4 dark:bg-theme-dark-800 sm:px-8"
                data-testid="MyGalleryListboxMenu"
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
