import { Tab } from "@headlessui/react";
import { Fragment } from "react";
import { Tabs } from "@/Components/Tabs";
import { Period } from "@/Components/Tokens/Tokens.contracts";

interface Properties {
    onChange: (index: number) => void;
}

export const TokenPricePeriod = ({ onChange }: Properties): JSX.Element => (
    <Tab.Group onChange={onChange}>
        <Tab.List>
            <Tabs>
                {Object.values(Period).map((item) => (
                    <Tab
                        key={item}
                        as={Fragment}
                    >
                        {({ selected }) => <Tabs.Button selected={selected}>{item}</Tabs.Button>}
                    </Tab>
                ))}
            </Tabs>
        </Tab.List>
    </Tab.Group>
);
