import { router } from "@inertiajs/react";
import { useTranslation } from "react-i18next";
import { Button, ButtonVariant } from "@/Components/Buttons";
import { Icon } from "@/Components/Icon";
import { Tooltip } from "@/Components/Tooltip";
import cn from "classnames";
import { isTruthy } from "@/Utils/is-truthy";

export const CreateGalleryButton = ({
    nftCount,
    variant,
    className,
    isDisabled,
    onClick,
}: {
    nftCount: number;
    variant?: ButtonVariant;
    className?: string;
    isDisabled?: boolean;
    onClick?: () => void;
}): JSX.Element => {
    const { t } = useTranslation();

    const createGalleryUrl = route("my-galleries.create");

    if (nftCount === 0) {
        return (
            <Tooltip
                content={t("pages.galleries.my_galleries.new_gallery_no_nfts")}
                touch
            >
                <span>
                    <Button
                        disabled={true}
                        variant={variant}
                        className="sm:w-fit sm:px-6"
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
                className={cn("sm:w-fit sm:px-6", className)}
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
