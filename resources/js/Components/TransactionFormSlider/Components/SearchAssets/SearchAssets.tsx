import cn from "classnames";
import { type ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import { Listbox } from "@/Components/Form/Listbox";
import { Icon } from "@/Components/Icon";
import { TokenLogo } from "@/Components/Tokens/TokenLogo";
import { useAssets } from "@/Components/TransactionFormSlider/Hooks/useAssets";
import { useNetwork } from "@/Hooks/useNetwork";
import { useToasts } from "@/Hooks/useToasts";
import { isTruthy } from "@/Utils/is-truthy";

const AssetList = ({
    asset,
    assets,
}: {
    asset?: App.Data.TokenListItemData;
    assets: App.Data.TokenListItemData[];
}): JSX.Element => {
    const { isTestnet } = useNetwork();

    return (
        <>
            {assets.map((optionAsset, index) => (
                <Listbox.Option
                    as="span"
                    data-testid="TransactionSendForm_Token_Amount_Option"
                    key={`${index}-${optionAsset.symbol}`}
                    value={optionAsset}
                    isSelected={isTruthy(asset) && asset.symbol === optionAsset.symbol}
                    icon={
                        <TokenLogo
                            tokenName={optionAsset.name}
                            imgSource={optionAsset.logo_url}
                            className={cn("mr-2 h-8 w-8", {
                                "opacity-30 saturate-0": isTestnet(optionAsset.chain_id),
                            })}
                            isSelected={isTruthy(asset) && asset.symbol === optionAsset.symbol}
                            chainId={optionAsset.chain_id}
                        />
                    }
                    classNames={{
                        icon: "h-10",
                        option: "mb-3 last:mb-0 !h-12",
                        iconContainer: "overflow-visible",
                    }}
                >
                    <p>{optionAsset.symbol}</p>
                </Listbox.Option>
            ))}
        </>
    );
};

export const SearchAssets = ({
    assets: initialAssets,
    asset,
}: {
    asset?: App.Data.TokenListItemData;
    assets: App.Data.TokenListItemData[];
}): JSX.Element => {
    const { t } = useTranslation();
    const { showToast } = useToasts();

    const { query, search, assets, isSearching } = useAssets({
        initialAssets: initialAssets.filter((asset) => Number(asset.balance) !== 0).slice(0, 5),
        onSearchError: () => {
            showToast({
                message: t("pages.send_receive_panel.send.search_dropdown.error"),
                type: "error",
            });
        },
    });

    return (
        <>
            <div className="mb-4 flex items-center space-x-2 border-b border-theme-secondary-400 px-6 pb-1">
                <input
                    onKeyDown={(event) => {
                        if (event.code === "Space") {
                            event.stopPropagation();
                        }
                    }}
                    value={query}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => {
                        search(event.target.value);
                    }}
                    placeholder={t("pages.send_receive_panel.send.search_dropdown.placeholder")}
                    data-testid="InitiationToken__SearchInput"
                    className="flex w-full border-0 text-theme-secondary-900 transition placeholder:text-theme-secondary-500 focus:border-0 focus:outline-none focus:ring-0"
                />
                <Icon
                    name="MagnifyingGlass"
                    size="md"
                    className="flex-shrink-0"
                />
            </div>
            {isSearching && (
                <div className="mt-3.5">
                    <Icon
                        size="xl"
                        name="SpinnerNarrow"
                        className="m-auto animate-spin text-theme-hint-600"
                    />
                </div>
            )}
            {!isSearching && assets.length === 0 && (
                <div className="px-6 pb-2.5 pt-2 text-center">
                    <span className="font-medium text-theme-secondary-700">
                        {t("pages.send_receive_panel.send.search_dropdown.no_results")}
                    </span>
                </div>
            )}
            {!isSearching && (
                <AssetList
                    asset={asset}
                    assets={assets}
                />
            )}
        </>
    );
};
