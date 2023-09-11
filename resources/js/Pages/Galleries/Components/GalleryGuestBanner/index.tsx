import { router } from "@inertiajs/react";
import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/Components/Buttons";
import { Icon } from "@/Components/Icon";
import { type MetaMaskState } from "@/Hooks/useMetaMask";

interface Properties extends Pick<MetaMaskState, "connecting" | "initialized" | "connectWallet"> {
    isAuthenticated: boolean;
}

const GalleryGuestBanner = ({ connectWallet, initialized, connecting, isAuthenticated }: Properties): JSX.Element => {
    const { t } = useTranslation();

    const handleClick = (): void => {
        if (isAuthenticated) {
            router.visit(route("my-galleries.create"));
        } else {
            void connectWallet();
        }
    };

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
                    className="w-full py-2 sm:w-fit sm:px-6"
                    disabled={connecting || !initialized}
                    onClick={handleClick}
                    variant="secondary"
                >
                    <span className="flex w-full items-center justify-center">
                        <Icon
                            name="Plus"
                            size="md"
                        />
                        <span className="ml-0.5 sm:w-full">{t("pages.galleries.guest_banner.create_gallery")}</span>
                    </span>
                </Button>
            </div>
        </div>
    );
};

export default GalleryGuestBanner;
