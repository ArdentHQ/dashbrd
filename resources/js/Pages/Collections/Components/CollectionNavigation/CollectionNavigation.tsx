import { Tab } from "@headlessui/react";
import classNames from "classnames";
import { forwardRef, Fragment, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/Components/Buttons";
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
                                "text-theme-primary-600": !selected && !disabled,
                                "text-theme-secondary-500": disabled,
                            })}
                            className={classNames(
                                "w-full justify-center disabled:bg-transparent disabled:text-theme-secondary-500 sm:w-auto",
                                {
                                    "bg-transparent text-theme-primary-900": !selected,
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

export const CollectionNavigation = ({
    children,
    selectedTab,
    onTabChange,
}: {
    children: JSX.Element[];
    selectedTab: "collection" | "activity";
    onTabChange: (tab: "collection" | "activity") => void;
}): JSX.Element => {
    const { t } = useTranslation();

    const selectedIndex = useMemo(() => {
        if (selectedTab === "activity") {
            return 1;
        }

        return 0;
    }, [selectedTab]);

    const tabChangeHandler = (index: number): void => {
        if (index === 1) {
            onTabChange("activity");
        } else {
            onTabChange("collection");
        }
    };

    return (
        <Tab.Group
            selectedIndex={selectedIndex}
            onChange={tabChangeHandler}
        >
            <div className="backdrop-blur-7 -mx-6 mt-6 bg-theme-secondary-100 px-6 py-3 dark:bg-theme-dark-800 sm:-mx-8 sm:px-8 lg:mx-0 lg:rounded-xl lg:px-5">
                <Tab.List className="flex justify-between">
                    <div className="w-full sm:w-auto">
                        <Tabs className="space-x-1 bg-transparent dark:!bg-theme-dark-800">
                            <CollectionNavigationTab icon="DiamondOpacity">
                                {t("pages.collections.menu.collection")}
                            </CollectionNavigationTab>

                            <CollectionNavigationTab
                                icon="HeartbeatInCircle"
                                disabled
                            >
                                {t("pages.collections.menu.activity")}
                            </CollectionNavigationTab>
                        </Tabs>
                    </div>
                </Tab.List>
            </div>

            <Tab.Panels>{children}</Tab.Panels>
        </Tab.Group>
    );
};
