import cn from "classnames";
import { forwardRef, type RefObject, useCallback, useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { TextInputAvatar, TextInputButton } from "./TextInput.blocks";
import { type TextInputProperties } from "./TextInput.contracts";
import { textInputDynamicClassnames } from "./TextInput.styles";
import { useTextInput } from "./useTextInput";

const TextInputRoot = forwardRef<HTMLInputElement, TextInputProperties>(
    (
        {
            type = "text",
            isFocused,
            className,
            wrapperClassName,
            hasError = false,
            after,
            before,
            onFocus,
            onBlur,
            disabled = false,
            ...properties
        },
        reference,
    ) => {
        const input = reference ?? useRef<HTMLInputElement>(null);

        const focusInput = useCallback(() => {
            (input as RefObject<HTMLInputElement>).current?.focus();
        }, [input]);

        useEffect(() => {
            if (isFocused === true) {
                focusInput();
            }
        }, [focusInput]);

        const [focused, setFocused] = useState(false);
        const { isMouseOver, handleMouseOut, handleMouseOver } = useTextInput({
            input: input as RefObject<HTMLInputElement>,
        });

        const focusHandler = useCallback(
            (event: React.FocusEvent<HTMLInputElement, Element>) => {
                setFocused(true);

                onFocus?.(event);
            },
            [onFocus],
        );

        const blurHandler = useCallback(
            (event: React.FocusEvent<HTMLInputElement, Element>) => {
                setFocused(false);

                onBlur?.(event);
            },
            [onBlur],
        );

        return (
            <div
                data-testid="TextInput"
                onMouseOver={handleMouseOver}
                onMouseOut={handleMouseOut}
                className={cn(
                    "relative flex h-12 items-center space-x-3 rounded-xl border px-4 transition",
                    { "cursor-not-allowed": disabled },
                    textInputDynamicClassnames({ hasError, isFocused: focused, isMouseOver, isDisabled: disabled }),
                    wrapperClassName,
                    "dark:bg-theme-dark-900",
                )}
            >
                {before}

                <input
                    data-testid="TextInput__input"
                    onFocus={focusHandler}
                    onBlur={blurHandler}
                    type={type}
                    className={twMerge(
                        "relative block h-full w-full rounded-xl border-0 py-3 pl-0 pr-0 ring-0 transition placeholder:text-theme-secondary-500 focus:outline-none focus:ring-0 enabled:text-theme-secondary-900 dark:bg-theme-dark-900 dark:text-theme-dark-50 dark:placeholder:text-theme-dark-400",
                        "disabled:cursor-not-allowed disabled:bg-theme-secondary-50 disabled:text-theme-secondary-700 dark:disabled:bg-theme-dark-900 dark:disabled:text-theme-dark-200",
                        className,
                    )}
                    ref={input}
                    disabled={disabled}
                    {...properties}
                />

                {after}
            </div>
        );
    },
);

TextInputRoot.displayName = "TextInputRoot";

export const TextInput = Object.assign(TextInputRoot, { Avatar: TextInputAvatar, Button: TextInputButton });
