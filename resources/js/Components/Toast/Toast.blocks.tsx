import cn from "classnames";
import { type MouseEventHandler } from "react";

import { useTranslation } from "react-i18next";
import { type ToastType } from "./Toast.contracts";
import { Icon } from "@/Components/Icon";

export const ToastCloseButton = ({
    type,
    onClick,
}: {
    type: ToastType;
    onClick: MouseEventHandler<HTMLButtonElement>;
}): JSX.Element => {
    const { t } = useTranslation();

    return (
        <button
            data-testid="CloseButton"
            type="button"
            onClick={onClick}
            className={cn("transition-default px-5", {
                "hover:bg-theme-secondary-300 hover:text-theme-secondary-800 dark:hover:bg-theme-dark-700 dark:hover:text-theme-dark-50":
                    type === "pending",
                "hover:bg-theme-success-200 hover:text-theme-success-800 dark:hover:bg-theme-success-600 dark:hover:text-white":
                    type === "success",
                "hover:bg-theme-warning-200 hover:text-theme-warning-900 dark:hover:bg-theme-warning-800 dark:hover:text-white":
                    type === "warning",
                "hover:bg-theme-danger-200 hover:text-theme-danger-800 dark:hover:bg-theme-danger-300 dark:hover:text-white":
                    type === "error",
                "hover:bg-theme-primary-200 hover:text-theme-primary-800 dark:hover:bg-theme-primary-700 dark:hover:text-white":
                    type === "info",
            })}
        >
            <span className="sr-only">{t("common.close_toast")}</span>

            <Icon
                name="X"
                dimensions={{
                    width: 12,
                    height: 12,
                }}
            />
        </button>
    );
};

export const ToastLoadingIcon = (): JSX.Element => {
    const { t } = useTranslation();

    return (
        <div
            className="flex items-center pr-4"
            data-testid="LoadingIcon"
        >
            <Icon
                name="Spinner"
                size="lg"
                className="animate-spin"
            />
            <span className="sr-only">{t("common.loading")}</span>
        </div>
    );
};
