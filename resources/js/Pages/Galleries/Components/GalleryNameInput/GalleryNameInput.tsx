import cn from "classnames";
import { useTranslation } from "react-i18next";
import { NameLengthIndicator } from "./GalleryNameInput.blocks";
import { Tooltip } from "@/Components/Tooltip";
import { useBreakpoint } from "@/Hooks/useBreakpoint";
import { isTruthy } from "@/Utils/is-truthy";

export const GalleryNameInput = ({
    name,
    onChange,
    onBlur,
    error,
    maxLength = 50,
}: {
    maxLength?: number;
    name: string;
    onChange?: (name: string) => void;
    onBlur?: () => void;
    error?: string;
}): JSX.Element => {
    const { t } = useTranslation();
    const { isSmAndAbove } = useBreakpoint();

    const hasError = isTruthy(error);
    const hasLimitError = error === t("pages.galleries.create.title_too_long", { max: maxLength });

    return (
        <div>
            <div
                className={cn(
                    "transition-default relative flex items-center justify-center rounded-xl border px-4 py-3",
                    {
                        "border-theme-danger-400 ring-1 ring-theme-danger-400": hasError || hasLimitError,
                        "transition-default border-theme-secondary-400 focus-within:border-theme-primary-600 focus-within:ring-1 focus-within:ring-theme-primary-600 dark:border-theme-dark-500 dark:focus-within:border-theme-primary-400 dark:focus-within:ring-theme-primary-400":
                            !hasError && !hasLimitError,
                    },
                )}
            >
                {isSmAndAbove && (
                    <NameLengthIndicator
                        name={name}
                        maxLength={maxLength}
                        error={hasLimitError ? error : undefined}
                    />
                )}

                <div className="flex w-full items-center justify-center">
                    <input
                        name="name"
                        type="text"
                        maxLength={maxLength + 1}
                        value={name}
                        onBlur={() => {
                            onBlur?.();
                        }}
                        onChange={(event) => {
                            onChange?.(event.target.value);
                        }}
                        className="w-full appearance-none border-0 py-0 text-center text-xl font-medium leading-[1.875rem] placeholder:font-normal placeholder:text-theme-secondary-500 focus:outline-none focus:ring-0 focus:placeholder:text-transparent dark:bg-theme-dark-900 dark:text-theme-dark-50 dark:placeholder:text-theme-dark-400 md:text-2xl md:leading-8 lg:text-[2rem] lg:leading-[2.75rem]"
                        placeholder={t("pages.galleries.create.input_placeholder")}
                    />
                </div>

                <Tooltip
                    disabled={!hasError || hasLimitError}
                    placement="bottom"
                    content={error}
                    visible
                    variant="danger"
                    offset={[0, 50]}
                    zIndex={1}
                >
                    <span />
                </Tooltip>
            </div>

            {!isSmAndAbove && (
                <NameLengthIndicator
                    name={name}
                    maxLength={maxLength}
                    className="mt-2"
                    error={hasLimitError ? error : undefined}
                />
            )}
        </div>
    );
};
