import { Tab } from "@headlessui/react";
import { Fragment } from "react";
import { Tabs } from "@/Components/Tabs";

interface Properties {
    displayType: DisplayTypes;
    disabled?: boolean;
    onSelectDisplayType?: (type: DisplayTypes) => void;
}

export enum DisplayTypes {
    List = "list",
    Grid = "grid",
}

export const DisplayType = ({ displayType, disabled, onSelectDisplayType }: Properties): JSX.Element => (
    <Tab.Group
        as="div"
        defaultIndex={0}
    >
        <Tab.List>
            <Tabs>
                <Tab as={Fragment}>
                    <Tabs.Button
                        icon="Bars"
                        selected={displayType === DisplayTypes.List}
                        disabled={disabled}
                        onClick={() => onSelectDisplayType?.(DisplayTypes.List)}
                    />
                </Tab>

                <Tab as={Fragment}>
                    <Tabs.Button
                        icon="GridDots"
                        selected={displayType === DisplayTypes.Grid}
                        disabled={disabled}
                        onClick={() => onSelectDisplayType?.(DisplayTypes.Grid)}
                    />
                </Tab>
            </Tabs>
        </Tab.List>
    </Tab.Group>
);
