import { useTranslation } from "react-i18next";
import { Clipboard } from "@/Components/Clipboard";
import { Icon } from "@/Components/Icon";
import { Link } from "@/Components/Link";
import { NetworkIcon } from "@/Components/Networks/NetworkIcon";
import { Skeleton } from "@/Components/Skeleton";
import { Slider } from "@/Components/Slider";
import { SliderFormActionsToolbar } from "@/Components/SliderFormActionsToolbar";
import { DetailItem } from "@/Components/Tokens/TokenDetails";
import { AddressingOverview } from "@/Components/TransactionFormSlider";
import { extractTokenPriceData } from "@/Components/TransactionFormSlider/Steps/ExecutionStep.blocks";
import {
    TransactionStatusConfirmed,
    TransactionStatusError,
    TransactionStatusPending,
} from "@/Components/TransactionStatuses";
import { useNativeToken } from "@/Hooks/useNativeToken";
import { useNetworks } from "@/Hooks/useNetworks";
import { convertToFiat } from "@/Utils/convert-currency";
import { FormatCrypto, FormatFiat } from "@/Utils/Currency";
import { toHuman } from "@/Utils/dates";
import { isTruthy } from "@/Utils/is-truthy";
import { TruncateMiddle } from "@/Utils/TruncateMiddle";

export const TokenTransactionDetailsSlider = ({
    user,
    transaction,
    asset,
    isOpen,
    onClose,
}: {
    user: App.Data.UserData;
    transaction?: App.Data.TransactionData;
    asset: App.Data.TokenListItemData;
    isOpen?: boolean;
    onClose: () => void;
}): JSX.Element => {
    const { t } = useTranslation();

    const { getExplorerUrlsKeyByChainId } = useNetworks();

    const transactionHashUrl = t(`urls.explorers.${getExplorerUrlsKeyByChainId(asset.chain_id)}.transactions`, {
        id: transaction?.hash,
    });

    const token: Pick<App.Data.Token.TokenData, "symbol" | "name" | "decimals"> = {
        name: asset.name,
        symbol: asset.symbol,
        decimals: asset.decimals,
    };

    const userCurrency = user.attributes.currency;

    const nativeTokenData = useNativeToken({ asset });

    let feeInFiat = null;
    let nativeToken = null;

    if (isTruthy(nativeTokenData) && isTruthy(transaction)) {
        nativeToken = nativeTokenData.token;

        const { guid, price } = nativeTokenData.tokenPrice;

        const nativeTokenPrice = extractTokenPriceData({ [guid]: price }, userCurrency, guid);
        feeInFiat = convertToFiat(transaction.fee, nativeTokenPrice.price, nativeToken.decimals).toString();
    }

    return (
        <Slider
            data-testid="TransactionFormSlider"
            isOpen={Boolean(isOpen)}
            onClose={onClose}
            panelClassName="translate-x-0"
        >
            <Slider.Header>
                <div
                    className="flex items-center space-x-3"
                    data-testid="TokenTransactionDetailsSlider__header"
                >
                    <div className="flex items-center space-x-2 text-lg font-medium">
                        <span className="text-theme-secondary-900">{t("pages.transaction_details_panel.title")}</span>
                    </div>
                </div>
            </Slider.Header>

            {transaction !== undefined && (
                <Slider.Content>
                    <div data-testid="TokenTransactionDetailsSlider__content">
                        <AddressingOverview
                            fromAddress={transaction.from}
                            toAddress={transaction.to}
                        />

                        {/* Amount Fiat/Crypto */}
                        <div className="mt-3 flex justify-between rounded-xl border border-theme-secondary-300 bg-theme-secondary-50 px-6 py-4">
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-theme-secondary-500">
                                    <span>{t("common.amount")} </span>
                                    <FormatFiat
                                        value={convertToFiat(
                                            transaction.amount,
                                            Number(asset.token_price),
                                            asset.decimals,
                                        ).toString()}
                                        currency={userCurrency}
                                    />
                                </span>
                                <span className="font-medium text-theme-secondary-900">
                                    <FormatCrypto
                                        value={transaction.amount}
                                        token={token}
                                    />
                                </span>
                            </div>
                            <NetworkIcon
                                networkId={asset.chain_id}
                                iconSize="xl"
                            />
                        </div>

                        {/* Transaction Status */}
                        <div className="mt-6">
                            {!transaction.isPending && !transaction.isErrored && <TransactionStatusConfirmed />}
                            {transaction.isPending && <TransactionStatusPending />}
                            {transaction.isErrored && (
                                <TransactionStatusError
                                    chainId={asset.chain_id}
                                    hash={transaction.hash}
                                />
                            )}
                        </div>

                        {/* General Data */}
                        <dl className="mt-6 space-y-4">
                            <DetailItem title={t("pages.transaction_details_panel.details.blockchain")}>
                                <NetworkIcon
                                    networkId={asset.chain_id}
                                    withoutTooltip
                                />
                            </DetailItem>

                            <DetailItem title={t("pages.transaction_details_panel.details.timestamp")}>
                                {toHuman(transaction.timestamp * 1000, user.attributes)}
                            </DetailItem>

                            <DetailItem title={t("pages.transaction_details_panel.details.transaction_hash")}>
                                <div className="flex items-center space-x-2">
                                    <span className="flex items-center whitespace-nowrap">
                                        <Link
                                            href={transactionHashUrl}
                                            className="outline-offset-3 transition-default flex items-center space-x-2 whitespace-nowrap rounded-full text-theme-hint-600 underline decoration-transparent underline-offset-2 outline-none outline-3 hover:text-theme-hint-700 hover:decoration-theme-hint-700 focus-visible:outline-theme-hint-300"
                                            external
                                        >
                                            <TruncateMiddle
                                                length={12}
                                                text={transaction.hash}
                                            />
                                        </Link>
                                    </span>
                                    <Clipboard
                                        tooltipTitle={t("common.copy")}
                                        text={transaction.hash}
                                    >
                                        <Icon
                                            name="Copy"
                                            size="md"
                                            className="cursor-pointer text-theme-hint-600"
                                        />
                                    </Clipboard>
                                </div>
                            </DetailItem>

                            <DetailItem title={t("pages.transaction_details_panel.details.transaction_fee")}>
                                {nativeToken !== null && feeInFiat !== null ? (
                                    <>
                                        <span>
                                            <FormatCrypto
                                                value={transaction.fee}
                                                token={nativeToken}
                                            />
                                        </span>
                                        <span className="ml-1 text-theme-secondary-700">
                                            (
                                            <FormatFiat
                                                value={feeInFiat}
                                                currency={userCurrency}
                                            />
                                            )
                                        </span>
                                    </>
                                ) : (
                                    <span
                                        className="inline-flex"
                                        data-testid="DetailsSlider__Skeleton"
                                    >
                                        <Skeleton
                                            width={160}
                                            height={21}
                                        />
                                    </span>
                                )}
                            </DetailItem>

                            <DetailItem title={t("pages.transaction_details_panel.details.gas_price")}>
                                {transaction.gasPrice}
                            </DetailItem>

                            <DetailItem title={t("pages.transaction_details_panel.details.gas_used")}>
                                {transaction.gasUsed}
                            </DetailItem>

                            <DetailItem title={t("pages.transaction_details_panel.details.nonce")}>
                                {transaction.nonce}
                            </DetailItem>
                        </dl>
                    </div>
                </Slider.Content>
            )}

            <SliderFormActionsToolbar
                onCancel={onClose}
                hasSave={false}
                cancelButtonLabel={t("common.back")}
            />
        </Slider>
    );
};
