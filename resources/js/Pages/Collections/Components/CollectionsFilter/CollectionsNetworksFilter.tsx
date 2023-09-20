import cn from "classnames";
import React from "react";
import { useTranslation } from "react-i18next";
import { Checkbox } from "@/Components/Form/Checkbox";
import { NetworkIcon } from "@/Components/Networks/NetworkIcon";

interface Properties {
    availableNetworks: App.Data.Network.NetworkWithCollectionsData[];
    selectedChainIds: number[];
    handleSelectedChainIds: (chainId: number) => void;
}

const NetworkFilterCheckbox = ({
    handleClick,
    count,
    value,
    isSelected,
}: {
    handleClick: (value: number) => void;
    count: number;
    value: App.Data.Network.NetworkWithCollectionsData["chainId"];
    isSelected: boolean;
}): JSX.Element => (
    <label
        className={cn("group flex  items-center justify-between text-sm", {
            "cursor-not-allowed": count === 0,
            "cursor-pointer": count > 0,
        })}
    >
        <div className="flex items-center justify-center gap-3 text-base font-medium text-theme-secondary-700">
            <Checkbox
                value={value}
                onChange={() => {
                    handleClick(value);
                }}
                checked={isSelected && count > 0}
                disabled={count === 0}
            />

            <NetworkIcon
                networkId={value}
                withoutTooltip
                displayTestnetNames
                textClassName={cn({
                    "text-theme-secondary-500": count === 0,
                })}
            />
        </div>

        <div
            className={cn("text-sm font-medium", {
                "text-theme-secondary-500": count === 0,
                "text-theme-secondary-700": count > 0,
            })}
        >
            {count}
        </div>
    </label>
);

const CollectionsNetworksFilter = ({
    availableNetworks,
    selectedChainIds,
    handleSelectedChainIds,
}: Properties): JSX.Element => {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col overflow-hidden rounded-xl bg-white shadow-xl lg:max-h-screen">
            <div className="bg-theme-secondary-50 px-6 py-3 text-sm font-medium text-theme-secondary-700">
                {t("pages.collections.collections_network")}
            </div>

            <div className="flex flex-col gap-3 px-6 pb-6 pt-3">
                {availableNetworks.map((network) => (
                    <NetworkFilterCheckbox
                        key={network.id}
                        value={network.chainId}
                        count={network.collectionsCount}
                        handleClick={handleSelectedChainIds}
                        isSelected={selectedChainIds.includes(network.chainId)}
                    />
                ))}
            </div>
        </div>
    );
};

export default CollectionsNetworksFilter;
