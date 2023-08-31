import cn from "classnames";

import { forwardRef, type InputHTMLAttributes, type ReactElement, type ReactNode } from "react";

import { InputLabel } from "@/Components/Form/InputLabel";
import { getFirstFocusableElement } from "@/Utils/get-focusable";
import { isTruthy } from "@/Utils/is-truthy";

type Hint = string | [string | ReactNode, string | ReactNode];

type HintPosition = "left" | "right";

interface Properties extends Omit<InputHTMLAttributes<HTMLInputElement>, "children"> {
    children: (({ hasError }: { hasError: boolean }) => React.ReactElement) | React.ReactElement;
    hint?: string | [string | ReactNode, string | ReactNode];
    hintPosition?: HintPosition;
    error?: string;
    label?: string | ReactElement;
}

const InputError = ({ message }: { message: string }): JSX.Element => (
    <span className="block w-full rounded-b-xl px-4 py-2 text-xs font-medium text-theme-danger-600">{message}</span>
);

const InputHint = ({ message, position }: { message: Hint; position?: HintPosition }): JSX.Element => {
    if (Array.isArray(message)) {
        return (
            <span className="flex w-full justify-between rounded-b-xl bg-theme-secondary-100 px-4 py-2 text-xs font-medium text-theme-secondary-700">
                <span>{message[0]}</span>
                <span>{message[1]}</span>
            </span>
        );
    }

    return (
        <span
            className={cn(
                "block w-full rounded-b-xl bg-theme-secondary-100 px-4 py-2 text-xs font-medium text-theme-secondary-700",
                {
                    "text-left": position === "left",
                    "text-right": position === "right",
                },
            )}
        >
            {message}
        </span>
    );
};

const inputGroupClickHandler: React.MouseEventHandler<HTMLDivElement> = (event): void => {
    // If target is a button, link or input, don't focus the input
    if (
        ["button", "a", "input", "textarea"].includes(
            (event.target as HTMLButtonElement | HTMLAnchorElement | HTMLInputElement).nodeName.toLowerCase(),
        )
    ) {
        return;
    }

    getFirstFocusableElement(event.currentTarget)?.focus();
};

export const InputGroup = forwardRef<HTMLDivElement, Properties>(
    ({ children, hint, hintPosition, error, className, label, id, ...properties }, reference): JSX.Element => {
        const hasError = isTruthy(error);

        const hasHint = isTruthy(hint);

        const hasLabel = isTruthy(label);

        const hasFeedback = hasError || hasHint;

        return (
            <>
                {hasLabel && <InputLabel htmlFor={id}>{label}</InputLabel>}

                <div
                    data-testid="InputGroup"
                    ref={reference}
                    onClick={inputGroupClickHandler}
                    className={cn("rounded-xl", className, {
                        "bg-theme-secondary-100": hasHint && !hasError,
                        "bg-theme-danger-100": hasError,
                        "mt-1": hasLabel,
                    })}
                    {...properties}
                >
                    {typeof children === "function" ? children({ hasError }) : children}

                    {hasFeedback && (
                        <div
                            data-testid="InputGroup__feedback"
                            className="overflow-hidden rounded-b-xl"
                        >
                            {hasError && <InputError message={error} />}

                            {hasHint && (
                                <InputHint
                                    message={hint}
                                    position={hintPosition}
                                />
                            )}
                        </div>
                    )}
                </div>
            </>
        );
    },
);

InputGroup.displayName = "InputGroup";
