import { useTranslation } from "react-i18next";
import { Icon } from "@/Components/Icon";
import { Sidebar, SidebarItem } from "@/Components/Sidebar";

const routeName = "my-galleries";

export const MyGallerySidebar = ({
    publishedCount,
    draftsCount,
    isLoadingDrafts,
}: {
    publishedCount: number;
    draftsCount?: number;
    isLoadingDrafts: boolean;
}): JSX.Element => {
    const { t } = useTranslation();

    return (
        <Sidebar
            title={t("pages.galleries.my_galleries.title").toString()}
            subtitle={t("pages.galleries.my_galleries.subtitle").toString()}
        >
            <SidebarItem
                icon="DocumentCheckmark"
                title={t("common.published")}
                isSelected={route().current(routeName, { draft: false })}
                href={route(routeName)}
                rightText={publishedCount.toString()}
            />

            <SidebarItem
                icon="Document"
                title={t("common.drafts")}
                isSelected={route().current(routeName, { draft: true })}
                isDisabled={draftsCount === undefined || draftsCount === 0}
                href={route(routeName, { draft: true })}
                rightText={
                    <>
                        {isLoadingDrafts && (
                            <Icon
                                name="Spinner"
                                className="animate-spin"
                            />
                        )}

                        {!isLoadingDrafts && draftsCount}
                    </>
                }
            />
        </Sidebar>
    );
};
