import cn from "classnames";
import { type HTMLAttributes } from "react";
import { useTranslation } from "react-i18next";
import { IconButton } from "@/Components/Buttons/IconButton";
import { Tooltip } from "@/Components/Tooltip";

interface Properties extends HTMLAttributes<HTMLDivElement> {
    onSend?: () => void;
    onReceive?: () => void;
    balance?: string;
}

export const TokenActions = ({ className, balance, onSend, onReceive, ...properties }: Properties): JSX.Element => {
    const { t } = useTranslation();

    const sendingDisabled = Number(balance ?? 0) === 0;

    return (
        <div
            className={cn("flex flex-shrink-0 items-center justify-end space-x-3", className)}
            {...properties}
        >
            <Tooltip
                zIndex={50}
                content={sendingDisabled ? t("pages.token_panel.insufficient_funds") : t("common.send")}
                disableOnTouch={!sendingDisabled}
            >
                <span
                    tabIndex={-1}
                    data-testid="TokenActions__send"
                >
                    <IconButton
                        disabled={sendingDisabled}
                        variant="primary"
                        icon="FatArrowUp"
                        aria-label={t("common.send")}
                        onClick={() => {
                            onSend?.();
                        }}
                    />
                </span>
            </Tooltip>

            <Tooltip
                zIndex={50}
                content={t("common.receive")}
                disableOnTouch
            >
                <span
                    tabIndex={-1}
                    data-testid="TokenActions__receive"
                >
                    <IconButton
                        icon="FatArrowDown"
                        aria-label={t("common.receive")}
                        onClick={() => {
                            onReceive?.();
                        }}
                    />
                </span>
            </Tooltip>
        </div>
    );
};
