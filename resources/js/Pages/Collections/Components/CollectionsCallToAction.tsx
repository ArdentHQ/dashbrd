import collectionsDark from "@images/collections-dark.png";
import collectionsMobileDark from "@images/collections-mobile-dark.png";
import collectionsMobile from "@images/collections-mobile.png";
import collections from "@images/collections.png";
import { useTranslation } from "react-i18next";
import { ButtonLink } from "@/Components/Buttons/ButtonLink";
import { useDarkModeContext } from "@/Contexts/DarkModeContext";
import { CollectionsGrid } from "@/images";

export const CollectionsCallToAction = (): JSX.Element => {
    const { t } = useTranslation();
    const { isDark } = useDarkModeContext();

    return (
        <div className="lg:px-8 2xl:px-0">
            <div className="relative mt-16 overflow-hidden bg-theme-primary-600 sm:mt-8 lg:mt-12 lg:rounded-xl">
                <CollectionsGrid className="absolute inset-0 h-[240px] w-[1376px]" />

                <div className="relative flex items-end justify-between">
                    <div className="w-full flex-1 p-6 sm:w-1/2 sm:p-8">
                        <h3 className="text-xl font-medium text-white md:text-2xl lg:text-[2rem] lg:leading-[2.75rem]">
                            {t("pages.collections.footer.heading_broken.0")} <br className="hidden lg:block" />
                            {t("pages.collections.footer.heading_broken.1")}
                        </h3>

                        <p className="mt-1 text-sm font-medium text-theme-primary-200 md:text-lg">
                            {t("pages.collections.footer.subtitle")}
                        </p>

                        <div className="mt-4">
                            <ButtonLink
                                href={route("my-collections")}
                                variant="secondary"
                                className="w-full justify-center dark:bg-theme-secondary-100 dark:text-theme-primary-900 dark:hover:bg-theme-secondary-300 dark:hover:text-theme-primary-900 sm:w-auto"
                            >
                                {t("pages.collections.footer.button")}
                            </ButtonLink>
                        </div>
                    </div>

                    <div className="hidden flex-1 xl:block">
                        <img
                            src={isDark ? collectionsDark : collections}
                            alt={t("common.preview")}
                            className="h-full w-full"
                        />
                    </div>

                    <div className="hidden w-1/3 md-lg:block lg:w-1/2 xl:hidden">
                        <img
                            src={isDark ? collectionsMobile : collectionsMobileDark}
                            alt={t("common.preview")}
                            className="h-full w-full"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
