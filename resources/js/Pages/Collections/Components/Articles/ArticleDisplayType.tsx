import { Tab } from "@headlessui/react";
import { Fragment } from "react";
import { Tabs } from "@/Components/Tabs";

interface Properties {
    displayType: DisplayType;
    disabled?: boolean;
    onSelectDisplayType?: (type: DisplayType) => void;
}

export enum DisplayType {
    List = "list",
    Grid = "grid",
}

export const ArticleDisplayType = ({ displayType, disabled, onSelectDisplayType }: Properties): JSX.Element => (
    <Tab.Group
        as="div"
        defaultIndex={0}
    >
        <Tab.List>
            <Tabs>
                <Tab as={Fragment}>
                    <Tabs.Button
                        icon="Bars"
                        selected={displayType === DisplayType.List}
                        disabled={disabled}
                        onClick={() => onSelectDisplayType?.(DisplayType.List)}
                    />
                </Tab>

                <Tab as={Fragment}>
                    <Tabs.Button
                        icon="GridDots"
                        selected={displayType === DisplayType.Grid}
                        disabled={disabled}
                        onClick={() => onSelectDisplayType?.(DisplayType.Grid)}
                    />
                </Tab>
            </Tabs>
        </Tab.List>
    </Tab.Group>
);
