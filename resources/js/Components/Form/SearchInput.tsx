import classNames from "classnames";
import { type HTMLAttributes } from "react";
import { TextInput } from "@/Components/Form/TextInput";
import { Icon } from "@/Components/Icon";

interface Properties extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
    placeholder: string;
    onChange: (query: string) => void;
    query: string;
    disabled?: boolean;
}

export const SearchInput = ({
    query,
    onChange,
    placeholder,
    disabled = false,
    className,
    ...properties
}: Properties): JSX.Element => (
    <div
        className={classNames("relative", className)}
        {...properties}
    >
        <TextInput
            data-testid="NftCollectionSlider__search"
            value={query}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                onChange(event.target.value);
            }}
            placeholder={placeholder}
            className="pr-16"
            disabled={disabled}
        />

        {query !== "" && (
            <button
                data-testid="NftCollectionSlider__clear-search"
                type="button"
                className="absolute right-0 top-0 mr-14 mt-4"
                onClick={() => {
                    onChange("");
                }}
            >
                <Icon
                    name="X"
                    size="md"
                    className="text-theme-primary-900 dark:text-theme-dark-200"
                />
            </button>
        )}

        <Icon
            name="MagnifyingGlass"
            size="md"
            className={classNames("pointer-events-none absolute right-0 top-0 mr-4 mt-4", {
                "text-theme-primary-900 dark:text-theme-dark-200": !disabled,
                "text-theme-secondary-500 dark:text-theme-dark-500": disabled,
            })}
        />
    </div>
);
