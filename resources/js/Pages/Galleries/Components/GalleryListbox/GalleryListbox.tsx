import { router } from "@inertiajs/react";
import { useTranslation } from "react-i18next";
import { Listbox } from "@/Components/Form/Listbox";
import { useBreakpoint } from "@/Hooks/useBreakpoint";

export const GalleryListbox = ({
    selectedOption,
    searchQuery,
}: {
    selectedOption: { value?: string; label?: string };
    searchQuery: string;
}): JSX.Element => {
    const { t } = useTranslation();

    const { isLgAndAbove } = useBreakpoint();

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
                router.visit(path, { data: { query: searchQuery } });
            }}
        >
            <Listbox.Option
                key={route("filtered-galleries.index", { filter: "most-popular" })}
                value={route("filtered-galleries.index", { filter: "most-popular" })}
                hasGradient
            >
                {t("pages.galleries.most_popular")}
            </Listbox.Option>

            <Listbox.Option
                key={route("filtered-galleries.index", { filter: "newest" })}
                value={route("filtered-galleries.index", { filter: "newest" })}
                hasGradient
            >
                {t("pages.galleries.newest")}
            </Listbox.Option>

            <Listbox.Option
                key={route("filtered-galleries.index", { filter: "most-valuable" })}
                value={route("filtered-galleries.index", { filter: "most-valuable" })}
                hasGradient
            >
                {t("pages.galleries.most_valuable")}
            </Listbox.Option>
        </Listbox>
    );
};
