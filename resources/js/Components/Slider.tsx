import { Dialog, Transition } from "@headlessui/react";
import cn from "classnames";
import { createContext, Fragment, type HTMLAttributes, type ReactNode, useContext, useRef } from "react";
import { twMerge } from "tailwind-merge";
import { Button } from "@/Components/Buttons/Button";
import { CustomScroll } from "@/Components/CustomScroll";

interface SliderProperties extends HTMLAttributes<HTMLDivElement> {
    isOpen: boolean;
    children: ReactNode;
    onClose: () => void;
    panelClassName?: string | undefined;
    closeIcon?: JSX.Element;
    externalCloseButtonClassName?: string;
    isFullScreen?: boolean;
}

interface SliderContentProperties extends HTMLAttributes<HTMLDivElement> {
    includePadding?: boolean;
}

interface Context {
    isOpen: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const SliderContext = createContext<Context | undefined>(undefined);

export const useSliderContext = (): Context => {
    const context = useContext(SliderContext);

    if (context === undefined) {
        throw new Error("useSliderContext must be within SliderContext.Provider");
    }

    return context;
};

const CloseButton = ({
    className,
    ...properties
}: {
    className?: string;
    onClick: () => void;
    alwaysOnRight?: boolean;
}): JSX.Element => (
    <div className={twMerge("absolute right-6 top-6 z-10 sm:left-0 sm:right-auto sm:-translate-x-1/2", className)}>
        <Button
            className="h-8 w-8"
            iconSize="xs"
            variant="icon-secondary"
            icon="X"
            {...properties}
        />
    </div>
);

const SliderHeader = ({ className, children, ...properties }: HTMLAttributes<HTMLDivElement>): JSX.Element => (
    <div
        className={twMerge(
            "flex h-20 items-center border-b border-theme-secondary-300 px-8 py-6 dark:border-theme-dark-700 dark:bg-theme-dark-900 dark:text-theme-dark-50",
            className,
        )}
        {...properties}
    >
        {children}
    </div>
);

const SliderContent = ({
    includePadding = true,
    className,
    children,
    ...properties
}: SliderContentProperties): JSX.Element => (
    <div
        className={cn({ "px-6 pb-28 pt-6 sm:px-8": includePadding }, className)}
        {...properties}
    >
        {children}
    </div>
);

const SliderContainer = ({
    isOpen,
    children,
    onClose,
    className,
    panelClassName,
    closeIcon,
    externalCloseButtonClassName,
    isFullScreen = false,
    ...properties
}: SliderProperties): JSX.Element => {
    const dummyReference = useRef<HTMLDivElement | null>(null);

    return (
        <Transition.Root
            show={isOpen}
            as={Fragment}
        >
            <Dialog
                initialFocus={dummyReference}
                as="div"
                id="slider"
                className={cn(
                    "fixed inset-0 z-50 flex transform items-center overflow-hidden px-4 py-6 transition-all sm:px-0",
                    className,
                )}
                onClose={() => null}
                {...properties}
            >
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <Dialog.Overlay
                        data-testid="Slider__overlay"
                        className="fixed inset-0 bg-theme-secondary-900/15"
                        onClick={onClose}
                    />
                </Transition.Child>

                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="translate-x-full"
                    enterTo="translate-x-0"
                    leave="ease-in duration-300"
                    leaveFrom="translate-x-0"
                    leaveTo="translate-x-full"
                >
                    <Dialog.Panel
                        className={twMerge("absolute inset-y-0 right-0 w-full shadow-xl sm:max-w-lg", panelClassName)}
                    >
                        <div
                            ref={dummyReference}
                            data-testid="Slider__dummy"
                            tabIndex={-1}
                            className="absolute left-0 top-0 z-[-9999] opacity-0"
                        />

                        <CloseButton
                            data-testid="Slider__closeButton_desktop"
                            className={cn(
                                "hidden sm:block",
                                {
                                    "fixed top-3  xs:top-5 sm:left-auto sm:right-8 sm:translate-x-0": isFullScreen,
                                },
                                externalCloseButtonClassName,
                            )}
                            onClick={onClose}
                        />

                        <CustomScroll className="h-screen bg-white dark:bg-theme-dark-900">
                            {closeIcon ?? (
                                <CloseButton
                                    data-testid="Slider__closeButton_mobile"
                                    className={cn("block sm:hidden", {
                                        "fixed left-auto top-3 xs:top-5": isFullScreen,
                                    })}
                                    onClick={onClose}
                                />
                            )}

                            {children}
                        </CustomScroll>
                    </Dialog.Panel>
                </Transition.Child>
            </Dialog>
        </Transition.Root>
    );
};

export const Slider = Object.assign(SliderContainer, {
    Header: SliderHeader,
    Content: SliderContent,
});
