import { useForm } from "@inertiajs/react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ConfirmationDialog } from "@/Components/ConfirmationDialog";
import { Radio } from "@/Components/Form/Radio";

interface Properties {
    nft: App.Data.Nfts.NftData;
    isOpen: boolean;
    onClose: () => void;
    reportReasons: Record<string, string>;
}

export const NftReportModal = ({ nft, reportReasons, isOpen, onClose }: Properties): JSX.Element => {
    const { t } = useTranslation();
    const [failed, setFailed] = useState(false);

    const { data, setData, processing, post, reset } = useForm({
        reason: "",
    });

    const close = (): void => {
        onClose();

        setFailed(false);
        reset("reason");
    };

    const submit = (): void => {
        setFailed(false);
        post(route("nft-reports.create", { nft: nft.id }), {
            preserveState: true,
            preserveScroll: true,
            onSuccess: close,
            onError: () => {
                setFailed(true);
            },
        });
    };

    const radioButtonReference = useRef<HTMLInputElement>(null);

    return (
        <ConfirmationDialog
            isOpen={isOpen}
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
    );
};
