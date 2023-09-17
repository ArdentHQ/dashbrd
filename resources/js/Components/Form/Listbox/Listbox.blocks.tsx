import { Listbox as HeadlessListbox, Transition } from "@headlessui/react";
import cn from "classnames";
import { type ElementType, Fragment, type HTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

import {
    type ListboxAvatarProperties,
    type ListboxButtonIconProperties,
    type ListboxButtonPlaceholderProperties,
    type ListboxButtonProperties,
    type ListboxOptionProperties,
} from "./Listbox.contracts";
import { listboxButtonClassnames } from "./Listbox.styles";
import { TextInput, type TextInputProperties } from "@/Components/Form/TextInput";
import { Icon } from "@/Components/Icon";
import { isTruthy } from "@/Utils/is-truthy";

export const ListboxAvatar = ({
    children,
    className,
    variant,
    ...properties
}: ListboxAvatarProperties): JSX.Element => (
    <div
        data-testid="ListboxAvatar"
        className={cn("h-0 w-8 flex-shrink-0 flex-grow-0", className)}
        {...properties}
    >
        <div
            className={cn(
                "relative -top-px -mt-4 flex h-8 w-8 flex-shrink-0 flex-grow-0 items-center justify-center overflow-hidden rounded-full bg-theme-secondary-100 transition group-disabled:bg-theme-secondary-200",
                {
                    "group-enabled:bg-theme-hint-700 group-[:enabled:hover]:bg-theme-hint-800": variant === "primary",
                    "group-enabled:bg-theme-danger-600": variant === "danger",
                    "group-enabled:bg-theme-secondary-100": variant === undefined,
                },
            )}
        >
            {children}
        </div>
    </div>
);

export const ListboxOption = ({
    value,
    children,
    icon,
    isDisabled,
    hasGradient,
    as,
    classNames,
    isSelected = false,
}: ListboxOptionProperties): JSX.Element => (
    <HeadlessListbox.Option
        as={as}
        disabled={isDisabled}
        data-testid="ListboxOption"
        className={({ active, selected }: { active: boolean; selected: boolean }) =>
            cn(
                "transition-default group relative flex h-11 cursor-default select-none items-center justify-center p-3",
                {
                    "cursor-pointer text-theme-secondary-700 hover:bg-theme-hint-50 hover:text-theme-secondary-900":
                        !selected && isDisabled !== true,
                    "bg-theme-hint-100 text-theme-secondary-900": (selected || isSelected) && !isTruthy(hasGradient),
                    "bg-theme-hint-100 text-theme-hint-600": (selected || isSelected) && isTruthy(hasGradient),
                    "bg-theme-hint-50 text-theme-secondary-900": active && !selected,
                    "text-theme-secondary-500 hover:bg-transparent hover:text-theme-secondary-500":
                        isDisabled === true && !selected,
                },
                classNames?.option,
            )
        }
        value={value}
    >
        <div className={cn("flex items-center space-x-3 overflow-auto", classNames?.iconContainer)}>
            {icon !== undefined && (
                <div
                    className={cn("inline-flex flex-shrink-0", classNames?.icon)}
                    data-testid="ListboxOption__icon"
                >
                    {icon}
                </div>
            )}
            <span className="block truncate font-medium">{children}</span>
        </div>
    </HeadlessListbox.Option>
);

export const ListboxInput = ({ wrapperClassName, ...properties }: TextInputProperties): JSX.Element => (
    <TextInput
        wrapperClassName={cn(
            "flex-1 rounded-t-none -mt-px sm:mt-0 sm:rounded-tr-xl sm:rounded-l-none sm:-ml-px w-full",
            wrapperClassName,
        )}
        className="hidden-arrows"
        {...properties}
    />
);

export const ListboxButtonPlaceholder = ({
    placeholder,
    variant,
    isDisabled,
}: ListboxButtonPlaceholderProperties): JSX.Element => (
    <span
        data-testid="ListboxButtonPlaceholder"
        className={cn("block truncate", {
            "text-theme-secondary-500": variant === undefined || isDisabled,
            "text-theme-danger-100": variant === "danger",
            "text-white": variant === "primary" && isDisabled !== true,
        })}
    >
        {isTruthy(placeholder) ? placeholder : " "}
    </span>
);

export const ListboxButtonIcon = ({
    isOpen,
    isDisabled,
    variant,
    isNavigation,
}: ListboxButtonIconProperties): JSX.Element => (
    <Icon
        data-testid="ListboxButtonIcon"
        name="ChevronDownSmall"
        className={cn(
            "h-3 w-3 transform transition duration-100",
            {
                "-rotate-180 ": isOpen,
            },
            isTruthy(isDisabled)
                ? "text-theme-secondary-500"
                : {
                      "text-white": variant === "primary" || variant === "danger",
                      "text-theme-secondary-700": variant === undefined && !isTruthy(isNavigation),
                      "text-theme-secondary-900": isNavigation,
                  },
        )}
        aria-hidden="true"
    />
);

export const ListboxOptions = ({
    children,
    className,
    as,
}: {
    className?: string;
    children: React.ReactNode;
    as?: ElementType;
}): JSX.Element => (
    <Transition
        as={Fragment}
        leave="transition ease-in duration-100"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
    >
        <HeadlessListbox.Options
            as={as}
            className={twMerge(
                "absolute z-10 mt-1 max-h-60 w-full max-w-full overflow-auto bg-white px-0 py-3.5 text-base shadow-dropdown focus:outline-none sm:w-auto",
                className,
            )}
        >
            {children}
        </HeadlessListbox.Options>
    </Transition>
);

export const ListboxGradientButton = ({ children }: HTMLAttributes<HTMLDivElement>): JSX.Element => (
    <HeadlessListbox.Button
        data-testid="ListboxGradientButton"
        className={cn(
            "group relative block w-full rounded-xl border border-theme-secondary-400 px-5 py-2 text-left transition focus:outline-none enabled:focus:ring-2 enabled:focus:ring-theme-hint-300",
            "disabled:bg-theme-secondary-50 disabled:text-theme-secondary-700",
        )}
    >
        {({ open }) => (
            <div className="flex items-center justify-between space-x-3">
                <span className="flex-1 truncate text-xl font-bold leading-[1.875rem] text-theme-hint-600 md:text-2xl md:leading-8 lg:text-[2rem] lg:leading-[2.75rem]">
                    {children}
                </span>

                <div className="pointer-events-none flex h-6 w-6 items-center justify-center rounded-full bg-theme-hint-600 text-white">
                    <Icon
                        data-testid="ListboxButtonIcon"
                        name="ChevronDownSmall"
                        className={cn("h-3 w-4 transform text-white transition duration-100", {
                            "-rotate-180 ": open,
                        })}
                        aria-hidden="true"
                    />
                </div>
            </div>
        )}
    </HeadlessListbox.Button>
);

export const ListboxButton = ({
    children,
    hasError = false,
    hasAfter = false,
    maxWidth,
    placeholder,
    variant,
    avatar,
    isNavigation,
    className,
    ...properties
}: ListboxButtonProperties): JSX.Element => {
    const hasLabel = isTruthy(children);
    const hasElementAfter = isTruthy(avatar) || isTruthy(hasAfter);

    return (
        <HeadlessListbox.Button
            data-testid="ListboxButton"
            style={{ maxWidth: typeof maxWidth === "number" ? `${maxWidth}px` : maxWidth }}
            className={({ open: isOpen }) =>
                cn(listboxButtonClassnames({ isNavigation, isOpen, hasElementAfter, hasError, variant }), className)
            }
            {...properties}
        >
            {({ open, disabled }) => (
                <div className="flex items-center space-x-2">
                    {avatar}

                    <span className="block flex-1 truncate">
                        {hasLabel && children}

                        {!hasLabel && (
                            <ListboxButtonPlaceholder
                                variant={variant}
                                placeholder={placeholder}
                                isDisabled={disabled}
                            />
                        )}
                    </span>

                    <span className="pointer-events-none flex items-center">
                        <ListboxButtonIcon
                            isNavigation={isNavigation}
                            isOpen={open}
                            isDisabled={disabled}
                            variant={variant}
                        />
                    </span>
                </div>
            )}
        </HeadlessListbox.Button>
    );
};
