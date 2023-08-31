import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { IconButton } from "@/Components/Buttons";
import { CollectionReportModal } from "@/Components/Collections/CollectionReportModal";
import { NftReportModal } from "@/Components/Collections/Nfts/NftReportModal";
import { Tooltip } from "@/Components/Tooltip";

interface Properties {
    model: App.Data.Nfts.NftData | App.Data.Collections.CollectionDetailData;
    modelType: "nft" | "collection";
    allowReport?: boolean;
    alreadyReported?: boolean;
    displayDefaultTooltip?: boolean;
    reportAvailableIn?: string | null;
    reportReasons?: Record<string, string>;
    tooltipOffset?: [number, number];
}

export const Report = ({
    model,
    modelType,
    allowReport = true,
    alreadyReported = false,
    displayDefaultTooltip = false,
    reportAvailableIn = null,
    reportReasons = {},
    tooltipOffset,
}: Properties): JSX.Element => {
    const { t } = useTranslation();
    const [showReportModal, setShowReportModal] = useState(false);

    const disableReport = useMemo<boolean>((): boolean => {
        if (!allowReport) {
            return true;
        }

        return alreadyReported || reportAvailableIn != null;
    }, [alreadyReported, allowReport, reportAvailableIn]);

    const reportTooltip = useMemo(() => {
        if (alreadyReported) {
            return t("pages.reports.reported", {
                model: t(`common.${modelType}`),
            });
        }

        if (reportAvailableIn != null) {
            return t("pages.reports.throttle", {
                time: reportAvailableIn,
            });
        }

        if (displayDefaultTooltip) {
            return t("common.report");
        }
    }, [reportAvailableIn, alreadyReported]);

    return (
        <>
            <Tooltip
                content={reportTooltip}
                disabled={reportTooltip === undefined}
                zIndex={10}
                offset={tooltipOffset}
            >
                <div className="inline">
                    <IconButton
                        data-testid="Report_flag"
                        icon="Flag"
                        onClick={() => {
                            setShowReportModal(true);
                        }}
                        disabled={disableReport}
                    />
                </div>
            </Tooltip>

            {!disableReport && (
                <>
                    {modelType === "nft" &&
                        createPortal(
                            <div data-testid="Report_nft">
                                <NftReportModal
                                    reportReasons={reportReasons}
                                    nft={model as App.Data.Nfts.NftData}
                                    isOpen={showReportModal}
                                    onClose={() => {
                                        setShowReportModal(false);
                                    }}
                                />
                            </div>,
                            document.body,
                        )}

                    {modelType === "collection" && (
                        <div data-testid="Report_collection">
                            <CollectionReportModal
                                reportReasons={reportReasons}
                                collection={model as App.Data.Collections.CollectionDetailData}
                                isOpen={showReportModal}
                                onClose={() => {
                                    setShowReportModal(false);
                                }}
                            />
                        </div>
                    )}
                </>
            )}
        </>
    );
};
