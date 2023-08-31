import { type ElementType } from "react";

export type ListboxButtonVariant = "primary" | "danger";

export interface ListboxAvatarProperties extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode;
    variant?: ListboxButtonVariant;
}

export interface ListboxProperties<TType, TActualType> {
    children: React.ReactNode;
    buttonClassName?: string;
    className?: string;
    value?: TType;
    defaultValue?: TType;
    label?: string;
    placeholder?: string;
    disabled?: boolean;
    onChange?: (value: TType) => void;
    name?: string;
    multiple?: boolean;
    hasError?: boolean;
    isNavigation?: boolean;
    // @see https://headlessui.com/react/listbox#binding-objects-as-values
    by?: (keyof TActualType & string) | ((a: TActualType, z: TActualType) => boolean);
    maxWith?: number | string;
    after?: React.ReactElement;
    variant?: ListboxButtonVariant;
    avatar?: React.ReactNode | ((options: { variant?: ListboxButtonVariant }) => React.ReactNode);
    button?: React.ReactNode;
    optionsClassName?: string;
    optionsAs?: ElementType;
}

export interface ListboxOptionProperties {
    value: unknown;
    children: React.ReactNode;
    icon?: React.ReactNode;
    isDisabled?: boolean;
    hasGradient?: boolean;
    as?: ElementType;
    classNames?: {
        option?: string;
        iconContainer?: string;
        icon?: string;
    };
    isSelected?: boolean;
}

export interface ListboxButtonProperties extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className"> {
    children?: React.ReactNode;
    hasError?: boolean;
    hasAfter?: boolean;
    placeholder?: string;
    maxWidth?: number | string;
    variant?: ListboxButtonVariant;
    avatar?: React.ReactNode;
    className?: string;
    isNavigation?: boolean;
}
export interface ListboxButtonPlaceholderProperties {
    placeholder?: string;
    variant?: ListboxButtonVariant;
    isDisabled?: boolean;
}

export interface ListboxButtonIconProperties {
    isOpen?: boolean;
    isDisabled?: boolean;
    variant?: ListboxButtonVariant;
    isNavigation?: boolean;
}
