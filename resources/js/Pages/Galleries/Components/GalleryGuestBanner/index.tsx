import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/Components/Buttons";
import { useBreakpoint } from "@/Hooks/useBreakpoint";

import { type MetaMaskState } from "@/Hooks/useMetaMask";

interface Properties extends Pick<MetaMaskState, "connecting" | "initialized"> {
    onClick?: () => void;
}

const GalleryGuestBanner = ({ initialized, connecting, onClick }: Properties): JSX.Element => {
    const { t } = useTranslation();
    const { isMdAndAbove } = useBreakpoint();

    return (
        <div className="gallery-guest-banner mx-6 mt-4 flex flex-col gap-3 rounded-xl border border-theme-secondary-300 bg-cover bg-center p-6 backdrop-blur sm:mx-8 md:flex-row md:items-center md:justify-between md:gap-4 md:bg-left 2xl:mx-0">
            <div className="flex w-full flex-col gap-0.5 md:h-14 md:w-fit md:justify-center">
                <h3 className="text-center text-xl font-medium capitalize leading-7 text-theme-secondary-900 md:text-left md:text-2xl">
                    {t("pages.galleries.guest_banner.title")}{" "}
                    <span className="block text-theme-hint-600 sm:inline-block">{t("common.nft_gallery")}</span>
                </h3>
                <p className="text-center text-xs font-medium text-theme-secondary-700 md:text-left md:text-sm">
                    {t("pages.galleries.guest_banner.subtitle")}
                </p>
            </div>

            <div className="flex h-fit justify-center">
                <Button
                    icon="Plus"
                    className="w-full py-2 sm:w-fit sm:px-6"
                    disabled={connecting || !initialized}
                    onClick={onClick}
                    variant={isMdAndAbove ? "secondary" : "primary"}
                >
                    {t("pages.galleries.guest_banner.create_gallery")}
                </Button>
            </div>
        </div>
    );
};

export default GalleryGuestBanner;
