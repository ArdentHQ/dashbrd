import { Tab } from "@headlessui/react";
import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { NetworkIcon } from "@/Components/Networks/NetworkIcon";
import { Tabs } from "@/Components/Tabs";

export interface ChainFiltersProperties {
    chain: ChainFilter | undefined;
    setChain: (chain: ChainFilter | undefined) => void;
}

export enum ChainFilter {
    polygon = "polygon",
    ethereum = "ethereum",
}

export const ChainFilters = ({ chain, setChain }: ChainFiltersProperties): JSX.Element => {
    const { t } = useTranslation();

    return (
        <Tab.Group as="div">
            <Tab.List>
                <Tabs widthClassName="w-full md-lg:w-auto">
                    <Tab as={Fragment}>
                        <Tabs.Button
                            className="sm:grow md-lg:grow-0"
                            selected={chain === undefined}
                            onClick={() => {
                                setChain(undefined);
                            }}
                        >
                            {t("common.all_chains")}
                        </Tabs.Button>
                    </Tab>

                    <Tab as={Fragment}>
                        <Tabs.Button
                            className="sm:grow md-lg:grow-0"
                            selected={chain === ChainFilter.polygon}
                            onClick={() => {
                                setChain(ChainFilter.polygon);
                            }}
                        >
                            <NetworkIcon
                                networkId={137}
                                simpleIcon={true}
                                iconSize="sm-md"
                            />
                        </Tabs.Button>
                    </Tab>

                    <Tab as={Fragment}>
                        <Tabs.Button
                            className="sm:grow md-lg:grow-0"
                            selected={chain === ChainFilter.ethereum}
                            onClick={() => {
                                setChain(ChainFilter.ethereum);
                            }}
                        >
                            <NetworkIcon
                                networkId={1}
                                simpleIcon={true}
                                iconSize="sm-md"
                            />
                        </Tabs.Button>
                    </Tab>
                </Tabs>
            </Tab.List>
        </Tab.Group>
    );
};
