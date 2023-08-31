import cn from "classnames";
import { useTranslation } from "react-i18next";
import { Icon } from "@/Components/Icon";
import { Link } from "@/Components/Link";
import { PoweredByIcons } from "@/Components/PoweredByIcons";
import { appName } from "@/Utils/app";

interface FooterProperties {
    withActionToolbar?: boolean;
}

const FooterSeparator = ({ className }: { className?: string }): JSX.Element => (
    <span
        className={cn(
            "mx-2 h-1.25 w-1.25 rounded-full border border-theme-secondary-300 bg-theme-secondary-300 sm:mx-4",
            className,
        )}
    ></span>
);

export const Footer = ({ withActionToolbar = false }: FooterProperties): JSX.Element => {
    const { t } = useTranslation();

    return (
        <footer
            data-testid="Footer"
            className={cn("w-full bg-theme-secondary-50", {
                "pb-16": withActionToolbar,
            })}
        >
            <div className="mx-auto w-full max-w-content items-end justify-between px-6 py-4 text-sm sm:px-8 md-lg:flex md-lg:items-center lg:px-8 2xl:px-0">
                <div className="text-theme-secondary-700">
                    {new Date().getFullYear()} ©{" "}
                    <Link
                        variant="link"
                        href={t("urls.landing")}
                        textColor="text-theme-hint-600"
                    >
                        {appName()}
                    </Link>
                    . {t("footer.all_rights_reserved")}.
                </div>

                <div className="mt-2 flex-1 items-center justify-between sm:flex md:mt-0">
                    <div className="flex items-center">
                        <FooterSeparator className="hidden md-lg:block" />
                        <Link
                            variant="link"
                            href={t("urls.privacy_policy")}
                            useAnchorTag
                        >
                            {t("footer.privacy_policy")}
                        </Link>

                        <FooterSeparator />

                        <Link
                            variant="link"
                            href={t("urls.terms_of_service")}
                            useAnchorTag
                        >
                            {t("footer.terms_of_service")}
                        </Link>

                        <div className="hidden items-center sm:flex">
                            <FooterSeparator />

                            <span className="pr-2 text-sm font-medium leading-5.5 text-theme-secondary-700">
                                {t("footer.powered_by")}
                            </span>

                            <PoweredByIcons />
                        </div>
                    </div>

                    <div className="mt-2 flex flex-col justify-between xs:h-5 xs:flex-row xs:items-center sm:mt-0 sm:justify-end lg:justify-start">
                        <div className="flex sm:hidden">
                            <span className="pr-2 text-sm font-medium leading-5.5 text-theme-secondary-700">
                                {t("footer.powered_by")}
                            </span>
                            <PoweredByIcons />
                        </div>
                        <div className="mt-2 flex space-x-4 xs:mt-0 md:space-x-0">
                            <a
                                href={t("urls.twitter").toString()}
                                className="transition-default text-theme-secondary-700 hover:text-theme-hint-700 md:hidden"
                                target="_blank"
                                rel="noopener nofollow noreferrer"
                            >
                                <span className="sr-only">Twitter</span>
                                <Icon
                                    name="Twitter"
                                    aria-hidden="true"
                                />
                            </a>

                            <a
                                href={t("urls.twitter").toString()}
                                className="button-icon group hidden border-transparent bg-transparent text-theme-secondary-700 hover:text-theme-hint-900 md:flex"
                                target="_blank"
                                rel="noopener nofollow noreferrer"
                            >
                                <span className="sr-only">Twitter</span>
                                <Icon
                                    name="Twitter"
                                    aria-hidden="true"
                                />
                            </a>

                            <a
                                href={t("urls.github").toString()}
                                className="transition-default text-theme-secondary-700 hover:text-theme-hint-700 md:hidden"
                                target="_blank"
                                rel="noopener nofollow noreferrer"
                            >
                                <span className="sr-only">GitHub</span>
                                <Icon
                                    name="GitHub"
                                    aria-hidden="true"
                                />
                            </a>

                            <a
                                href={t("urls.github").toString()}
                                className="button-icon group !ml-0 hidden border-transparent bg-transparent text-theme-secondary-700 hover:text-theme-hint-900 md:flex"
                                target="_blank"
                                rel="noopener nofollow noreferrer"
                            >
                                <span className="sr-only">GitHub</span>
                                <Icon
                                    name="GitHub"
                                    aria-hidden="true"
                                />
                            </a>

                            <a
                                href={t("urls.discord").toString()}
                                className="transition-default text-theme-secondary-700 hover:text-theme-hint-700 md:hidden"
                                target="_blank"
                                rel="noopener nofollow noreferrer"
                            >
                                <span className="sr-only">Discord</span>
                                <Icon
                                    name="Discord"
                                    aria-hidden="true"
                                />
                            </a>

                            <a
                                href={t("urls.discord").toString()}
                                className="button-icon group !ml-0 hidden border-transparent bg-transparent text-theme-secondary-700 hover:text-theme-hint-900 md:flex"
                                target="_blank"
                                rel="noopener nofollow noreferrer"
                            >
                                <span className="sr-only">Discord</span>
                                <Icon
                                    name="Discord"
                                    aria-hidden="true"
                                />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};
