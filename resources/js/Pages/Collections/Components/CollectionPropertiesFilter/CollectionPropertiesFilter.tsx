import groupBy from "lodash/groupBy";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { CollectionPropertiesGroup } from "./CollectionPropertiesFilter.blocks";
import { CustomScroll } from "@/Components/CustomScroll";

export const CollectionPropertiesFilter = ({
    traits,
    changeHandler,
    selected,
}: {
    traits: App.Data.Collections.CollectionTraitFilterData[];
    changeHandler: (groupName: string, value: string, displayType: string) => void;
    selected: Record<string, Array<{ value: string; displayType: string }> | undefined> | null;
}): JSX.Element => {
    const { t } = useTranslation();

    const groupedTraits = useMemo(() => groupBy(traits, "name"), [traits]);

    return (
        <div className="flex flex-col overflow-hidden border-y border-theme-secondary-300 dark:border-theme-dark-700 xs:rounded-xl xs:border lg:sticky lg:top-4 lg:max-h-screen">
            <div className="bg-theme-secondary-50 px-6 py-3 text-sm font-medium text-theme-secondary-700 dark:bg-theme-dark-950 dark:text-theme-dark-200">
                {t("pages.collections.properties")}
            </div>

            <CustomScroll>
                {Object.entries(groupedTraits).map(([groupName, traits]) => (
                    <CollectionPropertiesGroup
                        key={groupName}
                        groupName={groupName}
                        traits={traits}
                        selected={selected}
                        onChange={changeHandler}
                    />
                ))}
            </CustomScroll>
        </div>
    );
};
