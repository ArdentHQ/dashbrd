import axios from "axios";
import cn from "classnames";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { IconButton } from "@/Components/Buttons";
import { Clipboard } from "@/Components/Clipboard";
import { NetworkIcon } from "@/Components/Networks/NetworkIcon";
import { Report } from "@/Components/Report";
import { Tooltip } from "@/Components/Tooltip";
import { useToasts } from "@/Hooks/useToasts";
import { ExplorerChains } from "@/Utils/Explorer";

interface Properties {
    addTestIds: boolean;
    alreadyReported?: boolean;
    className?: string;
    nft: App.Data.Nfts.NftData;
    reportAvailableIn?: string | null;
    reportReasons?: Record<string, string>;
}

const NftActions = ({
    addTestIds = false,
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
            case ExplorerChains.EthereumTestnet:
                return t("common.view_nft_on_etherscan").toString();
            default:
                return t("common.view_nft_on_polygonscan").toString();
        }
    };

    const getChainLink = (chainId: App.Enums.Chains, collectionAddress: string, tokenNumber: string): string => {
        switch (chainId) {
            case ExplorerChains.EthereumMainnet:
            case ExplorerChains.EthereumTestnet:
                return t("urls.explorers.etherscan.token_transactions", {
                    address: tokenNumber,
                    token: collectionAddress,
                });
            case ExplorerChains.PolygonTestnet:
                return t("urls.explorers.mumbai.token_transactions", {
                    address: tokenNumber,
                    token: collectionAddress,
                });
            default:
                return t("urls.explorers.polygonscan.token_transactions", {
                    address: tokenNumber,
                    token: collectionAddress,
                });
        }
    };

    const handleClick = (): Window | null =>
        window.open(getChainLink(nft.collection.chainId, nft.collection.address, nft.tokenNumber), "_blank");

    return (
        <div className={cn("inline-flex gap-2 rounded-full", className)}>
            <Tooltip
                content={getTooltipText(nft.collection.chainId)}
                hideOnClick={true}
                zIndex={10}
            >
                <IconButton
                    icon={
                        <NetworkIcon
                            networkId={nft.collection.chainId}
                            textClassName="hidden"
                            withoutTooltip
                        />
                    }
                    onClick={handleClick}
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
                <IconButton icon="Copy" />
            </Clipboard>

            <Report
                reportReasons={reportReasons}
                model={nft}
                modelType={"nft"}
                alreadyReported={alreadyReported}
                reportAvailableIn={reportAvailableIn}
                displayDefaultTooltip={true}
            />

            <Tooltip
                content={t("common.refresh_metadata")}
                hideOnClick={false}
                zIndex={10}
            >
                <IconButton
                    data-testid={addTestIds ? "NftImage__refresh" : undefined}
                    icon="Refresh"
                    disabled={originalNftImage === null || isRefreshing}
                    onClick={() => {
                        void handleRefresh();
                    }}
                />
            </Tooltip>
        </div>
    );
};

export default NftActions;
