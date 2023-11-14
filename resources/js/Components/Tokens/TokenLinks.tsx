import cn from "classnames";
import { type HTMLAttributes } from "react";
import { ButtonLink } from "@/Components/Buttons/ButtonLink";
import { type IconName } from "@/Components/Icon";
import { Tooltip } from "@/Components/Tooltip";

interface Properties extends HTMLAttributes<HTMLDivElement> {
    token: App.Data.TokenListItemData;
}

export const TokenLinks = ({ token, className, ...properties }: Properties): JSX.Element => (
    <div
        className={cn(
            "flex items-center space-x-2 pt-3 sm:bg-theme-secondary-50 sm:px-6 sm:py-4 dark:sm:bg-theme-dark-950",
            className,
        )}
        {...properties}
    >
        {token.website_url !== null && (
            <SocialMediaLink
                tooltip="Website"
                testId="website"
                icon="GlobeWithCursor"
                href={token.website_url}
            />
        )}

        <SocialMediaLink
            tooltip="Explorer"
            testId="explorer"
            icon="Explorer"
            href={token.explorer_url}
        />

        {token.twitter_url !== null && (
            <SocialMediaLink
                tooltip="Twitter"
                testId="twitter"
                icon="Twitter"
                href={token.twitter_url}
            />
        )}

        {token.discord_url !== null && (
            <SocialMediaLink
                tooltip="Discord"
                testId="discord"
                icon="Discord"
                href={token.discord_url}
            />
        )}
    </div>
);

const SocialMediaLink = ({
    tooltip,
    icon,
    href,
    testId,
}: {
    tooltip: string;
    icon: IconName;
    href: string;
    testId: string;
}): JSX.Element => (
    <Tooltip content={tooltip}>
        <ButtonLink
            icon={icon}
            href={href}
            target="_blank"
            variant="icon"
            data-testid={`TokenLinks__${testId}`}
            rel="noopener noreferrer"
        />
    </Tooltip>
);
