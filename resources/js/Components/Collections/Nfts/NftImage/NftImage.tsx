import axios from "axios";
import cn from "classnames";
import { saveAs } from "file-saver";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { IconButton } from "@/Components/Buttons";
import { Clipboard } from "@/Components/Clipboard";
import { GalleryCard } from "@/Components/Galleries/GalleryPage/GalleryCard";
import { Img } from "@/Components/Image";
import { NetworkIcon } from "@/Components/Networks/NetworkIcon";
import { Report } from "@/Components/Report";
import { Tooltip } from "@/Components/Tooltip";
import { ZoomDialog } from "@/Components/ZoomDialog";
import { useToasts } from "@/Hooks/useToasts";
import { useAuth } from "@/Hooks/useAuth";
import { useMetaMaskContext } from "@/Contexts/MetaMaskContext";

interface Properties {
    nft: App.Data.Nfts.NftData;
    alreadyReported?: boolean;
    reportAvailableIn?: string | null;
    reportReasons?: Record<string, string>;
}

export const NftImage = ({
    nft,
    alreadyReported = false,
    reportAvailableIn = null,
    reportReasons,
}: Properties): JSX.Element => {
    const { t } = useTranslation();
    const [showZoom, setShowZoomModal] = useState(false);
    const [disabledZoom, setDisabledZoom] = useState(false);
    const [selectedNft, setSelectedNft] = useState(false);
    const { showToast } = useToasts();
    const [isRefreshing, setIsRefreshing] = useState(false);

    const { authenticated } = useAuth();
    const { showConnectOverlay } = useMetaMaskContext();

    const { large: largeImage, original, originalRaw } = nft.images;
    const originalNftImage = original ?? originalRaw ?? largeImage;

    const handleRefresh = async (): Promise<void> => {
        if (!authenticated) {
            showConnectOverlay();
            return;
        }

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

    const renderActions = (className: string, addTestIds = false): JSX.Element => (
        <div className={cn("inline-flex gap-2 rounded-full p-1", className)}>
            <Tooltip
                content={t("common.zoom")}
                zIndex={10}
                hideOnClick={true}
                trigger="mouseenter"
            >
                <IconButton
                    data-testid={addTestIds ? "NftImage__zoomModal" : undefined}
                    icon="PlusInMagnifyingGlass"
                    disabled={originalNftImage === null || disabledZoom}
                    onClick={() => {
                        setShowZoomModal(true);
                    }}
                />
            </Tooltip>

            <Tooltip
                content={t("common.download")}
                hideOnClick={true}
                zIndex={10}
            >
                <IconButton
                    data-testid={addTestIds ? "NftImage__saveAs" : undefined}
                    icon="ArrowDownWithLine"
                    disabled={originalNftImage === null}
                    onClick={() => {
                        saveAs(originalNftImage as string, nft.name ?? undefined);
                    }}
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

    return (
        <>
            <GalleryCard
                className="w-full max-w-[44rem] !rounded-none md:!rounded-xl lg:w-[400px]"
                isSelected={selectedNft}
                onClick={() => {
                    setSelectedNft(false);
                }}
                fixedOnMobile
            >
                {/* Mobile actions... */}
                <div className="absolute inset-x-0 bottom-4 z-10 flex items-center justify-center lg:hidden">
                    {renderActions("backdrop-filter backdrop-blur-lg bg-theme-hint-50/50")}
                </div>

                {/* Desktop actions are displayed in an overlay... */}
                <GalleryCard.Overlay>{renderActions("bg-white/50", true)}</GalleryCard.Overlay>

                <div className="group relative h-full overflow-hidden md:rounded-lg">
                    {largeImage != null && (
                        <Img
                            data-testid="NftImage__image"
                            src={largeImage}
                            className="h-full w-full max-w-full transition duration-300 ease-in-out lg:w-auto"
                            wrapperClassName="h-full"
                            childWrapperClassName="h-full"
                            alt={t("pages.nfts.nft")}
                            onError={() => {
                                setDisabledZoom(true);
                            }}
                        />
                    )}

                    <div className="absolute left-6 top-6 flex xs:right-16 lg:right-6">
                        <div className="z-10 flex h-7.5 min-w-0 items-center rounded-3xl bg-theme-hint-50/50 px-3 py-1 backdrop-blur-lg backdrop-filter">
                            <div className="truncate text-sm font-medium text-theme-secondary-900">
                                # {nft.tokenNumber}
                            </div>
                        </div>
                    </div>

                    <NetworkIcon
                        networkId={nft.collection.chainId}
                        className="absolute right-6 top-6 z-10 h-7 w-7 rounded-full bg-theme-secondary-100/50 p-1 lg:hidden"
                    />
                </div>
            </GalleryCard>

            {originalNftImage !== null && !disabledZoom && (
                <ZoomDialog
                    isOpen={showZoom}
                    onClose={() => {
                        setShowZoomModal(false);
                        setSelectedNft(false);
                    }}
                >
                    {showZoom && (
                        <img
                            data-testid="NftImage__zoomImage"
                            src={originalNftImage}
                            alt={nft.name as string}
                            className="max-h-screen"
                        />
                    )}
                </ZoomDialog>
            )}
        </>
    );
};
