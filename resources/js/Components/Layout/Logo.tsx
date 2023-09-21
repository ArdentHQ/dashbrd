import { Link } from "@inertiajs/react";
import cn from "classnames";
import { useTranslation } from "react-i18next";
import { Heading } from "@/Components/Heading";
import { Icon } from "@/Components/Icon";
import { appName } from "@/Utils/app";

interface Properties extends React.HTMLAttributes<HTMLDivElement> {
    renderDotSeparator?: boolean;
    displayHeading?: boolean;
    className?: string;
    hideSmallIcon?: boolean;
}

export const Logo = ({
    renderDotSeparator = false,
    displayHeading = false,
    className,
    hideSmallIcon = false,
}: Properties): JSX.Element => {
    const { t } = useTranslation();

    return (
        <div
            className={cn("flex items-center", className)}
            data-testid="Logo"
        >
            <Link
                href={t("urls.landing")}
                rel="noreferrer"
                className="flex items-center rounded-full outline-none outline-3 outline-offset-4 focus-visible:outline-theme-primary-300"
                data-testid="Logo__link"
            >
                <Icon
                    name="Logo"
                    aria-hidden="true"
                    size="2xl"
                    className={cn({
                        block: hideSmallIcon,
                        "hidden sm:block": !hideSmallIcon,
                    })}
                    data-testid="Logo__icon_medium"
                />

                <Icon
                    name="Logo"
                    aria-hidden="true"
                    size="xl"
                    className={cn({
                        "sm:hidden": !hideSmallIcon,
                        hidden: hideSmallIcon,
                    })}
                    data-testid="Logo__icon_small"
                />

                {displayHeading ? (
                    <Heading
                        level={3}
                        className={"hidden select-none sm:ml-2 sm:block"}
                    >
                        {appName()}
                    </Heading>
                ) : (
                    <span className="sr-only">{appName()}</span>
                )}
            </Link>

            {renderDotSeparator && <DotSeparator className="ml-4 mr-1.5" />}
        </div>
    );
};

const DotSeparator = ({ className, ...properties }: React.HTMLAttributes<HTMLDivElement>): JSX.Element => (
    <div
        aria-hidden="true"
        className={cn("h-1 w-1 rounded-full bg-theme-secondary-300 p-px sm:hidden", className)}
        data-testid="DotSeparator"
        {...properties}
    ></div>
);
