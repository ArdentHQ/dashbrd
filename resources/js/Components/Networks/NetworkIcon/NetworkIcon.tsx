import cn from "classnames";
import { useTranslation } from "react-i18next";
import { Icon } from "@/Components/Icon";
import { Tooltip } from "@/Components/Tooltip";
import { useNetwork } from "@/Hooks/useNetwork";
import { Ethereum, Polygon } from "@/images";

interface Properties {
    networkId: App.Enums.Chain;
    withoutTooltip?: boolean;
    className?: string;
    textClassName?: string;
    iconSize?: "sm" | "md" | "xl" | "sm-md";
    simpleIcon?: boolean;
}

export const NetworkIcon = ({
    networkId,
    withoutTooltip = false,
    className,
    textClassName,
    iconSize = "md",
    simpleIcon = false,
}: Properties): JSX.Element => {
    const { t } = useTranslation();
    const { isPolygon, isEthereum, isTestnet } = useNetwork();

    let iconSizeClass: string;

    switch (iconSize) {
        case "xl":
            iconSizeClass = "w-8 h-8";
            break;
        case "sm":
            iconSizeClass = "w-3.5 h-3.5";
            break;
        case "sm-md":
            iconSizeClass = "w-4 h-4";
            break;
        default:
            iconSizeClass = "w-5 h-5";
            break;
    }

    return (
        <div
            data-testid="NetworkIcon"
            className={cn("flex items-center justify-center", className, {
                grayscale: isTestnet(networkId),
            })}
        >
            {!withoutTooltip && (
                <>
                    {isPolygon(networkId) && (
                        <Tooltip
                            zIndex={50}
                            content={t("common.polygon")}
                        >
                            <div className={iconSizeClass}>
                                {simpleIcon ? <Icon name="Polygon" /> : <Polygon data-testid="Polygon" />}
                            </div>
                        </Tooltip>
                    )}

                    {isEthereum(networkId) && (
                        <Tooltip
                            zIndex={50}
                            content={t("common.ethereum")}
                        >
                            <div className={iconSizeClass}>
                                {simpleIcon ? <Icon name="Ethereum" /> : <Ethereum data-testid="Ethereum" />}
                            </div>
                        </Tooltip>
                    )}
                </>
            )}

            {withoutTooltip && (
                <div className={cn("flex items-center space-x-2", className)}>
                    {isPolygon(networkId) && !isTestnet(networkId) && (
                        <>
                            <Polygon
                                data-testid="Polygon"
                                className={iconSizeClass}
                            />

                            <div
                                data-testid="Polygon__text"
                                className={textClassName}
                            >
                                {t("common.polygon")}
                            </div>
                        </>
                    )}

                    {isPolygon(networkId) && isTestnet(networkId) && (
                        <>
                            <Polygon
                                data-testid="Polygon"
                                className={iconSizeClass}
                            />

                            <div
                                data-testid="Mumbai__text"
                                className={textClassName}
                            >
                                {t("common.mumbai")}
                            </div>
                        </>
                    )}

                    {isEthereum(networkId) && !isTestnet(networkId) && (
                        <>
                            <Ethereum
                                data-testid="Ethereum"
                                className={iconSizeClass}
                            />

                            <div
                                data-testid="Ethereum__text"
                                className={textClassName}
                            >
                                {t("common.ethereum")}
                            </div>
                        </>
                    )}

                    {isEthereum(networkId) && isTestnet(networkId) && (
                        <>
                            <Ethereum
                                data-testid="Ethereum"
                                className={iconSizeClass}
                            />

                            <div
                                data-testid="Goerli__text"
                                className={textClassName}
                            >
                                {t("common.goerli")}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};
