import cn from "classnames";
import { type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Avatar } from "@/Components/Avatar";
import { ButtonLink } from "@/Components/Buttons/ButtonLink";
import { Icon } from "@/Components/Icon";
import { formatAddress } from "@/Utils/format-address";
import { TruncateMiddle } from "@/Utils/TruncateMiddle";

export const GalleryCurator = ({
    wallet,
    className,
    truncate = 10,
}: {
    wallet: App.Data.Gallery.GalleryWalletData;
    className?: string;
    truncate?: number | false;
    network?: App.Data.NetworkData;
}): JSX.Element => {
    const { t } = useTranslation();
    const address = formatAddress(wallet.address);

    const renderAddress = (): ReactNode =>
        wallet.domain === null ? address : <span className="max-w-23 truncate">{wallet.domain}</span>;

    const renderTruncatedAddress = (truncate: number): ReactNode => {
        if (wallet.domain !== null) {
            return <span className="max-w-23 truncate">{wallet.domain}</span>;
        }

        return (
            <TruncateMiddle
                length={truncate}
                text={address}
            />
        );
    };

    const explorerUrl = t("urls.explorers.etherscan.addresses", {
        address,
    });

    return (
        <ButtonLink
            variant="bordered"
            className={cn("group", className)}
            href={explorerUrl}
            target="_blank"
            rel="noreferrer nofollow"
        >
            <div
                className="-mx-1 flex items-center"
                data-testid="GalleryCurator"
            >
                <div className="flex items-center space-x-1 whitespace-nowrap text-sm font-medium text-theme-secondary-700">
                    <span>{t("pages.galleries.curated_by")}</span>

                    <div className="flex items-center space-x-2">
                        <span className="transition-default flex text-theme-hint-600 group-hover:text-theme-hint-700 group-hover:decoration-theme-hint-700">
                            {truncate !== false ? renderTruncatedAddress(truncate) : renderAddress()}
                        </span>

                        <Icon
                            name="ArrowExternalSmall"
                            size="sm"
                            className="text-theme-secondary-500"
                        />
                    </div>
                </div>

                <div className="transition-default mx-3 block h-5 border-l border-theme-secondary-300 group-hover:border-theme-secondary-400"></div>

                <div className="-mr-1 flex items-center">
                    <Avatar
                        address={wallet.address}
                        avatar={wallet.avatar}
                        size={20}
                    />
                </div>
            </div>
        </ButtonLink>
    );
};
