import { Listbox as HeadlessListbox } from "@headlessui/react";
import cn from "classnames";

import {
    ListboxAvatar,
    ListboxButton,
    ListboxGradientButton,
    ListboxInput,
    ListboxOption,
    ListboxOptions,
} from "./Listbox.blocks";
import { type ListboxProperties } from "./Listbox.contracts";
import { isTruthy } from "@/Utils/is-truthy";

const ListboxRoot = <TType = string, TActualType = TType extends Array<infer U> ? U : TType>({
    children,
    className,
    buttonClassName,
    label,
    placeholder,
    hasError = false,
    after,
    maxWith,
    variant,
    avatar,
    isNavigation,
    button,
    optionsClassName,
    optionsAs,
    ...properties
}: ListboxProperties<TType, TActualType>): JSX.Element => (
    <HeadlessListbox {...properties}>
        <div
            className={cn("relative", className)}
            data-testid="Listbox"
        >
            {isTruthy(button) && <>{button}</>}

            {!isTruthy(button) && (
                <div className="flex flex-col items-center sm:flex-row">
                    <ListboxButton
                        className={buttonClassName}
                        isNavigation={isNavigation}
                        data-testid="Listbox__trigger"
                        hasError={hasError}
                        placeholder={placeholder}
                        maxWidth={maxWith}
                        hasAfter={isTruthy(after)}
                        avatar={typeof avatar === "function" ? avatar({ variant }) : avatar}
                        variant={variant}
                    >
                        {label}
                    </ListboxButton>

                    {after}
                </div>
            )}

            <ListboxOptions
                as={optionsAs}
                className={optionsClassName}
            >
                {children}
            </ListboxOptions>
        </div>
    </HeadlessListbox>
);

export const Listbox = Object.assign(ListboxRoot, {
    Option: ListboxOption,
    Button: ListboxButton,
    Input: ListboxInput,
    Avatar: ListboxAvatar,
    GradientButton: ListboxGradientButton,
});
