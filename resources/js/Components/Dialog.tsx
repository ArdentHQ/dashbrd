import { Dialog as HeadlessDialog, Transition } from "@headlessui/react";
import cn from "classnames";
import { Fragment, type HTMLAttributes, type RefObject } from "react";
import { Icon } from "@/Components/Icon";

interface Properties extends HTMLAttributes<HTMLDivElement> {
    title: string;
    isOpen: boolean;
    isStatic?: boolean;
    onClose: () => void;
    children: React.ReactNode;
    focus?: RefObject<HTMLElement>;
    isUsedByConfirmationDialog?: boolean;
    hasBlurryOverlay?: boolean;
    footer?: React.ReactNode;
    panelClassName?: string;
}

const NOOP = /* istanbul ignore next */ (): null => null;

const Dialog = ({
    title,
    isOpen,
    onClose,
    isStatic = false,
    children,
    focus,
    isUsedByConfirmationDialog = false,
    hasBlurryOverlay = false,
    className,
    panelClassName,
    footer,
    ...properties
}: Properties): JSX.Element => (
    <Transition.Root
        data-testid="Dialog"
        show={isOpen}
        as={Fragment}
    >
        <HeadlessDialog
            as="div"
            className={cn("relative z-50", className)}
            initialFocus={focus}
            static={isStatic}
            onClose={NOOP}
            {...properties}
        >
            <Transition.Child
                as={Fragment}
                enter="ease-out duration-150"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-150"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
            >
                {hasBlurryOverlay ? (
                    <div className="fixed inset-0 bg-white/60 backdrop-blur-sm transition-opacity dark:bg-theme-dark-950/60" />
                ) : (
                    <div className="fixed inset-0 bg-theme-secondary-900/15 transition-opacity dark:bg-theme-dark-950/90" />
                )}
            </Transition.Child>

            <div className="fixed inset-0 z-10 overflow-y-auto">
                <div
                    className="flex min-h-full items-center justify-center text-center"
                    data-testid="Dialog__overlay"
                    onClick={onClose}
                >
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-100"
                        enterFrom="opacity-0 translate-y-2"
                        enterTo="opacity-100 translate-y-0"
                        leave="ease-in duration-150"
                        leaveFrom="opacity-100 translate-y-0"
                        leaveTo="opacity-0 translate-y-2"
                    >
                        <HeadlessDialog.Panel
                            as="div"
                            data-testid="Dialog__panel"
                            className={cn(
                                "flex h-screen w-full flex-col overflow-hidden bg-white text-left transition-all dark:bg-theme-dark-900 sm:block sm:h-auto sm:max-w-md sm:rounded-2xl sm:shadow-dialog",
                                panelClassName,
                            )}
                        >
                            <div className="flex items-center justify-between border-b border-theme-secondary-300 px-6 pb-4 pt-6 dark:border-theme-dark-700">
                                <HeadlessDialog.Title
                                    as="h3"
                                    className="text-lg font-medium text-theme-secondary-900 dark:text-theme-dark-50"
                                >
                                    {title}
                                </HeadlessDialog.Title>

                                {!isStatic && (
                                    <div data-testid="Dialog__close">
                                        <button
                                            type="button"
                                            className="transition-default flex h-8 w-8 items-center justify-center rounded-full text-theme-primary-900 hover:bg-theme-secondary-300 dark:bg-theme-dark-900 dark:text-theme-dark-300 dark:hover:bg-theme-dark-700 dark:hover:text-theme-dark-300"
                                            onClick={onClose}
                                        >
                                            <Icon
                                                name="X"
                                                size="sm"
                                            />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className={cn("flex-1", isUsedByConfirmationDialog ? "" : "px-6 pb-6 pt-4")}>
                                {children}
                            </div>
                            {footer}
                        </HeadlessDialog.Panel>
                    </Transition.Child>
                </div>
            </div>
        </HeadlessDialog>
    </Transition.Root>
);

export { Dialog };
