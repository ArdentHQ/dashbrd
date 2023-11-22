import { Tab } from "@headlessui/react";
import { router } from "@inertiajs/react";
import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { Tabs } from "@/Components/Tabs";

interface Properties {
    active: "top" | "floor-price";
}

export const PopularCollectionsSorting = ({ active }: Properties): JSX.Element => {
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
                <Tabs>
                    <Tab as={Fragment}>
                        <Tabs.Button
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
