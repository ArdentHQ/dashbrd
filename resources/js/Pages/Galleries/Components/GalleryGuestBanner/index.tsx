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
        <div className="gallery-guest-banner mx-6 mt-4 flex flex-col gap-3 rounded-xl border border-theme-secondary-300 bg-cover bg-center p-6 backdrop-blur sm:mx-8 sm:flex-row sm:items-end sm:justify-between sm:gap-4 sm:bg-left 2xl:mx-0">
            <div className="flex w-full flex-col gap-0.5 sm:h-14 sm:w-fit sm:justify-center">
                <h3 className="text-center text-xl font-medium leading-7 text-theme-secondary-900 sm:text-left md:text-2xl">
                    {t("pages.galleries.guest_banner.showcase")}{" "}
                    <span className="text-theme-hint-600">{t("common.your_nfts")}!</span>
                </h3>
                <p className="text-center text-xs font-medium text-theme-secondary-700 sm:text-left md:text-sm">
                    {t("pages.galleries.guest_banner.subtitle")}
                </p>
            </div>

            <div className="flex h-fit justify-center">
                <Button
                    className="w-full py-2 sm:w-fit"
                    disabled={connecting || !initialized}
                    onClick={handleClick}
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
