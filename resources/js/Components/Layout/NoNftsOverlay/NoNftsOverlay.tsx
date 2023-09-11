import { useTranslation } from "react-i18next";

import { ButtonLink } from "@/Components/Buttons/ButtonLink";
import { Overlay } from "@/Components/Layout/Overlay/Overlay";
import { OverlayButtonsWrapper } from "@/Components/Layout/Overlay/Overlay.blocks";
import { Toast } from "@/Components/Toast";
export const NoNftsOverlay = ({ show }: { show: boolean }): JSX.Element => {
    const { t } = useTranslation();

    return (
        <Overlay
            showOverlay={show}
            showCloseButton={false}
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
                    className=" w-full justify-center sm:w-auto"
                >
                    {t("pages.galleries.create.back_to_galleries")}
                </ButtonLink>
            </OverlayButtonsWrapper>
        </Overlay>
    );
};
