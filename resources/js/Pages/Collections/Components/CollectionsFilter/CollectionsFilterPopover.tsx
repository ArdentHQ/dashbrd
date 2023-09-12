import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import CollectionsNetworksFilter from "./CollectionsNetworksFilter";
import { IconButton } from "@/Components/Buttons";
import { Toggle } from "@/Components/Form/Toggle";
import { Popover } from "@/Components/Popover";
import { Tooltip } from "@/Components/Tooltip";
import { useDebounce } from "@/Hooks/useDebounce";

interface Properties {
    disabled?: boolean;
    hiddenCount: number;
    showHidden: boolean;
    onChangeVisibilityStatus?: (isHidden: boolean) => void;
    isLoading?: boolean;
    availableNetworks: App.Data.Network.NetworkWithCollectionsData[];
    handleSelectedChainIds: (chainId: number) => void;
    selectedChainIds: number[];
}

const debounceTimeout = 400;

export const CollectionsFilterPopover = ({
    disabled = false,
    showHidden,
    hiddenCount,
    onChangeVisibilityStatus,
    isLoading = false,
    availableNetworks,
    handleSelectedChainIds,
    selectedChainIds,
}: Properties): JSX.Element => {
    const { t } = useTranslation();
    const [hidden, setHidden] = useState(showHidden);

    useEffect(() => {
        setHidden(showHidden);
    }, [showHidden]);

    const [debouncedQuery] = useDebounce(hidden, debounceTimeout);

    useEffect(() => {
        if (showHidden !== hidden) {
            onChangeVisibilityStatus?.(hidden);
        }
    }, [debouncedQuery]);

    return (
        <Popover className="sm:relative">
            {({ open }) => (
                <>
                    <div className="sm:relative">
                        <Tooltip content={t("common.filter")}>
                            <Popover.Button
                                as={IconButton}
                                icon="Funnel"
                                disabled={disabled}
                            />
                        </Tooltip>

                        {hidden && <PulsatingDot />}
                    </div>

                    <Popover.Transition show={open}>
                        <div className="absolute inset-x-0 z-20 mt-4 w-full origin-top-right  px-6 sm:left-auto sm:right-0 sm:mt-2 sm:w-[266px] sm:px-0">
                            <Popover.Panel
                                className="flex flex-col gap-2 "
                                baseClassName="bg-transparent"
                            >
                                <CollectionsNetworksFilter
                                    availableNetworks={availableNetworks}
                                    selectedChainIds={selectedChainIds}
                                    handleSelectedChainIds={handleSelectedChainIds}
                                />

                                <div className="rounded-xl bg-white p-6 shadow-xl">
                                    <label className="flex items-center justify-between">
                                        <span className="flex items-center space-x-2">
                                            <span className="font-medium text-theme-secondary-900">
                                                {t("pages.collections.show_hidden")}
                                            </span>

                                            <span className="flex items-center justify-center rounded-full bg-theme-secondary-200 px-2.5 py-0.5 text-sm font-medium leading-5.5 text-theme-secondary-700">
                                                {hiddenCount}
                                            </span>
                                        </span>

                                        <Toggle
                                            disabled={hiddenCount === 0}
                                            checked={hidden}
                                            onChange={(isHidden) => {
                                                if (isLoading) {
                                                    return;
                                                }

                                                setHidden(isHidden);
                                            }}
                                        />
                                    </label>
                                </div>
                            </Popover.Panel>
                        </div>
                    </Popover.Transition>
                </>
            )}
        </Popover>
    );
};

const PulsatingDot = (): JSX.Element => (
    <>
        <span className="absolute right-0 top-0 mr-1 mt-0.5 flex h-1.5 w-1.5 rounded-full bg-theme-hint-600 ring-4 ring-white" />
        <span className="animate-ping-slow absolute right-0 top-0 mr-1 mt-0.5 flex h-1.5 w-1.5 rounded-full bg-theme-hint-600" />
    </>
);
