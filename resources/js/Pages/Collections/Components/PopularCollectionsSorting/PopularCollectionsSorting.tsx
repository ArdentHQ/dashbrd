import { Tab } from "@headlessui/react";
import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { Tabs } from "@/Components/Tabs";

// null means "top"
export type PopularCollectionsSortBy = "floor-price";
export interface PopularCollectionsSortingProperties {
    sortBy: PopularCollectionsSortBy | null;
    setSortBy: (sortBy: PopularCollectionsSortBy | null) => void;
}

export const PopularCollectionsSorting = ({ sortBy, setSortBy }: PopularCollectionsSortingProperties): JSX.Element => {
    const { t } = useTranslation();

    return (
        <Tab.Group as="div">
            <Tab.List>
                <Tabs widthClassName="w-full md-lg:w-auto">
                    <Tab as={Fragment}>
                        <Tabs.Button
                            className="sm:grow md-lg:grow-0"
                            selected={sortBy === null}
                            onClick={() => {
                                setSortBy(null);
                            }}
                        >
                            {t("common.top")}
                        </Tabs.Button>
                    </Tab>

                    <Tab as={Fragment}>
                        <Tabs.Button
                            className="sm:grow md-lg:grow-0"
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
