import { useTranslation } from "react-i18next";
import { Sidebar, SidebarItem } from "@/Components/Sidebar";

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
                icon="Cog"
                title={t("common.published")}
                isSelected={route().current("my-galleries")}
                href={route("my-galleries")}
                rightText={publishedCount.toString()}
            />

            <SidebarItem
                icon="Document"
                title={t("common.drafts")}
                isDisabled
                tooltip={t("common.coming_soon").toString()}
                rightText={draftsCount.toString()}
            />
        </Sidebar>
    );
};
