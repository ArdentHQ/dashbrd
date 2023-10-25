import { type ethers } from "ethers";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Clipboard } from "@/Components/Clipboard";
import { Icon } from "@/Components/Icon";
import { Link } from "@/Components/Link";
import { NetworkIcon } from "@/Components/Networks/NetworkIcon";
import { Skeleton } from "@/Components/Skeleton";
import { SliderFormActionsToolbar } from "@/Components/SliderFormActionsToolbar";
import { DetailItem } from "@/Components/Tokens/TokenDetails";
import { AddressingOverview, TransactionBreakdown } from "@/Components/TransactionFormSlider";
import { type TransactionIntent } from "@/Components/TransactionFormSlider";
import {
    TransactionStatusConfirmed,
    TransactionStatusError,
    TransactionStatusPending,
} from "@/Components/TransactionStatuses";
import { useMetaMaskContext } from "@/Contexts/MetaMaskContext";
import { useNetworks } from "@/Hooks/useNetworks";
import { toHuman } from "@/Utils/dates";
import { isTruthy } from "@/Utils/is-truthy";
import { TruncateMiddle } from "@/Utils/TruncateMiddle";

export const ResultStep = ({
    onClose,
    transactionIntent,
    user,
}: {
    onClose: () => void;
    transactionIntent: Required<TransactionIntent>;
    user: App.Data.UserData;
}): JSX.Element => {
    const { t } = useTranslation();

    const { getTransactionReceipt, getBlock, account } = useMetaMaskContext();

    const [receipt, setReceipt] = useState<ethers.providers.TransactionReceipt>();
    const [receiptError, setReceiptError] = useState<string>();

    const [block, setBlock] = useState<ethers.providers.Block>();
    const [blockError, setBlockError] = useState<string>();

    const { hash, recipient, asset } = transactionIntent;

    const blockHash = receipt?.blockHash;

    const { getExplorerUrlsKeyByChainId } = useNetworks();

    const explorerUrlsKey = getExplorerUrlsKeyByChainId(asset.chain_id);

    const hasError = isTruthy(blockError) || isTruthy(receiptError);
    const hasTransactionData = isTruthy(block) && isTruthy(receipt);

    useEffect(() => {
        const getReceipt = async (): Promise<void> => {
            const result = await getTransactionReceipt(hash);

            if (isTruthy(result.data)) {
                setReceipt(result.data);
                return;
            }

            setReceiptError(result.errorMessage);
        };

        void getReceipt();
    }, [hash]);

    useEffect(() => {
        if (blockHash === undefined || receipt?.status !== 1) return;
        const fetchBlock = async (): Promise<void> => {
            const result = await getBlock(blockHash);

            if (isTruthy(result.data)) {
                setBlock(result.data);
                return;
            }

            setBlockError(result.errorMessage);
        };

        void fetchBlock();
    }, [blockHash, receipt?.status]);

    return (
        <div data-testid="Transaction__ResultStep">
            <div data-testid="TokenTransactionDetailsSlider__content">
                <AddressingOverview
                    fromAddress={account}
                    toAddress={recipient}
                />

                <TransactionBreakdown
                    transactionIntent={transactionIntent}
                    userCurrency={user.attributes.currency}
                />

                {/* Transaction Status */}
                <div className="mt-6">
                    {isTruthy(block) && <TransactionStatusConfirmed />}
                    {!hasError && !hasTransactionData && <TransactionStatusPending />}
                    {(hasError || receipt?.status === 0) && (
                        <TransactionStatusError
                            chainId={asset.chain_id}
                            hash={hash}
                        />
                    )}
                </div>

                {/* General Data */}
                <dl className="mb-18 mt-6 space-y-4">
                    <DetailItem title={t("pages.transaction_details_panel.details.blockchain")}>
                        <NetworkIcon
                            networkId={asset.chain_id}
                            withoutTooltip
                        />
                    </DetailItem>

                    <DetailItem title={t("pages.transaction_details_panel.details.timestamp")}>
                        {block !== undefined ? (
                            <span data-testid="ResultStep_TimestampValue">
                                {toHuman(block.timestamp * 1000, user.attributes)}
                            </span>
                        ) : (
                            <div data-testid="ResultStep_TimestampSkeleton">
                                <Skeleton
                                    width={160}
                                    height={24}
                                />
                            </div>
                        )}
                    </DetailItem>

                    {isTruthy(explorerUrlsKey) && (
                        <DetailItem title={t("pages.transaction_details_panel.details.transaction_hash")}>
                            <div className="flex items-center space-x-2">
                                <span className="flex items-center whitespace-nowrap">
                                    <Link
                                        href={t(`urls.explorers.${explorerUrlsKey}.transactions`, {
                                            id: hash,
                                        })}
                                        className="outline-offset-3 transition-default flex items-center space-x-2 whitespace-nowrap rounded-full text-theme-primary-600 underline decoration-transparent underline-offset-2 outline-none outline-3 hover:text-theme-primary-700 hover:decoration-theme-primary-700 focus-visible:outline-theme-primary-300 dark:text-theme-primary-400 dark:hover:text-theme-primary-500 dark:hover:decoration-theme-primary-500"
                                        external
                                    >
                                        <TruncateMiddle
                                            length={12}
                                            text={hash}
                                        />
                                    </Link>
                                </span>

                                <Clipboard
                                    tooltipTitle={t("common.copy")}
                                    text={hash}
                                >
                                    <Icon
                                        name="Copy"
                                        size="md"
                                        className="cursor-pointer text-theme-primary-600 dark:text-theme-primary-400"
                                    />
                                </Clipboard>
                            </div>
                        </DetailItem>
                    )}
                </dl>
            </div>
            <SliderFormActionsToolbar
                onCancel={onClose}
                hasSave={false}
                cancelButtonLabel={t("common.close")}
            />
        </div>
    );
};
