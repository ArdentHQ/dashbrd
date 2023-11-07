import { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { type ButtonVariant } from "./Buttons";
import { ConfirmationDialog } from "@/Components/ConfirmationDialog";
import { TextInput } from "@/Components/Form/TextInput";
import { DeleteModal } from "@/images";

interface Properties {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    children: React.ReactNode;
    isDisabled?: boolean;
    requiresConfirmation?: boolean;
    confirmationButtonVariant?: ButtonVariant;
}

export const ConfirmDeletionDialog = ({
    isOpen,
    isDisabled = false,
    onClose,
    onConfirm,
    children,
    title,
    requiresConfirmation = true,
    confirmationButtonVariant,
}: Properties): JSX.Element => {
    const { t } = useTranslation();
    const input = useRef<HTMLInputElement>(null);
    const [confirmationValue, setConfirmationValue] = useState("");

    const valid = useMemo(
        () => !requiresConfirmation || confirmationValue.toLowerCase() === t("common.delete").toLowerCase(),
        [confirmationValue, requiresConfirmation],
    );

    const close = (): void => {
        onClose();

        // Reset after transition ends...
        setTimeout(() => {
            setConfirmationValue("");
        }, 200);
    };

    return (
        <ConfirmationDialog
            title={title}
            isOpen={isOpen}
            confirmLabel={t("common.confirm")}
            onConfirm={onConfirm}
            isDisabled={isDisabled || !valid}
            onClose={close}
            focus={input}
            confirmationButtonVariant={confirmationButtonVariant}
        >
            <div className="space-y-3">
                <DeleteModal className="mx-auto" />

                <p className="text-theme-secondary-700 dark:text-theme-dark-200">{children}</p>

                {requiresConfirmation && (
                    <TextInput
                        ref={input}
                        value={confirmationValue}
                        onChange={(event) => {
                            setConfirmationValue(event.target.value);
                        }}
                        data-testid="ConfirmDeletionDialog__input"
                        placeholder={t("common.write_to_confirm", {
                            word: t("common.delete").toUpperCase(),
                        })}
                    />
                )}
            </div>
        </ConfirmationDialog>
    );
};
