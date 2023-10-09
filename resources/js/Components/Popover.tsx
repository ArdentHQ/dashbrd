import { Popover as HeadlessPopover, Transition as HeadlessTransition } from "@headlessui/react";
import cn from "classnames";
import { forwardRef, Fragment, type MutableRefObject } from "react";

interface PanelPropertiesBag {
    open: boolean;
    close: (focusableElement?: HTMLElement | MutableRefObject<HTMLElement | null>) => void;
}

interface PanelProperties extends Omit<React.HTMLAttributes<HTMLDivElement>, "className" | "children"> {
    className?: string;
    children?: React.ReactNode | ((bag: PanelPropertiesBag) => React.ReactElement);
    focus?: boolean;
    baseClassName?: string;
}

const Panel = forwardRef<HTMLDivElement, PanelProperties>(
    (
        { className, baseClassName = "rounded-3xl bg-white shadow-3xl dark:bg-theme-dark-900", ...properties }: PanelProperties,
        reference,
    ): JSX.Element => (
        <HeadlessPopover.Panel
            {...properties}
            ref={reference}
            className={() => cn(className, baseClassName)}
        />
    ),
);

Panel.displayName = "Panel";

interface TransitionProperties {
    show?: boolean;
    appear?: boolean;
    children: React.ReactElement;
    as?: React.ElementType;
}

const Transition = (properties: TransitionProperties): JSX.Element => (
    <HeadlessTransition
        as={Fragment}
        enter="transition duration-100 ease-out"
        enterFrom="transform scale-95 opacity-0"
        enterTo="transform scale-100 opacity-100"
        leave="transition duration-75 ease-out"
        leaveFrom="transform scale-100 opacity-100"
        leaveTo="transform scale-95 opacity-0"
        {...properties}
    />
);

interface PopoverProperties extends Omit<React.HTMLAttributes<HTMLDivElement>, "className" | "children"> {
    className?: string | ((bag: PanelPropertiesBag) => string);
    children?: React.ReactElement | ((bag: PanelPropertiesBag) => React.ReactElement);
}

const PopoverRoot = ({ ...properties }: PopoverProperties): JSX.Element => <HeadlessPopover {...properties} />;

export const Popover = Object.assign(PopoverRoot, {
    Button: HeadlessPopover.Button,
    Overlay: HeadlessPopover.Overlay,
    Group: HeadlessPopover.Group,
    Panel,
    Transition,
});
