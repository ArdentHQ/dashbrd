import { router } from "@inertiajs/react";
import cn from "classnames";
import { useTranslation } from "react-i18next";
import { Button, type ButtonVariant } from "@/Components/Buttons";
import { Icon } from "@/Components/Icon";
import { Tooltip } from "@/Components/Tooltip";
import { isTruthy } from "@/Utils/is-truthy";

export const CreateGalleryButton = ({
    nftCount,
    variant,
    className,
    isDisabled,
    onClick,
    disableIfNoNfts = false,
}: {
    nftCount?: number;
    variant?: ButtonVariant;
    className?: string;
    isDisabled?: boolean;
    onClick?: () => void;
    disableIfNoNfts?: boolean;
}): JSX.Element => {
    const { t } = useTranslation();

    const createGalleryUrl = route("my-galleries.create");

    if (disableIfNoNfts && nftCount === 0) {
        return (
            <Tooltip
                content={t("pages.galleries.my_galleries.new_gallery_no_nfts")}
                touch
            >
                <span>
                    <Button
                        disabled={true}
                        variant={variant}
                        className="w-full sm:px-6"
                    >
                        <span className="flex flex-1 items-center justify-center space-x-2">
                            <Icon
                                name="Plus"
                                size="md"
                            />
                            <span>{t("common.create_gallery")}</span>
                        </span>
                    </Button>
                </span>
            </Tooltip>
        );
    }

    return (
        <>
            <Button
                disabled={isDisabled}
                variant={variant}
                onClick={() => {
                    if (isTruthy(onClick)) {
                        onClick();
                        return;
                    }

                    router.visit(createGalleryUrl);
                }}
                className={cn("sm:px-6", className)}
            >
                <span className="flex flex-1 items-center justify-center space-x-2">
                    <Icon
                        name="Plus"
                        size="md"
                    />
                    <span>{t("common.create_gallery")}</span>
                </span>
            </Button>
        </>
    );
};
