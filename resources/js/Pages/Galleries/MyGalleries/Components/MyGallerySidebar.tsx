import { useTranslation } from "react-i18next";
import { Icon } from "@/Components/Icon";
import { Sidebar, SidebarItem } from "@/Components/Sidebar";
import { isTruthy } from "@/Utils/is-truthy";

const routeName = "my-galleries";

export const MyGallerySidebar = ({
    publishedCount,
    draftsCount,
}: {
    publishedCount: number;
    draftsCount?: number;
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
                isDisabled={!isTruthy(draftsCount) || draftsCount === 0}
                isSelected={route().current(routeName, { draft: true })}
                href={route(routeName, { draft: true })}
                rightText={
                    draftsCount?.toString() ?? (
                        <Icon
                            name="Spinner"
                            className="animate-spin"
                        />
                    )
                }
            />
        </Sidebar>
    );
};
