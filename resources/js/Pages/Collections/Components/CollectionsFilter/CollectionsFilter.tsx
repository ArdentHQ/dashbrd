import { Tab } from "@headlessui/react";
import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { CollectionsFilterPopover } from "./CollectionsFilterPopover";
import { CollectionsSorting } from "./CollectionsSorting";
import { SearchInput } from "@/Components/Form/SearchInput";
import { Tabs } from "@/Components/Tabs";
import { isTruthy } from "@/Utils/is-truthy";

export enum CollectionDisplayType {
    List = "list",
    Grid = "grid",
}

export const CollectionsFilter = ({
    searchQuery,
    setSearchQuery,
    disabled,
    onSelectDisplayType,
    showHidden,
    hiddenCount,
    activeSort,
    onSort,
    onChangeVisibilityStatus,
    displayType,
    isLoading,
    availableNetworks,
    handleSelectedChainIds,
    selectedChainIds,
}: {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    disabled?: boolean;
    onSelectDisplayType?: (type: CollectionDisplayType) => void;
    showHidden: boolean;
    hiddenCount: number;
    displayType: CollectionDisplayType;
    activeSort: string | null;
    onSort: (sortBy: string) => void;
    onChangeVisibilityStatus?: (isHidden: boolean) => void;
    isLoading?: boolean;
    availableNetworks: App.Data.Network.NetworkWithCollectionsData[];
    handleSelectedChainIds: (chainId: number) => void;
    selectedChainIds: number[];
}): JSX.Element => {
    const { t } = useTranslation();

    return (
        <div className="mt-5 flex flex-col">
            <div className="flex items-center space-x-3">
                <Tab.Group
                    as="div"
                    defaultIndex={0}
                >
                    <Tab.List>
                        <Tabs>
                            <Tab as={Fragment}>
                                <Tabs.Button
                                    icon="Bars"
                                    selected={displayType === CollectionDisplayType.List}
                                    disabled={disabled}
                                    onClick={() => onSelectDisplayType?.(CollectionDisplayType.List)}
                                />
                            </Tab>

                            <Tab as={Fragment}>
                                <Tabs.Button
                                    icon="GridDots"
                                    selected={displayType === CollectionDisplayType.Grid}
                                    disabled={disabled}
                                    onClick={() => onSelectDisplayType?.(CollectionDisplayType.Grid)}
                                />
                            </Tab>
                        </Tabs>
                    </Tab.List>
                </Tab.Group>

                <div className="flex-1">
                    <SearchInput
                        disabled={disabled}
                        className="hidden md:block"
                        placeholder={t("pages.collections.search_placeholder")}
                        query={searchQuery}
                        onChange={setSearchQuery}
                    />
                </div>

                <div>
                    <CollectionsSorting
                        disabled={disabled}
                        activeSort={activeSort}
                        onSort={onSort}
                    />
                </div>

                <div>
                    <CollectionsFilterPopover
                        isLoading={isLoading}
                        disabled={isTruthy(disabled) && hiddenCount === 0}
                        showHidden={showHidden}
                        hiddenCount={hiddenCount}
                        onChangeVisibilityStatus={onChangeVisibilityStatus}
                        availableNetworks={availableNetworks}
                        handleSelectedChainIds={handleSelectedChainIds}
                        selectedChainIds={selectedChainIds}
                    />
                </div>
            </div>

            <div className="mt-3 flex-1 md:hidden">
                <SearchInput
                    placeholder={t("pages.collections.search_placeholder")}
                    query={searchQuery}
                    onChange={setSearchQuery}
                    disabled={disabled}
                />
            </div>
        </div>
    );
};
