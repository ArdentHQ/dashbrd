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
    // In some cases, the feedback element needs to be positioned differently due
    // to stuff like having a group of inputs
    erroredFeedbackClass?: string;
}

const InputError = ({ message, className }: { message: string; className?: string }): JSX.Element => (
    <span
        className={cn(
            "-mt-3 block bg-theme-danger-100 px-4 pb-2 pt-5 text-xs font-medium text-theme-danger-600 dark:bg-theme-danger-400 dark:text-white",
            className,
        )}
    >
        {message}
    </span>
);

const InputHint = ({ message, position }: { message: Hint; position?: HintPosition }): JSX.Element => {
    if (Array.isArray(message)) {
        return (
            <span className="flex w-full justify-between rounded-b-xl bg-theme-secondary-100 px-4 py-2 text-xs font-medium text-theme-secondary-700 dark:bg-theme-dark-950 dark:text-theme-dark-200">
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
    (
        { children, hint, hintPosition, error, className, label, id, erroredFeedbackClass = "-mx-px", ...properties },
        reference,
    ): JSX.Element => {
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
                        "bg-theme-secondary-100 dark:bg-theme-dark-950": hasHint && !hasError,
                        "mt-1": hasLabel,
                    })}
                    {...properties}
                >
                    {typeof children === "function" ? children({ hasError }) : children}

                    {hasFeedback && (
                        <div
                            data-testid="InputGroup__feedback"
                            className={cn({
                                [erroredFeedbackClass]: hasError,
                            })}
                        >
                            {hasError && (
                                <InputError
                                    message={error}
                                    className={cn({
                                        "rounded-b-xl": !hasHint,
                                    })}
                                />
                            )}

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
