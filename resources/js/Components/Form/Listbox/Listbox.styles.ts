import cn from "classnames";
import { type ListboxButtonVariant } from "./Listbox.contracts";
import { isTruthy } from "@/Utils/is-truthy";

export const listboxButtonClassnames = ({
    isOpen,
    hasElementAfter,
    hasError,
    variant,
    isNavigation,
}: {
    variant?: ListboxButtonVariant;
    hasElementAfter: boolean;
    isOpen: boolean;
    hasError: boolean;
    isNavigation?: boolean;
}): string =>
    cn(
        {
            "border-transparent font-medium": isNavigation,
        },
        {
            "enabled:bg-theme-primary-600 enabled:text-white enabled:hover:bg-theme-primary-700": variant === "primary",
            "enabled:bg-theme-danger-400 enabled:text-white enabled:hover:bg-theme-danger-500": variant === "danger",
            "enabled:bg-white enabled:text-theme-secondary-900 dark:enabled:bg-theme-dark-900 dark:enabled:text-dark-200":
                variant === undefined,
        },
        "group relative block h-12 border w-full py-2 px-4 text-left transition focus:outline-none disabled:cursor-not-allowed",
        {
            "rounded-t-xl sm:rounded-tr-none sm:rounded-l-xl enabled:hover:z-10 enabled:focus:z-10": hasElementAfter,
            "rounded-xl": !hasElementAfter,
            "z-10": hasElementAfter && (hasError || isOpen),
        },
        hasError
            ? [
                  "border-theme-danger-400 ring-1 ring-theme-danger-400",
                  "enabled:focus:border-theme-danger-400 enabled:focus:ring-1 enabled:focus:ring-theme-danger-400",
              ]
            : [
                  {
                      "border-theme-secondary-400 dark:border-theme-dark-500": !isTruthy(isNavigation),
                  },
                  {
                      "enabled:border-theme-primary-600": variant === "primary",
                      "enabled:border-theme-danger-400": variant === "danger",
                  },
                  "enabled:focus:ring-2 enabled:focus:ring-theme-primary-300 dark:enabled:focus:ring-theme-primary-400",
                  {
                      "border-theme-primary-600 ring-1 ring-theme-primary-600": isOpen,
                      "enabled:hover:ring-2 enabled:hover:ring-theme-primary-100 dark:enabled:hover:ring-theme-dark-700":
                          !isOpen,
                  },
              ],
        "disabled:bg-theme-secondary-50 disabled:text-theme-secondary-700",
    );
