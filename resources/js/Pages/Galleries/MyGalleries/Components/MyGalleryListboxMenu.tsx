import { router } from "@inertiajs/react";
import cn from "classnames";
import { useTranslation } from "react-i18next";
import { CreateGalleryButton } from "./CreateGalleryButton";
import { Listbox } from "@/Components/Form/Listbox";
import { SidebarHead } from "@/Components/Sidebar/SidebarHead";

const routeName = "my-galleries";

export const MyGalleryListboxMenu = ({
    nftCount,
    publishedCount,
    draftsCount,
}: {
    nftCount: number;
    publishedCount: number;
    draftsCount?: number;
}): JSX.Element => {
    const { t } = useTranslation();

    const showPublished = route().current(routeName, { draft: false });

    const publishedRoute = route(routeName);

    const draftRoute = route(routeName, { draft: true });

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
                    onChange={(value: string) => {
                        router.get(value);
                    }}
                    isNavigation
                    value={showPublished ? publishedRoute : draftRoute}
                    label={
                        <>
                            {showPublished ? (
                                <div className="flex w-full justify-between">
                                    <span>{t("common.published")}</span>
                                    <span>{nftCount}</span>
                                </div>
                            ) : (
                                <div className="flex w-full justify-between">
                                    <span>{t("common.drafts")}</span>
                                    <span>{draftsCount}</span>
                                </div>
                            )}
                        </>
                    }
                >
                    <Listbox.Option
                        value={publishedRoute}
                        classNames={{
                            optionLabel: "flex w-full justify-between",
                            iconContainer: "flex flex-1 justify-between",
                        }}
                    >
                        <span>{t("common.published")}</span>
                        <span className="text-theme-secondary-700">{publishedCount}</span>
                    </Listbox.Option>

                    <Listbox.Option
                        value={draftRoute}
                        isDisabled={draftsCount === undefined || draftsCount === 0}
                        classNames={{
                            optionLabel: "flex w-full justify-between",
                            iconContainer: "flex flex-1 justify-between",
                        }}
                    >
                        <span>{t("common.drafts")}</span>
                        <span
                            className={cn(draftsCount !== undefined && draftsCount > 0 && "text-theme-secondary-700")}
                        >
                            {draftsCount}
                        </span>
                    </Listbox.Option>
                </Listbox>
            </div>
        </>
    );
};
