import { Tab } from "@headlessui/react";
import { router } from "@inertiajs/react";
import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { Tabs } from "@/Components/Tabs";

export interface PopularCollectionsSortingProperties {
    active: "top" | "floor-price";
}

export const PopularCollectionsSorting = ({ active }: PopularCollectionsSortingProperties): JSX.Element => {
    const { t } = useTranslation();

    const sortBy = (sort: "top" | "floor-price"): void => {
        if (sort === active) {
            return;
        }

        router.get(
            route("collections"),
            { sort: sort === "floor-price" ? sort : undefined },
            {
                only: ["collections", "activeSort"],
                preserveScroll: true,
                preserveState: true,
            },
        );
    };

    return (
        <Tab.Group as="div">
            <Tab.List>
                <Tabs widthClassName="w-full md-lg:w-auto">
                    <Tab as={Fragment}>
                        <Tabs.Button
                            className="w-1/2 md-lg:w-auto"
                            selected={active === "top"}
                            onClick={() => {
                                sortBy("top");
                            }}
                        >
                            {t("common.top")}
                        </Tabs.Button>
                    </Tab>

                    <Tab as={Fragment}>
                        <Tabs.Button
                            className="w-1/2 md-lg:w-auto"
                            selected={active === "floor-price"}
                            onClick={() => {
                                sortBy("floor-price");
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
