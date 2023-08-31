import cn from "classnames";
import { useBreakpoint } from "@/Hooks/useBreakpoint";
import { FormatCrypto, FormatFiat, FormatFiatShort } from "@/Utils/Currency";
import { isTruthy } from "@/Utils/is-truthy";

interface Properties {
    convertedValue?: string;
    value: string;
    token: App.Data.Token.TokenData | Pick<App.Data.Token.TokenData, "symbol" | "name" | "decimals">;
    variant?: "list" | "grid";
    user?: App.Data.UserData;
}

export const CollectionPortfolioValue = ({
    value,
    convertedValue,
    token,
    variant = "list",
    user,
}: Properties): JSX.Element => {
    const { isSmAndAbove } = useBreakpoint();

    return (
        <div
            data-testid="CollectionPortfolioValue"
            className={cn("flex flex-col items-end space-y-0.5 whitespace-nowrap font-medium", {
                "justify-end": variant === "list",
            })}
        >
            <div
                className="text-sm leading-5.5 text-theme-secondary-900 md:text-base md:leading-6"
                data-testid="CollectionPortfolioValue__crypto"
            >
                <FormatCrypto
                    value={value}
                    token={token}
                />
            </div>

            {variant === "list" && (
                <div
                    className="text-xs leading-4.5 text-theme-secondary-500 md:text-sm md:leading-5.5"
                    data-testid="CollectionPortfolioValue__fiat"
                >
                    {isTruthy(convertedValue) && (
                        <>
                            {isSmAndAbove ? (
                                <FormatFiat
                                    user={user}
                                    value={convertedValue}
                                />
                            ) : (
                                <FormatFiatShort
                                    user={user}
                                    value={convertedValue}
                                />
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};
