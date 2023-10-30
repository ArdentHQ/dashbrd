import { useTranslation } from "react-i18next";
import { type RouteParams } from "ziggy-js";
import { Sidebar, SidebarItem } from "@/Components/Sidebar";

const routeName = "my-galleries";

export const MyGallerySidebar = ({
    publishedCount,
    draftsCount,
}: {
    publishedCount: number;
    draftsCount: number;
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
                href={route(routeName, {
                    draft: undefined,
                } as unknown as RouteParams)}
                rightText={publishedCount.toString()}
            />

            <SidebarItem
                icon="Document"
                title={t("common.drafts")}
                isSelected={route().current(routeName, { draft: true })}
                href={route(routeName, { draft: true })}
                rightText={draftsCount.toString()}
            />
        </Sidebar>
    );
};
