import { useTranslation } from "react-i18next";
import { IconButton } from "@/Components/Buttons";
import { Popover } from "@/Components/Popover";
import { Tooltip } from "@/Components/Tooltip";
import {
    PopularCollectionsSorting,
    type PopularCollectionsSortingProperties,
} from "@/Pages/Collections/Components/PopularCollectionsSorting/PopularCollectionsSorting";

export const PopularCollectionsFilterPopover = ({
    sortBy,
    setSortBy,
}: PopularCollectionsSortingProperties): JSX.Element => {
    const { t } = useTranslation();

    return (
        <Popover>
            {({ open }) => (
                <>
                    <div className="sm:relative">
                        <Tooltip content={t("common.filter")}>
                            <Popover.Button
                                as={IconButton}
                                icon="Funnel"
                            />
                        </Tooltip>
                    </div>

                    <Popover.Transition show={open}>
                        <div className="absolute inset-x-0 z-20 mt-4 w-full origin-top-right px-6 sm:left-auto sm:right-0 sm:mt-2 sm:w-[288px] sm:px-0">
                            <Popover.Panel
                                className="flex flex-col gap-2 "
                                baseClassName="bg-transparent"
                            >
                                <div className="w-full overflow-hidden rounded-xl bg-white shadow-xl dark:border dark:border-theme-dark-700 dark:bg-theme-dark-900">
                                    <div className="bg-theme-secondary-50 px-6 py-3 text-sm font-medium text-theme-secondary-700 dark:bg-theme-dark-950 dark:text-theme-dark-200">
                                        {t("common.filter")}
                                    </div>

                                    <div className="px-6 py-3">
                                        <PopularCollectionsSorting
                                            sortBy={sortBy}
                                            setSortBy={setSortBy}
                                        />
                                    </div>
                                </div>
                            </Popover.Panel>
                        </div>
                    </Popover.Transition>
                </>
            )}
        </Popover>
    );
};
