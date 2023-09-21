import { router } from "@inertiajs/react";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { IconButton } from "@/Components/Buttons";
import { CollectionReportModal } from "@/Components/Collections/CollectionReportModal";
import { NftReportModal } from "@/Components/Collections/Nfts/NftReportModal";
import { Tooltip } from "@/Components/Tooltip";
import { useAuth } from "@/Hooks/useAuth";
import { useAuthorizedAction } from "@/Hooks/useAuthorizedAction";

interface Properties {
    model: App.Data.Nfts.NftData | App.Data.Collections.CollectionDetailData;
    modelType: "nft" | "collection";
    allowReport?: boolean;
    alreadyReported?: boolean;
    displayDefaultTooltip?: boolean;
    reportAvailableIn?: string | null;
    reportReasons?: Record<string, string>;
    tooltipOffset?: [number, number];
    className?: string;
    show: boolean;
}

const ReportModal = ({
    modelType,
    reportReasons,
    model,
    isOpen,
    onClose,
}: {
    modelType: "nft" | "collection";
    reportReasons: Record<string, string>;
    model: App.Data.Nfts.NftData | App.Data.Collections.CollectionDetailData;
    isOpen: boolean;
    onClose: () => void;
}): JSX.Element => {
    if (modelType === "nft") {
        return createPortal(
            <div data-testid="Report_nft">
                <NftReportModal
                    reportReasons={reportReasons}
                    nft={model as App.Data.Nfts.NftData}
                    isOpen={isOpen}
                    onClose={onClose}
                />
            </div>,
            document.body,
            "nft-report-modal",
        );
    }

    return (
        <div data-testid="Report_collection">
            <CollectionReportModal
                reportReasons={reportReasons}
                collection={model as App.Data.Collections.CollectionDetailData}
                isOpen={isOpen}
                onClose={onClose}
            />
        </div>
    );
};

export const Report = ({
    model,
    modelType,
    allowReport = true,
    alreadyReported = false,
    displayDefaultTooltip = false,
    reportAvailableIn = null,
    reportReasons = {},
    tooltipOffset,
    className,
    show,
}: Properties): JSX.Element => {
    const { t } = useTranslation();
    const [showReportModal, setShowReportModal] = useState(false);

    const { authenticated } = useAuth();

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

    const closeReportModalHandler = (): void => {
        setShowReportModal(false);

        router.reload({
            data: {
                report: undefined,
            },
        });
    };

    const { signedAction } = useAuthorizedAction();

    useEffect(() => {
        if (show && !disableReport && authenticated) {
            setShowReportModal(true);
        }
    }, [show, disableReport, authenticated]);

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
                            signedAction(({ signed }) => {
                                setShowReportModal(true);

                                if (!signed) {
                                    router.reload({
                                        data: {
                                            report: true,
                                        },
                                    });
                                }
                            });
                        }}
                        disabled={disableReport}
                        className={className}
                    />
                </div>
            </Tooltip>

            {!disableReport && (
                <ReportModal
                    onClose={closeReportModalHandler}
                    reportReasons={reportReasons}
                    model={model}
                    isOpen={showReportModal}
                    modelType={modelType}
                />
            )}
        </>
    );
};
