import { Content, Item, Trigger } from "@radix-ui/react-accordion";
import classNames from "classnames";
import { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { EmptyBlock } from "@/Components/EmptyBlock/EmptyBlock";
import { Checkbox } from "@/Components/Form/Checkbox";
import { SearchInput } from "@/Components/Form/SearchInput";
import { Icon } from "@/Components/Icon";
import { Tooltip } from "@/Components/Tooltip";
import { useIsTruncated } from "@/Hooks/useIsTruncated";
import { isTruthy } from "@/Utils/is-truthy";

const CollectionPropertiesFilterItem = ({
    children,
    disabled = false,
    label,
    count,
}: {
    children?: JSX.Element;
    disabled?: boolean;
    label: string;
    count: number;
}): JSX.Element => (
    <Item
        value={label}
        className="flex flex-col overflow-hidden border-t border-theme-secondary-300 px-6 py-4 dark:border-theme-dark-700"
    >
        <Trigger
            type="button"
            className="transition-default group -mx-3 -my-2 inline-flex h-11 items-center justify-between rounded-xl px-3 py-4 font-medium enabled:hover:bg-theme-secondary-100 dark:enabled:hover:bg-theme-dark-800"
            disabled={disabled}
        >
            <span
                className={classNames({
                    "text-theme-secondary-500": disabled,
                    "transition-default text-theme-secondary-700 group-hover:text-theme-secondary-900 dark:text-theme-dark-200 dark:group-hover:text-theme-dark-50":
                        !disabled,
                })}
            >
                {label}
            </span>

            <div className="flex items-center space-x-4 text-sm">
                <span
                    className={classNames({
                        "text-theme-secondary-500": disabled,
                        "text-theme-secondary-700 dark:text-theme-dark-200": !disabled,
                    })}
                >
                    {count}
                </span>

                <Icon
                    name="ChevronDownSmall"
                    className={classNames("transform transition duration-100 group-data-[state=open]:rotate-180", {
                        "text-theme-secondary-500": disabled,
                        "text-theme-secondary-900 dark:text-theme-dark-50": !disabled,
                    })}
                />
            </div>
        </Trigger>

        <Content className="mt-4 space-y-3 data-[state=closed]:animate-[slideUp_100ms_ease-in-out] data-[state=open]:animate-[slideDown_100ms_ease-in-out]">
            {children}
        </Content>
    </Item>
);

const CollectionPropertiesFilterCheckbox = ({
    value,
    count,
    changeHandler,
    checked,
}: {
    changeHandler: (value: string) => void;
    label?: string;
    value: string;
    count: number;
    checked: boolean;
}): JSX.Element => {
    const reference = useRef<HTMLSpanElement>(null);
    const isTruncated = useIsTruncated({ reference });

    return (
        <label className="group flex cursor-pointer items-center justify-between text-sm">
            <div className="flex items-center space-x-3 truncate pr-3 font-normal">
                <Checkbox
                    value={value}
                    onChange={() => {
                        changeHandler(value);
                    }}
                    checked={checked}
                />

                <Tooltip
                    content={value}
                    disabled={!isTruncated}
                >
                    <span
                        ref={reference}
                        className="transition-default w-full truncate text-theme-secondary-700 group-hover:text-theme-secondary-900 dark:text-theme-dark-200 dark:group-hover:text-theme-dark-50"
                    >
                        {value}
                    </span>
                </Tooltip>
            </div>

            <div className="font-medium text-theme-secondary-700 dark:text-theme-dark-200">{count}</div>
        </label>
    );
};

export const CollectionPropertiesGroup = ({
    groupName,
    traits,
    onChange,
    selected,
}: {
    traits: App.Data.Collections.CollectionTraitFilterData[];
    groupName: string;
    key?: string;
    onChange: (groupName: string, value: string, displayType: string) => void;
    selected: Record<string, Array<{ value: string; displayType: string }> | undefined> | null;
}): JSX.Element => {
    const { t } = useTranslation();
    const [query, setQuery] = useState<string>("");
    const filteredItems = useMemo(
        () =>
            isTruthy(query) ? traits.filter(({ value }) => value.toLowerCase().includes(query.toLowerCase())) : traits,
        [traits, query],
    );

    return (
        <CollectionPropertiesFilterItem
            label={groupName}
            count={traits.length}
        >
            <>
                <SearchInput
                    placeholder={t("pages.collections.property_search_placeholder")}
                    query={query}
                    onChange={setQuery}
                />

                {filteredItems.map(({ value, displayType, nftsCount }, index) => (
                    <CollectionPropertiesFilterCheckbox
                        changeHandler={(value: string) => {
                            onChange(groupName, value, displayType);
                        }}
                        key={`${displayType}-${value}-${index}`}
                        value={value}
                        checked={selected?.[groupName]?.some((item) => item.value === value) ?? false}
                        count={nftsCount}
                    />
                ))}

                {filteredItems.length === 0 && <EmptyBlock>{t("common.no_traits_found")}</EmptyBlock>}
            </>
        </CollectionPropertiesFilterItem>
    );
};
