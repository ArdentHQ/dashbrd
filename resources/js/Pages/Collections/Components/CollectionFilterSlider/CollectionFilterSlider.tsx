import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/Components/Buttons";
import { Slider } from "@/Components/Slider";
import { CollectionOwnedToggle } from "@/Pages/Collections/Components/CollectionOwnedToggle";
import { CollectionPropertiesFilter } from "@/Pages/Collections/Components/CollectionPropertiesFilter";
import { type TraitsFilters } from "@/Pages/Collections/View";

interface Properties {
    open: boolean;
    traits: App.Data.Collections.CollectionTraitFilterData[];
    ownedNftsCount: number;
    defaultShowOnlyOwned: boolean;
    defaultSelectedTraits: TraitsFilters;
    onClose: () => void;
    selectedTraitsSetHandler: (
        previous: TraitsFilters,
        groupName: string,
        value: string,
        displayType: string,
    ) => TraitsFilters;
    setFilters: (showOnlyOwned: boolean, selectedTraits: TraitsFilters) => void;
}

export const CollectionFilterSlider = ({
    open,
    traits,
    ownedNftsCount,
    defaultShowOnlyOwned,
    defaultSelectedTraits,
    onClose,
    selectedTraitsSetHandler,
    setFilters,
}: Properties): JSX.Element => {
    const { t } = useTranslation();
    const [showOnlyOwned, setShowOnlyOwned] = useState(defaultShowOnlyOwned);
    const [selectedTraits, setSelectedTraits] = useState<TraitsFilters>(defaultSelectedTraits);

    const selectedTraitsChangedHandler = (groupName: string, value: string, displayType: string): void => {
        setSelectedTraits((previous) => selectedTraitsSetHandler(previous, groupName, value, displayType));
    };

    const resetFilters = (): void => {
        setShowOnlyOwned(defaultShowOnlyOwned);
        setSelectedTraits(defaultSelectedTraits);
        onClose();
    };

    const approveFilters = (): void => {
        setFilters(showOnlyOwned, selectedTraits);
        onClose();
    };

    return (
        <Slider
            isOpen={open}
            onClose={onClose}
            panelClassName="sm:w-[496px]"
        >
            <div className="flex min-h-screen flex-col">
                <div className="flex-grow">
                    <Slider.Header className="text-lg font-medium">{t("common.filter")}</Slider.Header>

                    <Slider.Content>
                        <div className="space-y-3">
                            <CollectionOwnedToggle
                                checked={showOnlyOwned}
                                onChange={setShowOnlyOwned}
                                ownedNftsCount={ownedNftsCount}
                            />

                            <CollectionPropertiesFilter
                                traits={traits}
                                changeHandler={selectedTraitsChangedHandler}
                                selected={selectedTraits}
                            />
                        </div>
                    </Slider.Content>
                </div>

                <div className="mt-auto">
                    <Slider.Content includePadding={false}>
                        <div className="flex justify-end space-x-3 border-t border-theme-secondary-300 px-8 py-3">
                            <Button
                                variant="secondary"
                                className="w-full justify-center sm:w-auto"
                                onClick={resetFilters}
                            >
                                {t("common.cancel")}
                            </Button>

                            <Button
                                className="w-full justify-center sm:w-auto"
                                variant="primary"
                                onClick={approveFilters}
                            >
                                {t("common.done")}
                            </Button>
                        </div>
                    </Slider.Content>
                </div>
            </div>
        </Slider>
    );
};
