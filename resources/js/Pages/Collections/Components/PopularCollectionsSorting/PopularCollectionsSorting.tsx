import { Tab } from "@headlessui/react";
import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { Tabs } from "@/Components/Tabs";

export type PopularCollectionsSortBy = "top" | "floor-price";
export interface PopularCollectionsSortingProperties {
    sortBy: PopularCollectionsSortBy;
    setSortBy: (sortBy: PopularCollectionsSortBy) => void;
}

export const PopularCollectionsSorting = ({ sortBy, setSortBy }: PopularCollectionsSortingProperties): JSX.Element => {
    const { t } = useTranslation();

    return (
        <Tab.Group as="div">
            <Tab.List>
                <Tabs widthClassName="w-full md-lg:w-auto">
                    <Tab as={Fragment}>
                        <Tabs.Button
                            className="w-1/2 md-lg:w-auto"
                            selected={sortBy === "top"}
                            onClick={() => {
                                setSortBy("top");
                            }}
                        >
                            {t("common.top")}
                        </Tabs.Button>
                    </Tab>

                    <Tab as={Fragment}>
                        <Tabs.Button
                            className="w-1/2 md-lg:w-auto"
                            selected={sortBy === "floor-price"}
                            onClick={() => {
                                setSortBy("floor-price");
                            }}
                        >
                            {t("common.floor_price")}
                        </Tabs.Button>
                    </Tab>
                </Tabs>
            </Tab.List>
        </Tab.Group>
    );
};
