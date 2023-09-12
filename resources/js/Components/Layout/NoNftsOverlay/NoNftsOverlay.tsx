import { useTranslation } from "react-i18next";

import { ButtonLink } from "@/Components/Buttons/ButtonLink";
import { Icon, type IconName } from "@/Components/Icon";
import { Overlay } from "@/Components/Layout/Overlay/Overlay";
import { OverlayButtonsWrapper } from "@/Components/Layout/Overlay/Overlay.blocks";
import { Toast } from "@/Components/Toast";

const Marketplace = ({ icon, href }: { icon: IconName; href: string }): JSX.Element => (
    <a
        href={href}
        target="_blank"
        className="transition-default flex h-15 w-15 items-center justify-center rounded-full border border-theme-secondary-300 hover:bg-theme-secondary-300"
        rel="noreferrer"
    >
        <Icon
            name={icon}
            dimensions={{
                width: 40,
                height: 40,
            }}
        />
    </a>
);

export const NoNftsOverlay = ({ show }: { show: boolean }): JSX.Element => {
    const { t } = useTranslation();

    return (
        <Overlay
            showOverlay={show}
            showCloseButton={false}
            belowContent={
                <div className="flex max-w-sm flex-col p-8">
                    <div className="text-center font-medium text-theme-secondary-700">
                        {t("pages.galleries.create.can_purchase")}
                    </div>

                    <div className="mx-auto mt-3 flex gap-3">
                        <Marketplace
                            icon="OpenseaColor"
                            href="https://opensea.io/"
                        />
                        <Marketplace
                            icon="RaribleColor"
                            href="https://rarible.com/"
                        />
                        <Marketplace
                            icon="BlurColor"
                            href="https://blur.io/"
                        />
                        <Marketplace
                            icon="LooksRareColor"
                            href="https://looksrare.org/"
                        />
                    </div>
                </div>
            }
        >
            <div className="px-8">
                <Toast
                    type="info"
                    message={t("pages.galleries.create.must_own_one_nft").toString()}
                    isExpanded
                    iconDimensions={{ width: 18, height: 18 }}
                />
            </div>

            <OverlayButtonsWrapper>
                <ButtonLink
                    href={route("galleries")}
                    className="w-full justify-center sm:w-auto"
                >
                    {t("pages.galleries.create.back_to_galleries")}
                </ButtonLink>
            </OverlayButtonsWrapper>
        </Overlay>
    );
};
