import { useTranslation } from "react-i18next";
import { AppMenuItem } from "@/Components/Navbar/AppMenuItem";
import { useActiveUser } from "@/Contexts/ActiveUserContext";
import { useEnvironmentContext } from "@/Contexts/EnvironmentContext";

export const AppMenu = (): JSX.Element => {
    const { t } = useTranslation();

    const { features } = useEnvironmentContext();

    const activeRoute = route().current();

    const { authenticated } = useActiveUser();

    const items = [
        {
            isVisible: features.portfolio,
            title: t("pages.wallet.title"),
            route: "dashboard",
        },
        {
            isVisible: features.collections && authenticated,
            title: t("pages.collections.title"),
            route: "collections",
        },
        {
            isVisible: features.galleries && authenticated,
            title: t("pages.galleries.title"),
            route: "galleries",
        },
    ];

    const components = items
        .filter((item) => item.isVisible)
        .map((item) => (
            <AppMenuItem
                title={item.title}
                key={item.route}
                url={route(item.route)}
                isActive={item.route === activeRoute}
            />
        ));

    return <div className="hidden md-lg:flex [&>*:last-child>div]:border-0">{components}</div>;
};
