import { useTranslation } from "react-i18next";
import { GalleryPage } from "./Components/GalleryPage";
import { type FilterTypes, type GalleryFiltersPageProperties } from "@/Pages/Galleries/Galleries.contracts";

interface ConfigOption {
    title: string;
    routeInfo: {
        value: string;
        label: string;
    };
}

const FilterView = ({ type }: GalleryFiltersPageProperties): JSX.Element => {
    const { t } = useTranslation();

    const config: Record<FilterTypes, ConfigOption> = {
        "most-popular": {
            title: t("metatags.galleries.most_popular.title"),
            routeInfo: {
                value: route("galleries.most-popular"),
                label: t("pages.galleries.most_popular"),
            },
        },
        newest: {
            title: t("metatags.galleries.newest.title"),
            routeInfo: {
                value: route("galleries.newest"),
                label: t("pages.galleries.newest"),
            },
        },
        "most-valuable": {
            title: t("metatags.galleries.most_valuable.title"),
            routeInfo: {
                value: route("galleries.most-valuable"),
                label: t("pages.galleries.most_valuable"),
            },
        },
    };

    const page = config[type];

    return (
        <GalleryPage
            title={page.title}
            selectedOption={page.routeInfo}
        />
    );
};
export default FilterView;
