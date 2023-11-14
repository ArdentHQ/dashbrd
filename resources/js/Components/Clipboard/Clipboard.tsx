import cn from "classnames";
import { type HTMLAttributes, useRef } from "react";
import { useTranslation } from "react-i18next";

import { type Placement, type ReferenceElement } from "tippy.js";
import { Icon } from "@/Components/Icon";
import { Tooltip } from "@/Components/Tooltip";
import { useBreakpoint } from "@/Hooks/useBreakpoint";
import { useClipboard } from "@/Hooks/useClipboard";

export interface ClipboardProperties extends HTMLAttributes<HTMLDivElement> {
    text: string;
    tooltipTitle?: React.ReactNode;
    copiedIconClass?: string;
    copiedIcon?: React.ReactNode;
    zIndex?: number;
    tooltipPlacement?: Placement;
}

export const Clipboard = ({
    text,
    children,
    className,
    tooltipTitle,
    copiedIconClass,
    copiedIcon,
    zIndex,
    tooltipPlacement,
}: ClipboardProperties): JSX.Element => {
    const { t } = useTranslation();
    const reference = useRef<(ReferenceElement & HTMLDivElement) | null>(null);

    const { isCopied, copy } = useClipboard({
        reference,
        resetAfter: 1000,
    });

    const { isLgAndAbove } = useBreakpoint();

    const title = tooltipTitle ?? t("common.copy_clipboard");

    return (
        <Tooltip
            content={isCopied ? t("common.copied") : title}
            hideOnClick={false}
            trigger={!isLgAndAbove ? "click" : "mouseenter focus"}
            hideAfter={!isLgAndAbove ? 1000 : undefined}
            zIndex={zIndex}
            placement={tooltipPlacement}
            touch
        >
            <div
                ref={reference}
                onClick={() => {
                    void copy(text);
                }}
                className={cn("flex items-center transition", className)}
                data-testid="Clipboard"
            >
                <div
                    className={cn("transition-default absolute cursor-pointer", {
                        "opacity-100": isCopied,
                        "opacity-0": !isCopied,
                    })}
                    data-testid="Clipboard__CopiedIconContainer"
                >
                    {copiedIcon !== undefined ? (
                        copiedIcon
                    ) : (
                        <div
                            data-testid="Clipboard__CopiedIcon"
                            className={copiedIconClass ?? ""}
                        >
                            <Icon name="DoubleCheck" />
                        </div>
                    )}
                </div>
                <div
                    className={cn("transition-default grid cursor-pointer", {
                        "z-10 opacity-100": !isCopied,
                        "opacity-0": isCopied,
                    })}
                >
                    {children}
                </div>
            </div>
        </Tooltip>
    );
};

export const ClipboardButton = ({ text, className, zIndex }: ClipboardProperties): JSX.Element => (
    <Clipboard
        text={text}
        className={className}
        zIndex={zIndex}
    >
        <button
            type="button"
            className="transition-default rounded-full outline-none outline-3 outline-offset-8 focus-visible:outline-theme-primary-300"
        >
            <Icon
                className="text-theme-primary-600 transition-colors hover:text-theme-primary-700 dark:text-theme-primary-400 dark:hover:text-theme-primary-500"
                name="Copy"
                size="md"
            />
        </button>
    </Clipboard>
);
