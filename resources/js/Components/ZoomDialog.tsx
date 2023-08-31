import { Dialog as HeadlessDialog, Transition } from "@headlessui/react";
import cn from "classnames";
import { Fragment, type HTMLAttributes } from "react";
import { IconButton } from "./Buttons/IconButton";

interface Properties extends HTMLAttributes<HTMLDivElement> {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

export const ZoomDialog = ({ isOpen, onClose, children, className, ...properties }: Properties): JSX.Element => (
    <Transition.Root
        data-testid="Dialog"
        show={isOpen}
        as={Fragment}
    >
        <HeadlessDialog
            as="div"
            className={cn("relative z-50", className)}
            onClose={onClose}
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
                <HeadlessDialog.Overlay className="fixed inset-0 bg-theme-secondary-900/15 transition-opacity" />
            </Transition.Child>

            <div
                data-testid="ZoomDialog"
                className="fixed inset-0 z-10 overflow-y-auto"
            >
                <div
                    className="flex min-h-full items-center justify-center text-center"
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
                        <IconButton
                            data-testid="ZoomDialog__close"
                            icon="X"
                            className="fixed right-5 top-5 z-10"
                            onClick={onClose}
                        />
                    </Transition.Child>

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
                            className="flex transform items-center justify-center overflow-hidden shadow-xl transition-all"
                        >
                            {children}
                        </HeadlessDialog.Panel>
                    </Transition.Child>
                </div>
            </div>
        </HeadlessDialog>
    </Transition.Root>
);
