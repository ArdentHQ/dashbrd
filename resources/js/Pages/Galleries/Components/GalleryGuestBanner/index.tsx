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
        <div className="gallery-guest-banner mx-6 mt-4 flex flex-col gap-3 rounded-xl border border-theme-secondary-300 bg-cover bg-center p-6 backdrop-blur sm:mx-8 md:flex-row md:items-center md:justify-between md:gap-4 md:bg-left 2xl:mx-0 dark:border-theme-dark-700">
            <div className="flex w-full flex-col gap-0.5 md:h-14 md:w-fit md:justify-center">
                <h3 className="text-center text-xl font-medium capitalize leading-7 text-theme-secondary-900 md:text-left md:text-2xl dark:text-theme-dark-50">
                    {t("pages.galleries.guest_banner.title")}{" "}
                    <span className="block text-theme-primary-600 sm:inline-block dark:text-theme-primary-400">{t("common.nft_gallery")}</span>
                </h3>
                <p className="text-center text-xs font-medium text-theme-secondary-700 md:text-left md:text-sm dark:text-theme-dark-200">
                    {t("pages.galleries.guest_banner.subtitle")}
                </p>
            </div>

            <div className="flex h-fit justify-center">
                <Button
                    icon="Plus"
                    className="justify-center·py-2·sm:w-fit·sm:px-6 dark:button-secondary-light bg-theme-secondary-100 md:button-light"
                    disabled={connecting || !initialized}
                    onClick={onClick}
                    variant={isMdAndAbove ? "secondary" : "primary"}
                >
                    {t("common.create_gallery")}
                </Button>
            </div>
        </div>
    );
};

export default GalleryGuestBanner;
