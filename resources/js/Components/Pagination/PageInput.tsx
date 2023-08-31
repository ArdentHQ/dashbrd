import { useTranslation } from "react-i18next";
import { Button } from "@/Components/Buttons";
import { Icon } from "@/Components/Icon";
import { type PageInputProperties } from "@/Components/Pagination/Pagination.contracts";

export const PageInput = ({
    onSubmit,
    onChange,
    onClose,
    totalPages,
    currentPage,
}: PageInputProperties): JSX.Element => {
    const { t } = useTranslation();

    return (
        <div className="flex items-center space-x-1">
            <form
                onSubmit={onSubmit}
                className="relative flex w-60"
                data-testid="Pagination__PageInput__form"
            >
                <input
                    type="number"
                    value={currentPage}
                    min={1}
                    max={totalPages}
                    step={1}
                    required
                    autoFocus
                    onChange={(event) => {
                        onChange(event.target.value);
                    }}
                    className="transition-default hidden-arrows w-full appearance-none rounded-full border border-theme-secondary-300 py-2 pl-4 pr-10 outline-4 outline-offset-0 placeholder:text-theme-secondary-500 focus:border-theme-hint-600 focus:outline-offset-0 focus:outline-theme-hint-300 focus:ring-0"
                    placeholder={t("common.pagination_input_placeholder")}
                    data-testid="Pagination__PageInput__input"
                />

                <button
                    type="submit"
                    className="transition-default absolute inset-y-0 right-1 my-1 flex w-9 items-center justify-center rounded-full hover:bg-theme-secondary-300"
                >
                    <Icon
                        name="MagnifyingGlass"
                        className="text-theme-secondary-700"
                    />
                </button>
            </form>

            <Button
                variant="icon"
                icon="X"
                onClick={onClose}
                data-testid="Pagination__PageInput__closeButton"
            />
        </div>
    );
};
