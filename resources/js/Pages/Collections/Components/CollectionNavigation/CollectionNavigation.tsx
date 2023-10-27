import { Tab } from "@headlessui/react";
import classNames from "classnames";
import { forwardRef, Fragment, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/Components/Buttons";
import { Listbox } from "@/Components/Form/Listbox";
import { type IconName } from "@/Components/Icon";
import { Tabs } from "@/Components/Tabs";
import { Tooltip } from "@/Components/Tooltip";

const CollectionNavigationTab = forwardRef<
    HTMLButtonElement,
    {
        icon: IconName;
        disabled?: boolean;
        children: string;
        hoverClass?: string;
    }
>(({ icon, disabled = false, children, hoverClass = "hover:bg-theme-secondary-300" }, reference): JSX.Element => {
    const { t } = useTranslation();

    return (
        <Tooltip
            disabled={!disabled}
            content={t("common.coming_soon")}
        >
            <div className="basis-1/2">
                <Tab as={Fragment}>
                    {({ selected }) => (
                        <Button
                            ref={reference}
                            icon={icon}
                            variant="primary"
                            iconClass={classNames("w-[18px] h-auto", {
                                "text-theme-primary-600 dark:text-theme-primary-400": !selected && !disabled,
                                "text-theme-secondary-500": disabled,
                            })}
                            className={classNames(
                                "w-full justify-center disabled:bg-transparent disabled:text-theme-secondary-500 sm:w-auto",
                                {
                                    "!bg-transparent text-theme-primary-900": !selected,
                                    [hoverClass]: !selected && !disabled,
                                },
                            )}
                            disabled={disabled}
                        >
                            {children}
                        </Button>
                    )}
                </Tab>
            </div>
        </Tooltip>
    );
});

CollectionNavigationTab.displayName = "CollectionNavigationTab";

export type TabName = "collection" | "articles" | "activity";

const tabs: TabName[] = ["collection", "articles", "activity"];

export const CollectionNavigation = ({
    children,
    selectedTab,
    onTabChange,
}: {
    children: JSX.Element[];
    selectedTab: TabName;
    onTabChange: (tab: TabName) => void;
}): JSX.Element => {
    const { t } = useTranslation();

    const selectedIndex = useMemo(() => tabs.findIndex((tab) => tab === selectedTab), [selectedTab]);

    const tabChangeHandler = (index: number): void => {
        onTabChange(tabs[index]);
    };

    return (
        <Tab.Group
            selectedIndex={selectedIndex}
            onChange={tabChangeHandler}
        >
            <div className="backdrop-blur-7 -mx-6 mt-6 bg-theme-secondary-100 py-3 dark:bg-theme-dark-800 sm:-mx-8 lg:mx-0 lg:rounded-xl">
                <div className="hidden sm:block">
                    <Tab.List className="flex justify-between">
                        <div className="w-full sm:w-auto">
                            <Tabs
                                className="space-x-1 !bg-transparent"
                                wrapperClassName="px-6 lg:px-5 sm:px-8"
                            >
                                <CollectionNavigationTab icon="DiamondOpacity">
                                    {t("pages.collections.menu.collection")}
                                </CollectionNavigationTab>

                                <CollectionNavigationTab icon="Newspaper">
                                    {t("pages.collections.menu.articles")}
                                </CollectionNavigationTab>

                                <CollectionNavigationTab icon="HeartbeatInCircle">
                                    {t("pages.collections.menu.activity")}
                                </CollectionNavigationTab>
                            </Tabs>
                        </div>
                    </Tab.List>
                </div>
                <div className="mx-6 sm:mx-8 sm:hidden">
                    <CollectionNavigationListBox
                        selectedIndex={selectedIndex}
                        setSelectedIndex={tabChangeHandler}
                    />
                </div>
            </div>

            <Tab.Panels>{children}</Tab.Panels>
        </Tab.Group>
    );
};

export const CollectionNavigationListBox = ({
    selectedIndex,
    setSelectedIndex,
}: {
    selectedIndex: number;
    setSelectedIndex: (index: number) => void;
}): JSX.Element => {
    const { t } = useTranslation();

    const options = [
        t("pages.collections.menu.collection"),
        t("pages.collections.menu.articles"),
        t("pages.collections.menu.activity"),
    ];

    const selectedLabel = options[selectedIndex];

    return (
        <Listbox
            value={selectedIndex}
            label={selectedLabel}
            button={
                <Listbox.Button isNavigation>
                    <span>{selectedLabel}</span>
                </Listbox.Button>
            }
            onChange={setSelectedIndex}
        >
            {options.map((option, index) => (
                <Listbox.Option
                    key={index}
                    value={index}
                    hasGradient
                >
                    {option}
                </Listbox.Option>
            ))}
        </Listbox>
    );
};
