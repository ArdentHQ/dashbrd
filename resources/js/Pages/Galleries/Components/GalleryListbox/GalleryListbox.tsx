import { router } from "@inertiajs/react";
import { useTranslation } from "react-i18next";
import { Listbox } from "@/Components/Form/Listbox";
import { useBreakpoint } from "@/Hooks/useBreakpoint";
import { isTruthy } from "@/Utils/is-truthy";

const url = (filter: "most-popular" | "newest" | "most-valuable", query: string | null = null): string => {
    if (query !== null) {
        return route("filtered-galleries.index", { filter, query });
    }

    return route("filtered-galleries.index", { filter });
};

export const GalleryListbox = ({
    selectedOption,
    searchQuery,
}: {
    selectedOption: { value?: string; label?: string };
    searchQuery: string;
}): JSX.Element => {
    const { t } = useTranslation();

    const { isLgAndAbove } = useBreakpoint();

    const query = isTruthy(searchQuery) ? searchQuery : null;

    return (
        <Listbox
            value={selectedOption.value}
            label={selectedOption.label}
            button={
                <>
                    {isLgAndAbove ? (
                        <Listbox.GradientButton>{selectedOption.label}</Listbox.GradientButton>
                    ) : (
                        <Listbox.Button isNavigation>
                            <span className="text-theme-primary-600 dark:text-theme-primary-400">
                                {selectedOption.label}
                            </span>
                        </Listbox.Button>
                    )}
                </>
            }
            onChange={(path) => {
                router.visit(path);
            }}
        >
            <Listbox.Option
                key={url("most-popular")}
                value={url("most-popular", query)}
                hasGradient
            >
                {t("pages.galleries.most_popular")}
            </Listbox.Option>

            <Listbox.Option
                key={url("newest")}
                value={url("newest", query)}
                hasGradient
            >
                {t("pages.galleries.newest")}
            </Listbox.Option>

            <Listbox.Option
                key={url("most-valuable")}
                value={url("most-valuable", query)}
                hasGradient
            >
                {t("pages.galleries.most_valuable")}
            </Listbox.Option>
        </Listbox>
    );
};
