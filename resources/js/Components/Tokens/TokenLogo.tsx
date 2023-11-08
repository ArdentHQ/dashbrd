import cn from "classnames";
import { NetworkIcon } from "@/Components/Networks/NetworkIcon";
import { getInitials } from "@/Utils/get-initials";
import { isTruthy } from "@/Utils/is-truthy";
import { twMerge } from "tailwind-merge";

interface Properties extends React.HTMLAttributes<HTMLDivElement> {
    tokenName: string;
    imgSource: string | null;
    chainId?: App.Enums.Chain;
    isSelected?: boolean;
    networkIconSize?: "sm" | "md" | "xl";
    badgeClassname?: string;
}

export const TokenLogo = ({
    tokenName,
    chainId,
    imgSource,
    className,
    isSelected = false,
    networkIconSize = "md",
    badgeClassname,
    ...properties
}: Properties): JSX.Element => {
    const initials = getInitials(tokenName);

    const borderClassname = twMerge(
        "dark:border-theme-dark-900 dark:group-hover:border-theme-dark-800",
        badgeClassname,
    );

    return (
        <div
            className={cn(
                "relative flex items-center justify-center rounded-full bg-theme-secondary-100 dark:bg-theme-dark-800",
                className,
            )}
            {...properties}
        >
            <div className="overflow-auto rounded-full">
                {chainId !== undefined && (
                    <div
                        data-testid="TokenLogo__chain"
                        className={cn(
                            "transition-default absolute bottom-0 right-0 overflow-hidden rounded-full",
                            {
                                "border-theme-primary-100 group-hover:border-theme-primary-100 dark:border-theme-primary-600 dark:group-hover:border-theme-primary-600":
                                    isSelected,
                            },
                            {
                                "border-white group-hover:border-theme-primary-50 ": !isSelected,
                            },
                            { "-m-1.5 border-3": networkIconSize === "sm" },
                            { "-m-3 border-4": networkIconSize === "md" },
                            [!isSelected && borderClassname],
                        )}
                    >
                        <NetworkIcon
                            networkId={chainId}
                            iconSize={networkIconSize}
                        />
                    </div>
                )}

                {!isTruthy(imgSource) && (
                    <span className="truncate text-xs font-bold uppercase text-theme-secondary-500">{initials}</span>
                )}

                {isTruthy(imgSource) && (
                    <img
                        src={imgSource}
                        alt={initials}
                    />
                )}
            </div>
        </div>
    );
};
