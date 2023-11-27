import { Tab } from "@headlessui/react";
import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { Tabs } from "@/Components/Tabs";

// null means "top"
export type PopularCollectionsSortBy = "floor-price";
export interface PopularCollectionsSortingProperties {
    sortBy: PopularCollectionsSortBy | undefined;
    setSortBy: (sortBy: PopularCollectionsSortBy | undefined) => void;
}

export const PopularCollectionsSorting = ({ sortBy, setSortBy }: PopularCollectionsSortingProperties): JSX.Element => {
    const { t } = useTranslation();

    return (
        <Tab.Group as="div">
            <Tab.List>
                <Tabs widthClassName="w-full md-lg:w-auto">
                    <Tab as={Fragment}>
                        <Tabs.Button
                            growClassName="grow md-lg:grow-0"
                            selected={sortBy === undefined}
                            className="w-1/2 md-lg:w-auto"
                            onClick={() => {
                                setSortBy(undefined);
                            }}
                        >
                            {t("common.top")}
                        </Tabs.Button>
                    </Tab>

                    <Tab as={Fragment}>
                        <Tabs.Button
                            growClassName="grow md-lg:grow-0"
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
