import { router } from "@inertiajs/react";
import { useTranslation } from "react-i18next";
import { Button } from "@/Components/Buttons";
import { Icon } from "@/Components/Icon";
import { Tooltip } from "@/Components/Tooltip";

export const CreateGalleryButton = ({ nftCount }: { nftCount: number }): JSX.Element => {
    const { t } = useTranslation();

    const createGalleryUrl = route("my-galleries.create");

    if (nftCount === 0) {
        return (
            <Tooltip
                content={t("pages.galleries.my_galleries.new_gallery_no_nfts")}
                touch
            >
                <Button
                    disabled={true}
                    className="w-full sm:w-auto"
                >
                    <span className="flex flex-1 items-center justify-center space-x-2">
                        <Icon
                            name="Plus"
                            size="md"
                        />
                        <span>{t("common.create_gallery")}</span>
                    </span>
                </Button>
            </Tooltip>
        );
    }

    return (
        <>
            <Button
                onClick={() => {
                    router.visit(createGalleryUrl);
                }}
                className="w-full sm:w-auto"
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
