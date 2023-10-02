import cn from "classnames";
import Markdown from "markdown-to-jsx";
import { type ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog } from "@/Components/Dialog";
import { Link, LinkButton } from "@/Components/Link";
import { Tooltip } from "@/Components/Tooltip";
import { isTruthy } from "@/Utils/is-truthy";

export const CollectionDescription = ({
    name,
    description,
    linkClassName,
}: {
    name: string;
    description: string | null;
    linkClassName?: string;
}): JSX.Element => {
    const { t } = useTranslation();
    const [showDescriptionModal, setShowDescriptionModal] = useState(false);

    return (
        <>
            {!isTruthy(description) && (
                <Tooltip content={t("common.na")}>
                    <div>
                        <LinkButton
                            data-testid="CollectionHeaderTop__about"
                            className={cn(
                                "border-b border-dashed border-theme-secondary-500 text-theme-secondary-500",
                                linkClassName,
                            )}
                            disabled
                        >
                            {name}
                        </LinkButton>
                    </div>
                </Tooltip>
            )}

            {isTruthy(description) && (
                <>
                    <LinkButton
                        data-testid="CollectionHeaderTop__about"
                        className={cn(
                            "transition-default border-b border-dashed border-theme-secondary-900 hover:border-transparent hover:text-theme-primary-700 dark:border-theme-dark-50 dark:text-theme-dark-50 dark:hover:border-theme-dark-200 dark:hover:text-theme-dark-200",
                            linkClassName,
                        )}
                        onClick={() => {
                            setShowDescriptionModal(true);
                        }}
                    >
                        {name}
                    </LinkButton>

                    <Dialog
                        title={t("pages.collections.about_collection")}
                        isOpen={showDescriptionModal}
                        onClose={() => {
                            setShowDescriptionModal(false);
                        }}
                    >
                        <div
                            data-testid="CollectionHeaderTop__description_modal"
                            className={cn(
                                "text-theme-secondary-700 [&_div]:space-y-6",
                                "dark:text-theme-dark-200 [&_a]:text-theme-primary-600 hover:[&_a]:underline",
                            )}
                        >
                            <Markdown
                                data-testid="CollectionHeaderTop__html"
                                options={{
                                    disableParsingRawHTML: true,
                                    overrides: {
                                        img: MarkdownImage,
                                        a: MarkdownLink,
                                    },
                                }}
                            >
                                {description}
                            </Markdown>
                        </div>
                    </Dialog>
                </>
            )}
        </>
    );
};

export const MarkdownImage = ({ alt, src }: { alt: string; src: string }): JSX.Element => (
    <>
        ![{alt}]({src})
    </>
);

const MarkdownLink = ({ href, children }: { href: string; children: ReactNode }): JSX.Element => (
    <span className="inline-flex flex-wrap">
        <Link
            className="outline-offset-3 transition-default flex items-center space-x-2 whitespace-nowrap rounded-full text-theme-primary-600 underline decoration-transparent underline-offset-2 outline-none outline-3 hover:text-theme-primary-700 hover:decoration-theme-primary-700 focus-visible:outline-theme-primary-300 dark:text-theme-primary-400 dark:hover:text-theme-primary-500 dark:hover:decoration-theme-primary-500"
            href={href}
            external
            confirmBeforeProceeding
            iconClassName="inline ml-1 text-theme-secondary-500"
        >
            {children}
        </Link>
    </span>
);
