import cn from "classnames";
import { type OverlayProperties } from "./Overlay.contracts";
import { Dialog } from "@headlessui/react";

export const Overlay = ({
    className,
    isOpen,
    showCloseButton,
    children,
    belowContent,
}: OverlayProperties): JSX.Element => {
    return (
        <Dialog
            open={isOpen}
            onClose={() => {}}
        >
            <div
                className={cn(
                    "fixed inset-0 z-40 mt-14 flex h-screen w-screen flex-col items-center justify-start overflow-auto bg-white backdrop-blur dark:bg-theme-dark-900/90 xs:mt-18 sm:mt-0 sm:justify-center",
                    className,
                    {
                        "bg-opacity-60": !showCloseButton,
                        "bg-opacity-90": showCloseButton,
                    },
                )}
                aria-hidden="true"
            />

            <div className="fixed inset-0 z-50 flex w-screen items-center justify-center">
                <div className="w-full rounded-none border border-theme-secondary-100 bg-white shadow-3xl dark:border-theme-dark-800 dark:bg-theme-dark-900 dark:shadow-[0px_15px_35px_0px_rgba(18,18,19,0.4)] sm:w-[29rem] sm:rounded-3xl">
                    <Dialog.Panel className="mt-8 flex flex-col items-center space-y-6">{children}</Dialog.Panel>
                </div>

                {belowContent}
            </div>
        </Dialog>
    );
};
