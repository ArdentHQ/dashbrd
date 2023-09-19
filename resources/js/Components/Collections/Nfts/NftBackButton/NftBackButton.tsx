import cn from "classnames";
import { useTranslation } from "react-i18next";
import { ButtonLink } from "@/Components/Buttons/ButtonLink";
import { Img } from "@/Components/Image";
import { Link } from "@/Components/Link";

interface Properties {
    nft: App.Data.Nfts.NftData;
    url: string;
    className?: string;
}

export const NftBackButton = ({ nft, url, className }: Properties): JSX.Element => {
    const { t } = useTranslation();

    return (
        <div
            className={cn("flex items-center space-x-2", className)}
            data-testid="NftBackButton"
        >
            <div className="flex-shrink-0">
                <ButtonLink
                    href={url}
                    icon="ChevronLeftSmall"
                    iconSize="2xs"
                    variant="icon"
                    className="h-6 w-6 lg:hidden"
                    data-testid="NftBackButton__urlDesktop"
                />

                <ButtonLink
                    href={url}
                    icon="ChevronLeftSmall"
                    iconSize="xs"
                    variant="icon"
                    className="hidden lg:flex"
                    data-testid="NftBackButton__urlMobile"
                />
            </div>

            <div className="flex-shrink-0">
                <Img
                    className="aspect-square h-6 w-6 rounded-full object-cover lg:h-10 lg:w-10"
                    src={nft.collection.image}
                    isCircle
                />
            </div>

            <div className="truncate font-medium text-theme-secondary-700">
                {t("common.back_to")}{" "}
                <Link
                    href={url}
                    className={cn(
                        "transition-default text-theme-hint-600 underline decoration-transparent underline-offset-2 outline-none",
                        "hover:text-theme-hint-700 hover:decoration-theme-hint-700",
                        "focus-visible:decoration-theme-hint-700",
                    )}
                >
                    {nft.collection.name}
                </Link>
            </div>
        </div>
    );
};
