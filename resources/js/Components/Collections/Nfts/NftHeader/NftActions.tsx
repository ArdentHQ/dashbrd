import axios from "axios";
import cn from "classnames";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { IconButton } from "@/Components/Buttons";
import { ButtonLink } from "@/Components/Buttons/ButtonLink";
import { Clipboard } from "@/Components/Clipboard";
import { NetworkIcon } from "@/Components/Networks/NetworkIcon";
import { Report } from "@/Components/Report";
import { Tooltip } from "@/Components/Tooltip";
import { useToasts } from "@/Hooks/useToasts";
import { ExplorerChains } from "@/Utils/Explorer";

interface Properties {
    alreadyReported?: boolean;
    className?: string;
    nft: App.Data.Nfts.NftData;
    reportAvailableIn?: string | null;
    reportReasons?: Record<string, string>;
}

export const NftActions = ({
    alreadyReported = false,
    className,
    nft,
    reportAvailableIn = null,
    reportReasons,
}: Properties): JSX.Element => {
    const { t } = useTranslation();
    const { showToast } = useToasts();

    const [isRefreshing, setIsRefreshing] = useState(false);

    const { large: largeImage, original, originalRaw } = nft.images;
    const originalNftImage = original ?? originalRaw ?? largeImage;

    const handleRefresh = async (): Promise<void> => {
        setIsRefreshing(true);

        await axios.post<{ success: boolean }>(
            route("nft.refresh", {
                collection: nft.collection.slug,
                nft: nft.tokenNumber,
            }),
        );

        showToast({
            message: t("common.refreshing_metadata"),
            isExpanded: true,
        });
    };

    const getTooltipText = (chainId: App.Enums.Chains): string => {
        switch (chainId) {
            case ExplorerChains.EthereumMainnet:
                return t("common.view_nft_on_etherscan").toString();
            case ExplorerChains.EthereumTestnet:
                return t("common.view_nft_on_goerli_tesnet").toString();
            case ExplorerChains.PolygonMainnet:
                return t("common.view_nft_on_polygonscan").toString();
            default:
                return t("common.view_nft_on_mumbai_tesnet").toString();
        }
    };

    const getChainLink = (chainId: App.Enums.Chains, collectionAddress: string, tokenNumber: string): string => {
        switch (chainId) {
            case ExplorerChains.EthereumMainnet:
                return t("urls.explorers.etherscan.token_transactions", {
                    address: tokenNumber,
                    token: collectionAddress,
                });
            case ExplorerChains.EthereumTestnet:
                return t("urls.explorers.goerli.token_transactions", {
                    address: tokenNumber,
                    token: collectionAddress,
                });
            case ExplorerChains.PolygonMainnet:
                return t("urls.explorers.polygonscan.token_transactions", {
                    address: tokenNumber,
                    token: collectionAddress,
                });
            default:
                return t("urls.explorers.mumbai.token_transactions", {
                    address: tokenNumber,
                    token: collectionAddress,
                });
        }
    };

    return (
        <div
            className={cn("inline-flex gap-2 rounded-full", className)}
            data-testid={"NftActions__container"}
        >
            <Tooltip
                content={getTooltipText(nft.collection.chainId)}
                hideOnClick={true}
                zIndex={10}
            >
                <ButtonLink
                    data-testid={"NftActions__viewOnChain"}
                    variant="icon"
                    icon={
                        <NetworkIcon
                            networkId={nft.collection.chainId}
                            textClassName="hidden"
                            withoutTooltip
                        />
                    }
                    className="bg-transparent"
                    href={getChainLink(nft.collection.chainId, nft.collection.address, nft.tokenNumber)}
                    target="_blank"
                />
            </Tooltip>

            <Clipboard
                text={route("collection-nfts.view", {
                    collection: nft.collection.slug,
                    nft: nft.tokenNumber,
                })}
                copiedIconClass="button-icon w-10 h-10"
                tooltipTitle={t("common.copy_clipboard")}
            >
                <IconButton
                    icon="Copy"
                    className="bg-transparent"
                />
            </Clipboard>

            <Report
                reportReasons={reportReasons}
                model={nft}
                modelType={"nft"}
                alreadyReported={alreadyReported}
                reportAvailableIn={reportAvailableIn}
                displayDefaultTooltip={true}
                className="bg-transparent"
            />

            <Tooltip
                content={t("common.refresh_metadata")}
                hideOnClick={false}
                zIndex={10}
            >
                <IconButton
                    data-testid={"NftActions__refresh"}
                    icon="Refresh"
                    disabled={originalNftImage === null || isRefreshing}
                    className="bg-transparent"
                    onClick={() => {
                        void handleRefresh();
                    }}
                />
            </Tooltip>
        </div>
    );
};
