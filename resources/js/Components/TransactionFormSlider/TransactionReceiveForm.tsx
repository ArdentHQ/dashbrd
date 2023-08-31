import { useTranslation } from "react-i18next";
import QRCode from "react-qr-code";
import { Button } from "@/Components/Buttons";
import { Clipboard } from "@/Components/Clipboard";
import { Icon } from "@/Components/Icon";
import { Toast } from "@/Components/Toast";
import { formatAddress } from "@/Utils/format-address";
import { TruncateMiddle } from "@/Utils/TruncateMiddle";

export const TransactionReceiveForm = ({ wallet }: { wallet: App.Data.Wallet.WalletData }): JSX.Element => {
    const { t } = useTranslation();
    const address = formatAddress(wallet.address);

    return (
        <div data-testid="TransactionReceiveForm">
            <div className="rounded-xl border border-theme-secondary-400">
                <div className="flex items-center justify-center p-4">
                    <QRCode value={address} />
                </div>

                <div className="flex items-end justify-between border-t border-theme-secondary-400 p-4">
                    <div>
                        <p className="text-sm font-medium text-theme-secondary-500">{t("common.your_address")}</p>

                        <p className="mt-0.5 hidden font-medium text-theme-secondary-900 sm:block">
                            <TruncateMiddle
                                length={28}
                                text={address}
                            />
                        </p>

                        <p className="mt-0.5 font-medium text-theme-secondary-900 sm:hidden">
                            <TruncateMiddle
                                length={16}
                                text={address}
                            />
                        </p>
                    </div>

                    <div>
                        <Clipboard
                            text={address}
                            copiedIcon={
                                <Button
                                    variant="primary"
                                    className="flex items-center space-x-2"
                                >
                                    <Icon name="DoubleCheck" />
                                    <span>{t("common.copy")}</span>
                                </Button>
                            }
                        >
                            <Button
                                variant="primary"
                                className="flex items-center space-x-2"
                            >
                                <Icon name="Copy" />
                                <span>{t("common.copy")}</span>
                            </Button>
                        </Clipboard>
                    </div>
                </div>
            </div>

            <Toast
                className="mt-4"
                type="warning"
                isExpanded
                message={t("pages.send_receive_panel.receive.alert")}
            />
        </div>
    );
};
