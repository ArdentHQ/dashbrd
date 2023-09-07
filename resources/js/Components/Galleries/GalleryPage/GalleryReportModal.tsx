import { router, useForm } from "@inertiajs/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { IconButton } from "@/Components/Buttons";
import { ConfirmationDialog } from "@/Components/ConfirmationDialog";
import { Radio } from "@/Components/Form/Radio";
import { Tooltip } from "@/Components/Tooltip";
import { useAuthorizedAction } from "@/Hooks/useAuthorizedAction";

export const GalleryReportModal = ({
    gallery,
    isDisabled = false,
    alreadyReported = false,
    reportAvailableIn = null,
    reportReasons = {},
    show = false,
}: {
    gallery?: App.Data.Gallery.GalleryData;
    isDisabled?: boolean;
    reportAvailableIn?: string | null;
    alreadyReported?: boolean;
    reportReasons?: Record<string, string>;
    show?: boolean;
}): JSX.Element => {
    const [open, setOpen] = useState(false);
    const [failed, setFailed] = useState(false);
    const { t } = useTranslation();

    const canReport = useMemo(
        () => !isDisabled && !alreadyReported && reportAvailableIn == null,
        [reportAvailableIn, alreadyReported, isDisabled],
    );

    const tooltip = useMemo(() => {
        if (alreadyReported) {
            return t("pages.reports.reported", {
                model: t("common.gallery"),
            });
        }

        if (reportAvailableIn != null) {
            return t("pages.reports.throttle", {
                time: reportAvailableIn,
            });
        }
    }, [reportAvailableIn, alreadyReported]);

    if (gallery === undefined) {
        return (
            <IconButton
                icon="Flag"
                data-testid="GalleryControls__flag-button"
                disabled={isDisabled}
            />
        );
    }

    const { data, setData, processing, post, reset } = useForm({
        reason: "",
    });

    const close = (): void => {
        setOpen(false);

        setFailed(false);

        reset("reason");

        router.reload({
            data: {
                report: undefined,
            },
        });
    };

    const submit = (): void => {
        setFailed(false);

        post(route("reports.create", { slug: gallery.slug }), {
            preserveState: true,
            preserveScroll: true,
            onSuccess: close,
            onError: () => {
                setFailed(true);
            },
        });
    };

    const radioButtonReference = useRef<HTMLInputElement>(null);

    const { signedAction } = useAuthorizedAction();

    useEffect(() => {
        if (show && canReport) {
            setOpen(true);
        }
    }, [show]);

    return (
        <>
            <Tooltip
                content={tooltip}
                disabled={tooltip === undefined}
            >
                <div>
                    <IconButton
                        icon="Flag"
                        data-testid="GalleryControls__flag-button"
                        onClick={() => {
                            signedAction(({ signed }) => {
                                setOpen(true);

                                if (!signed) {
                                    router.reload({
                                        data: {
                                            report: true,
                                        },
                                    });
                                }
                            });
                        }}
                        disabled={!canReport}
                    />
                </div>
            </Tooltip>

            <ConfirmationDialog
                isOpen={open}
                onClose={close}
                title={t("pages.reports.title")}
                cancelLabel={t("common.cancel")}
                confirmLabel={t("common.send")}
                onConfirm={submit}
                focus={radioButtonReference}
                isDisabled={processing || data.reason === ""}
            >
                <p className="leading-6 text-theme-secondary-700">{t("pages.reports.description")}</p>

                <div
                    className="mt-3 space-y-3"
                    data-testid="ReportModal"
                >
                    {Object.keys(reportReasons).map((reason, index) => (
                        <label
                            key={index}
                            className="flex items-center space-x-3"
                        >
                            <Radio
                                name="reason"
                                value={reason}
                                ref={index === 0 ? radioButtonReference : undefined}
                                data-testid="ReportModal__radio"
                                onChange={(event) => {
                                    setData("reason", event.target.value);
                                }}
                            />
                            <span className="text-theme-secondary-700">{reportReasons[reason]}</span>
                        </label>
                    ))}
                </div>

                {failed && (
                    <p
                        className="mt-4 text-sm text-theme-danger-500"
                        data-testid="ReportModal__failed"
                    >
                        {t("pages.reports.failed")}
                    </p>
                )}
            </ConfirmationDialog>
        </>
    );
};
