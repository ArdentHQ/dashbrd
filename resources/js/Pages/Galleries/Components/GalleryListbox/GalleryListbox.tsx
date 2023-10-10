import { router } from "@inertiajs/react";
import { useTranslation } from "react-i18next";
import { Listbox } from "@/Components/Form/Listbox";
import { useBreakpoint } from "@/Hooks/useBreakpoint";
import { isTruthy } from "@/Utils/is-truthy";

export const GalleryListbox = ({
    selectedOption,
    searchQuery,
}: {
    selectedOption: { value?: string; label?: string };
    searchQuery: string;
}): JSX.Element => {
    const { t } = useTranslation();

    const { isLgAndAbove } = useBreakpoint();

    const query = isTruthy(searchQuery) ? { query: searchQuery } : [];

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
                key={route("galleries.most-popular")}
                value={route("galleries.most-popular", query)}
                hasGradient
            >
                {t("pages.galleries.most_popular")}
            </Listbox.Option>

            <Listbox.Option
                key={route("galleries.newest")}
                value={route("galleries.newest", query)}
                hasGradient
            >
                {t("pages.galleries.newest")}
            </Listbox.Option>

            <Listbox.Option
                key={route("galleries.most-valuable")}
                value={route("galleries.most-valuable", query)}
                hasGradient
            >
                {t("pages.galleries.most_valuable")}
            </Listbox.Option>
        </Listbox>
    );
};
