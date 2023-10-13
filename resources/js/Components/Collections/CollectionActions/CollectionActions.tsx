import { router } from "@inertiajs/react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { IconButton } from "@/Components/Buttons";
import { CollectionReportModal } from "@/Components/Collections/CollectionReportModal";
import { Dropdown } from "@/Components/Dropdown";
import { Icon } from "@/Components/Icon";
import { Tooltip } from "@/Components/Tooltip";
import { useAuthorizedAction } from "@/Hooks/useAuthorizedAction";

interface ActionProperties extends Omit<React.HTMLProps<HTMLButtonElement>, "type"> {}

const Action = ({ ...properties }: ActionProperties): JSX.Element => (
    <button
        type="button"
        className="transition-default block w-full whitespace-nowrap rounded-sm px-6 py-2.5 text-left text-base font-medium text-theme-secondary-700 outline-none outline-3 outline-offset-[-3px]  focus-visible:outline-theme-primary-300 enabled:cursor-pointer enabled:hover:bg-theme-secondary-100 enabled:hover:text-theme-secondary-900 disabled:text-theme-secondary-500"
        {...properties}
    />
);

interface CollectionActionsProperties {
    collection: App.Data.Collections.CollectionData;
    className?: string;
    buttonClassName?: string;
    isHidden?: boolean;
    reportAvailableIn?: string | null;
    alreadyReported?: boolean | null;
    onChanged: () => void;
    reportReasons?: Record<string, string>;
    onReportCollection?: (address: string) => void;
}

export const CollectionActions = ({
    className,
    buttonClassName,
    isHidden = false,
    collection,
    reportAvailableIn = null,
    alreadyReported = false,
    onChanged,
    reportReasons = {},
    onReportCollection,
}: CollectionActionsProperties): JSX.Element => {
    const { t } = useTranslation();
    const { signedAction } = useAuthorizedAction();
    const [showReportModal, setShowReportModal] = useState(false);

    const reportTooltip = useMemo(() => {
        if (alreadyReported === true) {
            return t("pages.reports.reported", {
                model: t("common.collection"),
            });
        }

        if (reportAvailableIn != null) {
            return t("pages.reports.throttle", {
                time: reportAvailableIn,
            });
        }
    }, [reportAvailableIn, alreadyReported]);

    const toggleVisibility = (): void => {
        if (isHidden) {
            router.delete(route("hidden-collections.destroy", collection.address), {
                preserveScroll: true,
                preserveState: true,
                onFinish: onChanged,
            });
        } else {
            router.post(
                route("hidden-collections.store", collection.address),
                {},
                {
                    preserveScroll: true,
                    preserveState: true,
                    onFinish: onChanged,
                },
            );
        }
    };

    return (
        <div
            data-testid="CollectionActions"
            className={className}
            onClick={(event) => {
                event.stopPropagation();
            }}
        >
            <Dropdown
                withPopper
                withPortal
            >
                <Dropdown.Trigger className="relative flex">
                    {() => (
                        <IconButton
                            data-testid="CollectionActions__trigger"
                            icon={
                                <Icon
                                    name="Ellipsis"
                                    size="lg"
                                />
                            }
                            className={buttonClassName}
                        />
                    )}
                </Dropdown.Trigger>

                <Dropdown.Content
                    className="-z-1 w-full px-6 sm:w-auto sm:px-0"
                    contentClasses="shadow-3xl flex w-full select-none flex-col rounded-xl bg-white py-3.5 sm:w-auto"
                >
                    {({ setOpen }) => (
                        <div data-testid="CollectionActions__popup">
                            <Tooltip
                                content={reportTooltip}
                                disabled={reportTooltip === undefined}
                            >
                                <div>
                                    <Action
                                        title={t("common.report")}
                                        onClick={() => {
                                            setOpen(false);

                                            void signedAction(({ signed }) => {
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
                                        disabled={reportAvailableIn != null || alreadyReported === true}
                                        data-testid="CollectionActions__report"
                                    >
                                        {t("common.report")}
                                    </Action>
                                </div>
                            </Tooltip>

                            <Action
                                data-testid="CollectionActions__hide"
                                onClick={() => {
                                    setOpen(false);

                                    void signedAction(({ signed }) => {
                                        if (!signed) {
                                            router.reload({
                                                data: {
                                                    report: true,
                                                },
                                            });
                                        }
                                        toggleVisibility();
                                    });
                                }}
                            >
                                {isHidden
                                    ? t("pages.collections.unhide_collection")
                                    : t("pages.collections.hide_collection")}
                            </Action>
                        </div>
                    )}
                </Dropdown.Content>
            </Dropdown>

            <CollectionReportModal
                reportReasons={reportReasons}
                collection={collection}
                isOpen={showReportModal}
                onSaveReport={() => {
                    setShowReportModal(false);
                    onReportCollection?.(collection.address);
                }}
                onClose={() => {
                    setShowReportModal(false);
                }}
            />
        </div>
    );
};
