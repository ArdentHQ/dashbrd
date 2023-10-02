import cn from "classnames";
import { forwardRef, type RefObject, useCallback, useEffect, useRef, useState } from "react";
import { TextInputAvatar, TextInputButton } from "./TextInput.blocks";
import { type TextInputProperties } from "./TextInput.contracts";
import { textInputDynamicClassnames } from "./TextInput.styles";
import { useTextInput } from "./useTextInput";
import { isTruthy } from "@/Utils/is-truthy";

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

        const isDisabled = isTruthy(properties.disabled);

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
                    { "cursor-not-allowed": isDisabled },
                    textInputDynamicClassnames({ hasError, isFocused: focused, isMouseOver, isDisabled }),
                    wrapperClassName,
                )}
            >
                {before}

                <input
                    data-testid="TextInput__input"
                    onFocus={focusHandler}
                    onBlur={blurHandler}
                    type={type}
                    className={cn(
                        "relative block h-full w-full rounded-xl border-0 px-0 py-3 ring-0 transition placeholder:text-theme-secondary-500 focus:outline-none focus:ring-0 enabled:text-theme-secondary-900 dark:bg-theme-dark-900 dark:text-theme-dark-50 dark:placeholder:text-theme-dark-400",
                        "disabled:cursor-not-allowed disabled:bg-theme-secondary-50 disabled:text-theme-secondary-700 dark:disabled:bg-theme-dark-800 dark:disabled:text-theme-dark-200",
                        className,
                    )}
                    ref={input}
                    {...properties}
                />

                {after}
            </div>
        );
    },
);

TextInputRoot.displayName = "TextInputRoot";

export const TextInput = Object.assign(TextInputRoot, { Avatar: TextInputAvatar, Button: TextInputButton });
