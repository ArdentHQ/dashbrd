import { Tab } from "@headlessui/react";
import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { Tabs } from "@/Components/Tabs";
import { type PopularCollectionsSortingProperties } from "@/Pages/Collections/Components/PopularCollectionsSorting/PopularCollectionsSorting";

export interface PeriodFiltersProperties extends Pick<PopularCollectionsSortingProperties, "sortBy"> {
    period: PeriodFilterOptions | undefined;
    setPeriod: (period: PeriodFilterOptions | undefined) => void;
}

export enum PeriodFilterOptions {
    "24h" = "24h",
    "7d" = "7d",
    "30d" = "30d",
}

export const PeriodFilters = ({ period, setPeriod, sortBy }: PeriodFiltersProperties): JSX.Element => {
    const { t } = useTranslation();

    return (
        <Tab.Group as="div">
            <Tab.List>
                <Tabs
                    widthClassName="w-full md-lg:w-auto"
                    disabled={sortBy === "floor-price"}
                >
                    {Object.values(PeriodFilterOptions).map((option) => (
                        <Tab
                            as={Fragment}
                            key={option}
                        >
                            <Tabs.Button
                                growClassName="grow md-lg:grow-0"
                                selected={
                                    period === option || (option === PeriodFilterOptions["24h"] && period === undefined)
                                }
                                onClick={() => {
                                    setPeriod(option);
                                }}
                                disabled={sortBy !== undefined}
                            >
                                {t(`common.${option}`)}
                            </Tabs.Button>
                        </Tab>
                    ))}
                </Tabs>
            </Tab.List>
        </Tab.Group>
    );
};
