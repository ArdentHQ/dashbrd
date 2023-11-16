import cn from "classnames";
import { type FormEvent, type RefObject, useRef } from "react";
import { Button, type ButtonVariant } from "./Buttons/Button";
import { Dialog } from "@/Components/Dialog";

interface Properties {
    title: string;
    cancelLabel?: string;
    confirmLabel: string;
    isOpen: boolean;
    isDisabled?: boolean;
    isStatic?: boolean;
    onClose: () => void;
    onCancel?: () => void;
    onConfirm: () => void;
    children: React.ReactNode;
    focus?: RefObject<HTMLElement>;
    hasBlurryOverlay?: boolean;
    childrenClassName?: string;
    confirmationButtonVariant?: ButtonVariant;
}

export const ConfirmationDialog = ({
    title,
    cancelLabel = "Cancel",
    confirmLabel,
    isOpen,
    isDisabled = false,
    isStatic = false,
    onClose,
    onConfirm,
    onCancel,
    children,
    focus,
    hasBlurryOverlay = false,
    childrenClassName,
    confirmationButtonVariant = "primary",
}: Properties): JSX.Element => {
    const submitButton = useRef<HTMLButtonElement>(null);

    const onSubmit = (event: FormEvent): void => {
        event.preventDefault();
        event.stopPropagation();

        onConfirm();
    };

    return (
        <Dialog
            title={title}
            isStatic={isStatic}
            isOpen={isOpen}
            onClose={onClose}
            focus={focus ?? submitButton}
            isUsedByConfirmationDialog
            hasBlurryOverlay={hasBlurryOverlay}
        >
            <form
                data-testid="ConfirmationDialog__form"
                className="flex min-h-full flex-col"
                onSubmit={onSubmit}
            >
                <div className={cn("flex-1 px-6 pb-6 pt-4", childrenClassName)}>{children}</div>

                <footer className="flex items-center justify-end space-x-3 border-t border-theme-secondary-300 px-6 py-4 dark:border-theme-dark-700 sm:px-6 sm:pb-6 sm:pt-4">
                    {!isStatic && (
                        <Button
                            data-testid="ConfirmationDialog__close"
                            variant="secondary"
                            className="w-full justify-center sm:w-auto"
                            onClick={onCancel ?? onClose}
                        >
                            {cancelLabel}
                        </Button>
                    )}

                    <Button
                        data-testid="ConfirmationDialog__confirm"
                        ref={submitButton}
                        type="submit"
                        processing={isDisabled}
                        disabled={isDisabled}
                        className="w-full justify-center sm:w-auto"
                        variant={confirmationButtonVariant}
                    >
                        {confirmLabel}
                    </Button>
                </footer>
            </form>
        </Dialog>
    );
};
