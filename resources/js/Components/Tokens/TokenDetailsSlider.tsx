import { Tab } from "@headlessui/react";
import { Fragment } from "react";
import { useTranslation } from "react-i18next";

import { TokenTransactions } from "./TokenTransactions/TokenTransactions";
import { Slider } from "@/Components/Slider";
import { Tabs } from "@/Components/Tabs";
import { TokenBalance } from "@/Components/Tokens/TokenBalance";
import { TokenLogo } from "@/Components/Tokens/TokenLogo";
import { TokenMarketData } from "@/Components/Tokens/TokenMarketData";

interface Properties {
    asset?: App.Data.TokenListItemData;
    open: boolean;
    onClose: () => void;
    user: App.Data.UserData;
    onSend?: (asset: App.Data.TokenListItemData) => void;
    onReceive?: (asset: App.Data.TokenListItemData) => void;
    wallet?: App.Data.Wallet.WalletData | null;
}

export const TokenDetailsSlider = ({
    asset,
    open,
    onClose,
    user,
    wallet,
    onSend,
    onReceive,
}: Properties): JSX.Element => {
    const { t } = useTranslation();

    const renderSliderContent = (): JSX.Element => {
        if (asset == null) {
            return <></>;
        }

        return (
            <>
                <Slider.Header>
                    <div
                        className="flex items-center space-x-3"
                        data-testid="TokenDetailsSlider__header"
                    >
                        <TokenLogo
                            tokenName={asset.name}
                            imgSource={asset.logo_url}
                            className="h-8 w-8"
                        />

                        <div className="flex items-center space-x-2 text-lg font-medium">
                            <span className="text-theme-secondary-900">{asset.symbol}</span>

                            <span className="text-theme-secondary-500">{asset.name}</span>
                        </div>
                    </div>
                </Slider.Header>

                <Slider.Content includePadding={false}>
                    <>
                        <TokenBalance
                            currency={user.attributes.currency}
                            asset={asset}
                            onSend={() => onSend?.(asset)}
                            onReceive={() => onReceive?.(asset)}
                        />

                        <div
                            className="border-t border-theme-secondary-300 p-6 sm:px-8 sm:pt-5"
                            data-testid="TokenDetailsSlider__content"
                        >
                            <Tab.Group>
                                <Tab.List>
                                    <Tabs className="space-x-1">
                                        <Tab as={Fragment}>
                                            {({ selected }) => (
                                                <Tabs.Button selected={selected}>
                                                    <span data-testid="TokenDetailsSlider__tab1">
                                                        <span className="hidden xs:block">
                                                            {t("pages.token_panel.tabs.transaction_history")}
                                                        </span>
                                                        <span className="block xs:hidden">
                                                            {t("pages.token_panel.tabs.history")}
                                                        </span>
                                                    </span>
                                                </Tabs.Button>
                                            )}
                                        </Tab>

                                        <Tab as={Fragment}>
                                            {({ selected }) => (
                                                <Tabs.Button selected={selected}>
                                                    <span data-testid="TokenDetailsSlider__tab2">
                                                        {t("pages.token_panel.tabs.market_data")}
                                                    </span>
                                                </Tabs.Button>
                                            )}
                                        </Tab>
                                    </Tabs>
                                </Tab.List>

                                <Tab.Panels>
                                    <Tab.Panel>
                                        <div className="mt-4">
                                            <TokenTransactions
                                                asset={asset}
                                                user={user}
                                                wallet={wallet}
                                            />
                                        </div>
                                    </Tab.Panel>

                                    <Tab.Panel>
                                        <TokenMarketData
                                            className="mt-6 sm:mt-4"
                                            token={asset}
                                        />
                                    </Tab.Panel>
                                </Tab.Panels>
                            </Tab.Group>
                        </div>
                    </>
                </Slider.Content>
            </>
        );
    };

    return (
        <Slider
            data-testid="TokenDetailsSlider"
            isOpen={open}
            onClose={onClose}
        >
            {renderSliderContent()}
        </Slider>
    );
};
