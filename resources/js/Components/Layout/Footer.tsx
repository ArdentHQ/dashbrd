import cn from "classnames";
import { useTranslation } from "react-i18next";
import { Icon } from "@/Components/Icon";
import { Link } from "@/Components/Link";
import { Point } from "@/Components/Point";
import { PoweredByIcons } from "@/Components/PoweredByIcons";
import { appName } from "@/Utils/app";

interface FooterProperties {
    withActionToolbar?: boolean;
}

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

const SocialIcons = (): JSX.Element => {
    const { t } = useTranslation();
  
    const defaultAnchorStyles =
        "button-icon group h-8 w-8 border-transparent bg-transparent p-1 text-theme-secondary-700 hover:bg-theme-secondary-300 hover:text-theme-secondary-700 active:bg-theme-secondary-400 active:text-theme-primary-900 dark:border-0 dark:text-theme-dark-300 dark:focus-within:outline-3 dark:focus-within:outline-theme-primary-700 dark:focus-within:text-theme-secondary-700 dark:focus-within:bg-transparent dark:hover:bg-theme-dark-700 dark:hover:text-theme-dark-200 dark:active:bg-theme-dark-800 dark:active:text-theme-dark-100 md:flex transition-default";

    return (
        <div className="flex flex-row ">
            <a
                href={t("urls.twitter").toString()}
                className={defaultAnchorStyles}
                target="_blank"
                rel="noopener nofollow noreferrer"
            >
                <span className="sr-only">Twitter</span>
                <Icon
                    name="Twitter"
                    aria-hidden="true"
                    size="md"
                />
            </a>

            <a
                href={t("urls.github").toString()}
                className={defaultAnchorStyles}
                target="_blank"
                rel="noopener nofollow noreferrer"
            >
                <span className="sr-only">GitHub</span>
                <Icon
                    name="GitHub"
                    aria-hidden="true"
                    size="md"
                />
            </a>

            <a
                href={t("urls.discord").toString()}
                className={defaultAnchorStyles}
                target="_blank"
                rel="noopener nofollow noreferrer"
            >
                <span className="sr-only">Discord</span>
                <Icon
                    name="Discord"
                    aria-hidden="true"
                    size="md"
                />
            </a>
        </div>
    );
};

export const Footer = ({ withActionToolbar = false }: FooterProperties): JSX.Element => {
    const { t } = useTranslation();

    return (
        <footer
            data-testid="Footer"
            className={cn("w-full bg-theme-secondary-50 dark:bg-theme-dark-950", {
                "pb-16": withActionToolbar,
            })}
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
