import { Link as InertiaLink } from "@inertiajs/react";
import cn from "classnames";
import { type MouseEvent, useMemo } from "react";
import { Icon } from "@/Components/Icon";
import { useExternalLinkContext } from "@/Contexts/ExternalLinkContext";

interface ClassNameProperties {
    className?: string;
    fontSize?: string;
    textColor?: string;
    variant?: "link";
    disabled?: boolean;
    useAnchorTag?: boolean;
}

interface Properties extends ClassNameProperties {
    external?: boolean;
    href: string;
    children: React.ReactNode;
    "data-testid"?: string;
    showExternalIcon?: boolean;
    confirmBeforeProceeding?: boolean;
    iconClassName?: string;
}

interface LinkButtonProperties extends Omit<Properties, "href"> {
    onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
}

const variantClassName = ({
    variant,
    className,
    fontSize,
    textColor,
    disabled,
}: ClassNameProperties): string | undefined =>
    useMemo<string | undefined>(() => {
        if (variant === "link") {
            const linkClass = cn(
                "transition-default rounded-full font-medium leading-5.5",
                "underline decoration-transparent underline-offset-2",
                "outline-none outline-3 outline-offset-4",
                {
                    "cursor-not-allowed text-theme-secondary-500": disabled === true,
                    "hover:text-theme-primary-700 hover:decoration-theme-primary-700 focus-visible:outline-theme-primary-300":
                        disabled !== true,
                },
                className,
            );

            return cn(linkClass, fontSize ?? "text-sm", textColor ?? "text-theme-secondary-700");
        }

        return className;
    }, [variant, textColor, className]);

const stopPropagationAndBlur = (event: MouseEvent<HTMLElement>): void => {
    event.stopPropagation();
    document.activeElement instanceof HTMLElement && document.activeElement.blur();
};

export const LinkButton = ({
    onClick,
    variant,
    className,
    fontSize,
    textColor,
    ...properties
}: LinkButtonProperties): JSX.Element => (
    <button
        data-testid="Link__button"
        type="button"
        className={variantClassName({ variant, className, fontSize, textColor })}
        onClick={(event: MouseEvent<HTMLButtonElement>) => {
            stopPropagationAndBlur(event);

            onClick?.(event);
        }}
        {...properties}
    />
);

export const Link = ({
    external = false,
    disabled = false,
    useAnchorTag = false,
    variant,
    className,
    fontSize,
    textColor,
    showExternalIcon = true,
    confirmBeforeProceeding = false,
    iconClassName,
    children,
    href,
    ...properties
}: Properties): JSX.Element => {
    const { openConfirmationModal, hasDisabledLinkWarning, isDomainAllowed } = useExternalLinkContext();

    if (external) {
        const handleExternalClick = (event: MouseEvent<HTMLElement>): void => {
            if (confirmBeforeProceeding) {
                if (!hasDisabledLinkWarning && !isDomainAllowed(href)) {
                    event.preventDefault();
                    event.stopPropagation();

                    openConfirmationModal(href);
                }
                return;
            }

            stopPropagationAndBlur(event);
        };

        return (
            <a
                data-testid="Link__anchor"
                href={href}
                target="_blank"
                rel="noreferrer"
                className={variantClassName({ variant, className, fontSize, textColor, disabled })}
                onClick={handleExternalClick}
                {...properties}
            >
                {children}

                {showExternalIcon && (
                    <Icon
                        name="ArrowExternalSmall"
                        size="sm"
                        className={iconClassName ?? "ml-1 text-theme-secondary-500"}
                    />
                )}
            </a>
        );
    }

    if (useAnchorTag) {
        return (
            <a
                href={href}
                className={variantClassName({ variant, className, fontSize, textColor, disabled })}
                {...properties}
                data-testid="Link__anchor"
            >
                {children}
            </a>
        );
    }

    return (
        <InertiaLink
            {...properties}
            href={href}
            disabled={disabled}
            className={variantClassName({ variant, className, fontSize, textColor, disabled })}
        >
            {children}
        </InertiaLink>
    );
};
