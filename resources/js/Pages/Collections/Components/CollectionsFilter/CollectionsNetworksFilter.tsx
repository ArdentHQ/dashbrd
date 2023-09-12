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
    <label className="group flex cursor-pointer items-center justify-between text-sm">
        <div className="flex items-center justify-center gap-3 text-base font-medium text-theme-secondary-700">
            <Checkbox
                value={value}
                onChange={() => {
                    handleClick(value);
                }}
                checked={isSelected}
            />

            <NetworkIcon
                networkId={value}
                withoutTooltip
            />
        </div>

        <div className="text-sm font-medium text-theme-secondary-700">{count}</div>
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
