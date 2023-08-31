import { Tab } from "@headlessui/react";
import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { Tabs } from "@/Components/Tabs";
import { type NftTabTypes } from "@/Pages/Collections/Nfts/Components/NftHeading";
import { TraitsCarousel } from "@/Pages/Collections/Nfts/Components/TraitsCarousel";

export const NftTab = ({
    traits = [],
    selectedTab = "trait",
    onTabChange,
    ActivitiesTable,
}: {
    traits: App.Data.Collections.CollectionTraitData[];
    selectedTab: NftTabTypes;
    onTabChange: (tab: NftTabTypes) => void;
    ActivitiesTable: () => JSX.Element;
}): JSX.Element => {
    const { t } = useTranslation();

    const selectedIndex = Number(selectedTab === "activity");

    const tabChangeHandler = (index: number): void => {
        onTabChange(index === 1 ? "activity" : "trait");
    };

    return (
        <div className="px-6 sm:px-8">
            <Tab.Group
                selectedIndex={selectedIndex}
                onChange={tabChangeHandler}
            >
                <Tab.List>
                    <Tabs className="sm:w-full">
                        <Tab as={Fragment}>
                            {({ selected }) => (
                                <Tabs.Button
                                    className="w-1/2"
                                    selected={selected}
                                >
                                    <span>{t("pages.nfts.menu.properties")}</span>
                                </Tabs.Button>
                            )}
                        </Tab>
                        <Tab as={Fragment}>
                            {({ selected }) => (
                                <Tabs.Button
                                    className="w-1/2"
                                    selected={selected}
                                >
                                    <span>{t("pages.nfts.menu.activity")}</span>
                                </Tabs.Button>
                            )}
                        </Tab>
                    </Tabs>
                </Tab.List>

                <Tab.Panels className="mt-4">
                    <Tab.Panel>
                        <TraitsCarousel traits={traits} />
                    </Tab.Panel>
                    <Tab.Panel>
                        <ActivitiesTable />
                    </Tab.Panel>
                </Tab.Panels>
            </Tab.Group>
        </div>
    );
};
