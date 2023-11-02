import cn from "classnames";
import { PriceChange } from "@/Components/PriceChange/PriceChange";
import { FormatCrypto, FormatFiat } from "@/Utils/Currency";
import { isTruthy } from "@/Utils/is-truthy";

interface Properties {
    collection: App.Data.Collections.CollectionData;
    fiatValue?: number | null;
    token: App.Data.Token.TokenData | Pick<App.Data.Token.TokenData, "symbol" | "name" | "decimals">;
    user?: App.Data.UserData;
    percentageChange?: number;
    variant?: "list" | "grid";
}

export const CollectionFloorPrice = ({
    collection,
    fiatValue,
    percentageChange,
    token,
    user,
    variant = "list",
}: Properties): JSX.Element => (
    <div
        data-testid="CollectionFloorPrice"
        className="inline-block"
    >
        <div
            className={cn("flex flex-col space-y-0.5 whitespace-nowrap font-medium", {
                "items-end": variant === "list",
            })}
        >
            <div
                data-testid="CollectionFloorPrice__crypto"
                className={cn("text-sm leading-5.5 md:text-base md:leading-6", {
                    "text-theme-secondary-700 dark:text-theme-dark-200": variant === "list",
                    "dark:text-theme-dark-50": variant === "grid",
                })}
            >
                <FormatCrypto
                    value={collection.floorPrice ?? "0"}
                    token={token}
                />
            </div>

            {variant === "list" && (
                <div className="text-sm text-theme-secondary-500 dark:text-theme-dark-300">
                    {fiatValue != null && isTruthy(user) && (
                        <span data-testid="CollectionFloorPrice__fiat">
                            <FormatFiat
                                user={user}
                                value={fiatValue.toString()}
                            />
                        </span>
                    )}

                    {!isTruthy(fiatValue) && isTruthy(percentageChange) && (
                        <span data-testid="CollectionFloorPrice__price-change">
                            <PriceChange change={percentageChange} />
                        </span>
                    )}
                </div>
            )}
        </div>
    </div>
);
