import { useTranslation } from "react-i18next";
import { AssetAvatar } from "./SelectAsset.blocks";
import { InputGroup } from "@/Components/Form/InputGroup";
import { Listbox } from "@/Components/Form/Listbox";
import { SearchAssets } from "@/Components/TransactionFormSlider/Components/SearchAssets";
import { formatFiat } from "@/Utils/Currency";
import { isTruthy } from "@/Utils/is-truthy";

interface Properties {
    balance: string;
    currency: string;
    assets: App.Data.TokenListItemData[];
    onSelectAsset?: (asset: App.Data.TokenListItemData) => void;
    onAmountChange?: (amount: string) => void;
    onSelectMaxAmount?: () => void;
    error?: string;
    asset?: App.Data.TokenListItemData;
    amount?: number | string;
    after?: React.ReactElement;
}

export const SelectAsset = ({
    assets,
    balance,
    currency,
    onSelectAsset,
    asset,
    error,
    after,
}: Properties): JSX.Element => {
    const { t } = useTranslation();

    return (
        <>
            <InputGroup
                label={t("pages.send_receive_panel.send.labels.token_and_amount")}
                error={error}
                hint={[
                    isTruthy(asset)
                        ? ` ${asset.symbol} ~ ${formatFiat({
                              t,
                              value: asset.token_price ?? "0",
                              currency,
                              maxDecimals: 3,
                          })}`
                        : t("pages.send_receive_panel.send.hints.token_price"),
                    isTruthy(asset) ? `${t("common.balance")}: ${balance}` : t("common.balance"),
                ]}
            >
                <Listbox
                    data-testid="TransactionSendForm_Token_Amount_Select"
                    variant={asset === undefined ? "primary" : undefined}
                    label={asset?.symbol}
                    placeholder={t("common.select")}
                    className="z-20"
                    onChange={onSelectAsset}
                    buttonClassName="sm:max-w-[160px]"
                    optionsClassName="max-h-96 top-12 pt-1 rounded-none sm:rounded-xl mt-px sm:mt-1"
                    optionsAs="div"
                    avatar={<AssetAvatar asset={asset} />}
                    after={after}
                >
                    <div className="sm:w-52">
                        <SearchAssets
                            asset={asset}
                            assets={assets}
                        />
                    </div>
                </Listbox>
            </InputGroup>
        </>
    );
};
