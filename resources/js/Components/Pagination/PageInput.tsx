import { useTranslation } from "react-i18next";
import { Button } from "@/Components/Buttons";
import { Icon } from "@/Components/Icon";
import { type PageInputProperties } from "@/Components/Pagination/Pagination.contracts";
import { useBreakpoint } from "@/Hooks/useBreakpoint";

export const PageInput = ({ onSubmit, onChange, onClose, totalPages }: PageInputProperties): JSX.Element => {
    const { t } = useTranslation();
    const { isSmAndAbove } = useBreakpoint();

    return (
        <div className="mt-3 grid grid-cols-[1fr_2.5rem] gap-1 md:mt-0">
            <form
                onSubmit={onSubmit}
                className="relative flex items-center justify-center xs:w-64"
                data-testid="Pagination__PageInput__form"
            >
                <input
                    type="number"
                    min={1}
                    max={totalPages}
                    step={1}
                    required
                    autoFocus
                    onChange={(event) => {
                        onChange(event.target.value);
                    }}
                    className="transition-default hidden-arrows h-10 w-full appearance-none rounded-full border border-theme-secondary-300 py-2 pl-4 pr-10 outline-4 outline-offset-0 placeholder:text-theme-secondary-500 focus:border-theme-primary-600 focus:outline-offset-0 focus:outline-theme-primary-300 focus:ring-0 dark:border-theme-dark-700 dark:bg-theme-dark-900 dark:text-theme-dark-50 dark:placeholder:text-theme-dark-400 dark:focus:outline-theme-primary-700 dark:disabled:bg-theme-dark-800 dark:disabled:text-theme-dark-200"
                    placeholder={
                        isSmAndAbove
                            ? t("common.pagination_input_placeholder")
                            : t("common.pagination_input_placeholder_mobile")
                    }
                    data-testid="Pagination__PageInput__input"
                />

                <button
                    type="submit"
                    className="transition-default group absolute inset-y-0 right-1 my-1 flex w-9 items-center justify-center rounded-full hover:bg-theme-secondary-300 dark:hover:bg-theme-dark-700"
                >
                    <Icon
                        name="MagnifyingGlass"
                        className="text-theme-secondary-700 dark:group-hover:text-theme-dark-200"
                    />
                </button>
            </form>

            <Button
                variant="icon"
                icon="X"
                onClick={onClose}
                data-testid="Pagination__PageInput__closeButton"
                className="flex h-10 w-10 items-center justify-center rounded-full"
            />
        </div>
    );
};
