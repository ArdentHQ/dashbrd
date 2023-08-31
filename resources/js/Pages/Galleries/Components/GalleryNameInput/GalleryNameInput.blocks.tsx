import cn from "classnames";
import { useTranslation } from "react-i18next";
import { Tooltip } from "@/Components/Tooltip";
import { isTruthy } from "@/Utils/is-truthy";

export const NameLengthIndicator = ({
    className,
    name,
    maxLength,
    error,
}: {
    className?: string;
    name: string;
    maxLength: number;
    error?: string;
}): JSX.Element => {
    const { t } = useTranslation();

    return (
        <div className={cn("mt-1 flex items-center justify-center sm:mt-0", className)}>
            <div
                className={cn("mr-3 flex items-center space-x-1 text-sm font-medium", {
                    "text-theme-danger-400": isTruthy(error),
                    "text-theme-secondary-500": !isTruthy(error),
                })}
            >
                <Tooltip
                    disabled={!isTruthy(error)}
                    placement="bottom"
                    content={t("pages.galleries.create.title_too_long", { max: maxLength })}
                    visible
                    variant="danger"
                >
                    <span>
                        {name.length}/{maxLength}
                    </span>
                </Tooltip>
            </div>
        </div>
    );
};
