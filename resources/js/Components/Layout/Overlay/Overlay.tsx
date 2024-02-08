import { Dialog } from "@headlessui/react";
import cn from "classnames";
import { type OverlayProperties } from "./Overlay.contracts";

const NOOP = /* istanbul ignore next */ (): null => null;

export const Overlay = ({
    className,
    isOpen,
    showCloseButton,
    children,
    belowContent,
}: OverlayProperties): JSX.Element => (
    <Dialog
        open={isOpen}
        onClose={NOOP}
    >
        <div
            className={cn(
                "fixed inset-0 z-[51] bg-white backdrop-blur dark:bg-theme-dark-900/90",
                className,
                showCloseButton ? "bg-opacity-90" : "bg-opacity-60",
            )}
            aria-hidden="true"
        />

        <div className="fixed inset-0 z-[60] flex items-start justify-center sm:items-center">
            <div>
                <div className="w-full rounded-none border border-theme-secondary-100 bg-white shadow-3xl dark:border-theme-dark-800 dark:bg-theme-dark-900 dark:shadow-[0px_15px_35px_0px_rgba(18,18,19,0.4)] sm:w-[29rem] sm:rounded-3xl">
                    <Dialog.Panel className="mt-8 flex flex-col items-center space-y-6">{children}</Dialog.Panel>
                </div>

                {belowContent}
            </div>
        </div>
    </Dialog>
);
