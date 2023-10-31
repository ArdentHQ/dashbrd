import cn from "classnames";
import { NetworkIcon } from "@/Components/Networks/NetworkIcon";
import { getInitials } from "@/Utils/get-initials";
import { isTruthy } from "@/Utils/is-truthy";

interface Properties extends React.HTMLAttributes<HTMLDivElement> {
    tokenName: string;
    imgSource: string | null;
    chainId?: App.Enums.Chain;
    isSelected?: boolean;
    networkIconSize?: "sm" | "md" | "xl";
}

export const TokenLogo = ({
    tokenName,
    chainId,
    imgSource,
    className,
    isSelected = false,
    networkIconSize = "md",
    ...properties
}: Properties): JSX.Element => {
    const initials = getInitials(tokenName);

    return (
        <div
            className={cn("relative flex items-center justify-center rounded-full bg-theme-secondary-100", className)}
            {...properties}
        >
            <div className="overflow-auto rounded-full">
                {chainId !== undefined && (
                    <div
                        data-testid="TokenLogo__chain"
                        className={cn(
                            "transition-default absolute bottom-0 right-0 overflow-hidden rounded-full",
                            {
                                "border-theme-primary-100 group-hover:border-theme-primary-100 dark:border-theme-dark-700 dark:group-hover:border-theme-dark-700":
                                    isSelected,
                            },
                            {
                                "border-white group-hover:border-theme-primary-50 dark:border-theme-dark-800 dark:group-hover:border-theme-primary-600":
                                    !isSelected,
                            },
                            { "-m-1.5 border-3": networkIconSize === "sm" },
                            { "-m-3 border-4": networkIconSize === "md" },
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
