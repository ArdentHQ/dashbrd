import { Link as InertiaLink } from "@inertiajs/react";
import cn from "classnames";
import pick from "lodash/pick";
import React, { forwardRef, type KeyboardEvent } from "react";

import { type ButtonContentProperties, getButtonVariantClass, parseButtonContent } from "@/Components/Buttons/Button";

interface LinkProperties extends React.AnchorHTMLAttributes<HTMLAnchorElement> {}

export type ButtonLinkProperties = React.ComponentProps<typeof InertiaLink> & ButtonContentProperties;

export type ButtonLinkOnClick = (
    event: KeyboardEvent<HTMLAnchorElement> | React.MouseEvent<HTMLAnchorElement, MouseEvent>,
) => void;

export const ButtonLink = forwardRef<HTMLAnchorElement, ButtonLinkProperties>(
    (
        {
            className,
            variant = "primary",
            children,
            icon,
            iconPosition = "left",
            iconClass,
            processing = false,
            iconSize,
            href,
            disabled,
            ...properties
        },
        reference,
    ): JSX.Element => {
        const content = parseButtonContent({ children, icon, iconPosition, iconClass, iconSize });

        const classNames = cn(
            "group",
            getButtonVariantClass(variant),
            {
                "button-with-icon": icon != null && children != null,
                "opacity-25": processing,
                "cursor-not-allowed": disabled,
            },
            className,
        );

        let onClick:
            | undefined
            | ((event: KeyboardEvent<HTMLAnchorElement> | React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void);
        if (disabled === true) {
            onClick = (
                event: KeyboardEvent<HTMLAnchorElement> | React.MouseEvent<HTMLAnchorElement, MouseEvent>,
            ): void => {
                event.preventDefault();
            };
        }

        const isExternal =
            (href.startsWith("http") && !href.startsWith(window.location.origin)) ||
            properties.target !== undefined ||
            href.startsWith("mailto:");

        if (isExternal) {
            // Note: cherry picked the attributes that we currently use, add more as needed
            const anchorAttributes = pick(properties, ["target", "rel", "data-testid"]) as LinkProperties;

            return (
                <a
                    data-testid="ButtonLink--anchor"
                    ref={reference}
                    href={href}
                    className={classNames}
                    {...anchorAttributes}
                >
                    {content}
                </a>
            );
        }

        return (
            <InertiaLink
                data-testid="ButtonLink"
                href={href}
                className={classNames}
                disabled={disabled}
                onClick={onClick}
                {...properties}
            >
                {content}
            </InertiaLink>
        );
    },
);

ButtonLink.displayName = "ButtonLink";
