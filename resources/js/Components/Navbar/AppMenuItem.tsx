import cn from "classnames";
import { useTranslation } from "react-i18next";
import { Link } from "@/Components/Link";
import { Tooltip } from "@/Components/Tooltip";

interface Properties {
    title: string;
    url?: string;
    disabled?: boolean;
    external?: boolean;
    isActive?: boolean;
    dark?: boolean;
    className?: string;
    useAnchorTag?: boolean;
}

export const AppMenuItem = ({
    title,
    url = "",
    disabled = false,
    external = false,
    isActive = false,
    dark = false,
    useAnchorTag = false,
    className,
}: Properties): JSX.Element => {
    const { t } = useTranslation();

    const defaultItemStyles =
        "transition-default group flex w-full py-3 border-b-3 pt-6 pb-5 outline-0 focus-visible:ring focus-visible:ring-theme-primary-300 focus-visible:z-10";
    const defaultTextContainerStyles = cn("flex px-[1.125rem] border-r group-last:border-r-0", {
        "border-theme-secondary-800": dark,
        "border-theme-secondary-300": !dark,
    });
    const defaultTextStyles = "transition-default text-center font-medium leading-6 text-base";

    if (disabled) {
        return (
            <div
                data-testid="AppMenuItem__disabled"
                className={cn(defaultItemStyles, "cursor-default border-transparent", className)}
            >
                <Tooltip content={t("common.coming_soon")}>
                    <div className={defaultTextContainerStyles}>
                        <span
                            data-testid="AppMenuItem__Title"
                            className={cn(defaultTextStyles, "text-theme-secondary-500")}
                        >
                            <>{title}</>
                        </span>
                    </div>
                </Tooltip>
            </div>
        );
    }

    return (
        <Link
            className={cn(
                defaultItemStyles,
                {
                    "border-theme-primary-900 bg-theme-secondary-50 text-theme-secondary-900": isActive && !dark,
                    "border-transparent hover:border-theme-secondary-300": !isActive && !dark,
                    "border-transparent": dark,
                },
                className,
            )}
            href={url}
            external={external}
            useAnchorTag={useAnchorTag}
            data-testid="AppMenuItem"
        >
            <div className={defaultTextContainerStyles}>
                <span
                    data-testid="AppMenuItem__Title"
                    className={cn(defaultTextStyles, {
                        "text-white group-hover:text-theme-primary-500": dark,
                        "group-hover:text-theme-secondary-900": !dark,
                        "text-theme-secondary-900": isActive && !dark,
                        "text-theme-secondary-700": !isActive && !dark,
                    })}
                >
                    <>{title}</>
                </span>
            </div>
        </Link>
    );
};
