import { useState } from "react";
import { useTranslation } from "react-i18next";
import { NftCollectionSearch } from "./NftCollectionSearch";
import { Button } from "@/Components/Buttons";
import { Toggle } from "@/Components/Form/Toggle";
import { useEditableGalleryContext } from "@/Components/Galleries/Hooks/useEditableGalleryContext";
import { useNftSelectableContext } from "@/Components/Galleries/Hooks/useNftSelectableContext";
import { Slider, useSliderContext } from "@/Components/Slider";
import { useMetaMaskContext } from "@/Contexts/MetaMaskContext";

export const NftCollectionSlider = (): JSX.Element => {
    const [showHidden, setShowHidden] = useState<boolean>(false);
    const { t } = useTranslation();
    const { isOpen, setOpen } = useSliderContext();
    const { nfts } = useEditableGalleryContext();
    const { selected } = useNftSelectableContext();

    const { isShowConnectOverlay } = useMetaMaskContext();

    return (
        <Slider
            data-testid="NftCollectionSlider"
            isOpen={isOpen && !isShowConnectOverlay}
            onClose={() => {
                setOpen(false);
            }}
        >
            <Slider.Header>
                <div className="flex w-full items-center justify-between">
                    <span className="text-lg font-medium leading-8">{t("pages.galleries.my_nfts")}</span>
                    <div className="flex items-center gap-3">
                        <span className="text-base font-medium text-theme-secondary-700">
                            {t("pages.galleries.show_hidden_collections")}
                        </span>

                        <Toggle
                            checked={showHidden}
                            onChange={() => {
                                setShowHidden(!showHidden);
                            }}
                        />
                    </div>
                </div>
            </Slider.Header>
            <Slider.Content className="relative pb-28">
                <NftCollectionSearch showHidden={showHidden} />

                <div className="fixed inset-x-0 bottom-0 flex w-full items-center justify-end space-x-3 border-t border-theme-secondary-300 bg-white px-8 py-4 dark:border-theme-dark-700 dark:bg-theme-dark-900">
                    <Button
                        data-testid="NftCollectionSlider__cancel"
                        className="inline-flex flex-1 justify-center sm:flex-none"
                        variant="secondary"
                        onClick={() => {
                            setOpen(false);
                        }}
                    >
                        {t("common.cancel")}
                    </Button>

                    <Button
                        data-testid="NftCollectionSlider__add"
                        className="inline-flex flex-1 justify-center sm:flex-none"
                        disabled={selected.length === 0}
                        onClick={() => {
                            nfts.add(...selected);
                            setOpen(false);
                        }}
                    >
                        {t("common.add")}
                    </Button>
                </div>
            </Slider.Content>
        </Slider>
    );
};
