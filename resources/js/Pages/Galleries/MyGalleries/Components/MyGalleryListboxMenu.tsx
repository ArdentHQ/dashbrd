import { useTranslation } from "react-i18next";
import { CreateGalleryButton } from "./CreateGalleryButton";
import { Listbox } from "@/Components/Form/Listbox";
import { SidebarHead } from "@/Components/Sidebar/SidebarHead";

export const MyGalleryListboxMenu = ({
    nftCount,
    publishedCount,
    draftsCount,
}: {
    nftCount: number;
    publishedCount: number;
    draftsCount: number;
}): JSX.Element => {
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
                    label={
                        <div className="flex w-full justify-between">
                            <span>{t("common.published")}</span>
                            <span>{nftCount}</span>
                        </div>
                    }
                >
                    <Listbox.Option
                        value={route("my-galleries")}
                        classNames={{
                            optionLabel: "flex w-full justify-between",
                            iconContainer: "flex flex-1 justify-between",
                        }}
                    >
                        <span>{t("common.published")}</span>
                        <span className="text-theme-secondary-700">{publishedCount}</span>
                    </Listbox.Option>

                    <Listbox.Option
                        value="#"
                        isDisabled
                        classNames={{
                            optionLabel: "flex w-full justify-between",
                            iconContainer: "flex flex-1 justify-between",
                        }}
                    >
                        <span>{t("common.drafts")}</span>
                        {/* notice that the color is different because is disabled */}
                        <span className="text-theme-secondary-500">{draftsCount}</span>
                    </Listbox.Option>
                </Listbox>
            </div>
        </>
    );
};
