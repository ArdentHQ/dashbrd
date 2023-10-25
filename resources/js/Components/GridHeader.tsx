import cn from "classnames";
import { useTranslation } from "react-i18next";
import { isTruthy } from "@/Utils/is-truthy";
interface GridHeaderProperties {
    title: string;
    value: string | number | JSX.Element | null;
    className?: string;
    emptyValue?: string | null;
}

export const GridHeader = ({
    title,
    value,
    className,
    emptyValue = null,
    ...properties
}: GridHeaderProperties): JSX.Element => {
    const { t } = useTranslation();

    if (!isTruthy(emptyValue)) {
        emptyValue = t("common.na");
    }

    return (
        <div
            className={cn(
                "flex flex-col whitespace-nowrap rounded-lg bg-theme-secondary-50 px-4 py-3 font-medium dark:bg-theme-dark-800 lg:rounded-none lg:bg-transparent lg:py-0",
                className,
            )}
            {...properties}
        >
            <div className="mr-auto flex w-[100px] flex-col space-y-0.5 font-medium md:w-[110px] lg:w-auto">
                <span
                    data-testid="GridHeader__title"
                    className="text-sm leading-4.5 text-theme-secondary-500 dark:text-theme-dark-300 md:leading-5.5"
                >
                    {title}
                </span>

                <span
                    data-testid="GridHeader__value"
                    className="leading-6 md:leading-7"
                >
                    {isTruthy(value) && <span className="dark:text-theme-dark-50">{value}</span>}

                    {!isTruthy(value) && (
                        <span className="text-theme-secondary-500 dark:text-theme-dark-300">{emptyValue}</span>
                    )}
                </span>
            </div>
        </div>
    );
};
