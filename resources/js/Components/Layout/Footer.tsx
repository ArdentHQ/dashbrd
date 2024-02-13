import cn from "classnames";
import { type ComponentProps } from "react";
import { useTranslation } from "react-i18next";
import { Icon, type IconName } from "@/Components/Icon";
import { Link } from "@/Components/Link";
import { Point } from "@/Components/Point";
import { PoweredByIcons } from "@/Components/PoweredByIcons";
import { appName } from "@/Utils/app";

interface Properties extends ComponentProps<"footer"> {
    withActionToolbar?: boolean;
}

export const Footer = ({ withActionToolbar = false, className, ...properties }: Properties): JSX.Element => {
    const { t } = useTranslation();

    return (
        <footer
            data-testid="Footer"
            className={cn("w-full bg-theme-secondary-50 dark:bg-theme-dark-950", className, {
                "pb-16": withActionToolbar,
            })}
            {...properties}
        >
            <div className="flex w-full max-w-content flex-col lg:flex-row lg:justify-between lg:px-8 xl:mx-auto 2xl:px-0">
                <div className="flex flex-col px-6 pb-3 pt-4 sm:flex-row sm:justify-between sm:px-8 lg:gap-3 lg:px-0">
                    <div className="text-xs font-medium text-theme-secondary-700 dark:text-theme-dark-200 md:text-sm md:font-normal">
                        {new Date().getFullYear()} ©{" "}
                        <Link
                            variant="link"
                            href={t("urls.landing")}
                            textColor="text-theme-primary-600 dark:text-theme-primary-400"
                            className="text-xs active:no-underline md:text-sm"
                        >
                            {appName()}
                        </Link>
                        . {t("footer.all_rights_reserved")}.
                    </div>

                    <div className="flex flex-row items-center gap-2 sm:gap-3">
                        <div className="hidden lg:flex">
                            <Point />
                        </div>

                        <Link
                            variant="link"
                            href={t("urls.privacy_policy")}
                            useAnchorTag
                            className="text-xs active:no-underline md:text-sm"
                        >
                            {t("footer.privacy_policy")}
                        </Link>

                        <Point />

                        <Link
                            variant="link"
                            href={t("urls.terms_of_service")}
                            useAnchorTag
                            className="text-xs md:text-sm"
                        >
                            {t("footer.terms_of_service")}
                        </Link>

                        <div className="hidden flex-row items-center gap-3 lg:flex">
                            <Point />

                            <PoweredBy />
                        </div>
                    </div>
                </div>

                <div className="hidden items-center lg:flex">
                    <SocialIcons />
                </div>

                <div className="flex w-full flex-row justify-between bg-theme-secondary-200 px-6 py-2 dark:bg-theme-dark-800 sm:px-8 lg:hidden">
                    <PoweredBy />

                    <SocialIcons />
                </div>
            </div>
        </footer>
    );
};

const PoweredBy = (): JSX.Element => {
    const { t } = useTranslation();

    return (
        <div className="flex flex-row items-center">
            <span className="mr-2 hidden text-xs font-medium text-theme-secondary-700 dark:text-theme-dark-200 sm:block md:text-sm">
                {t("footer.powered_by")}
            </span>

            <PoweredByIcons />
        </div>
    );
};

const SocialIcon = ({ name, href, icon }: { name: string; href: string; icon: IconName }) => (
    <a
        href={href}
        className={cn(
            "button-icon transition-default group h-8 w-8 border-transparent bg-transparent p-1 text-theme-secondary-700 md:flex",
            "hover:bg-theme-secondary-300 hover:text-theme-secondary-700",
            "active:bg-theme-secondary-400 active:text-theme-primary-900",
            "dark:border-0 dark:text-theme-dark-300",
            "dark:focus-within:bg-transparent dark:focus-within:text-theme-secondary-700 dark:focus-within:outline-3 dark:focus-within:outline-theme-primary-700",
            "dark:hover:bg-theme-dark-700 dark:hover:text-theme-dark-200",
            "dark:active:bg-theme-dark-800 dark:active:text-theme-dark-100",
        )}
        target="_blank"
        rel="noopener nofollow noreferrer"
    >
        <span className="sr-only">{name}</span>

        <Icon
            name={icon}
            aria-hidden="true"
            size="md"
        />
    </a>
);

const SocialIcons = (): JSX.Element => {
    const { t } = useTranslation();

    return (
        <div className="flex flex-row">
            <SocialIcon
                name="Twitter"
                href={t("urls.twitter")}
                icon="Twitter"
            />

            <SocialIcon
                name="GitHub"
                href={t("urls.github")}
                icon="GitHub"
            />

            <SocialIcon
                name="Discord"
                href={t("urls.discord")}
                icon="Discord"
            />
        </div>
    );
};
