import { Tab } from "@headlessui/react";
import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { NetworkIcon } from "@/Components/Networks/NetworkIcon";
import { Tabs } from "@/Components/Tabs";

interface Properties {
    chain?: ChainFilter;
    setChain: (chain?: ChainFilter) => void;
}

export enum ChainFilter {
    polygon = "polygon",
    ethereum = "ethereum",
}

export const ChainFilters = ({ chain, setChain }: Properties): JSX.Element => {
    const { t } = useTranslation();

    return (
        <Tab.Group as="div">
            <Tab.List>
                <Tabs>
                    <Tab as={Fragment}>
                        <Tabs.Button
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
