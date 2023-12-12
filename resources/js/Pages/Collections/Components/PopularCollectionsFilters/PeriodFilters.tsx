import { Tab } from "@headlessui/react";
import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { Tabs } from "@/Components/Tabs";

export interface PeriodFiltersProperties {
    period: PeriodFilterOptions | undefined;
    setPeriod: (period: PeriodFilterOptions | undefined) => void;
    disabled: boolean;
}

export enum PeriodFilterOptions {
    "24h" = "24h",
    "7d" = "7d",
    "30d" = "30d",
}

export const PeriodFilters = ({ period, setPeriod, disabled = false }: PeriodFiltersProperties): JSX.Element => {
    const { t } = useTranslation();

    return (
        <Tab.Group as="div">
            <Tab.List>
                <Tabs
                    widthClassName="w-full md-lg:w-auto"
                    disabled={disabled}
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
                                disabled={disabled}
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
