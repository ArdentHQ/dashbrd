import { useTranslation } from "react-i18next";
import { Icon } from "@/Components/Icon";

interface Properties {
    article: App.Data.Articles.ArticleData;
}

export const ArticleAuthor = ({ article }: Properties): JSX.Element => {
    const { t } = useTranslation();

    const sourceSet = [
        article.authorAvatar.thumb !== null ? `${article.authorAvatar.thumb} 1x` : null,
        article.authorAvatar.thumb2x !== null ? `${article.authorAvatar.thumb2x} 2x` : null,
    ]
        .filter((value) => value !== null)
        .join(", ");

    return (
        <div className="flex items-center space-x-3 overflow-auto">
            <div className="flex h-[3.375rem] w-[3.375rem] flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-theme-secondary-200 dark:bg-theme-dark-800">
                {article.authorAvatar.thumb === null ? (
                    <Icon
                        name="Dashbrd"
                        className="text-theme-secondary-500 dark:text-theme-dark-300"
                    />
                ) : (
                    <img
                        src={article.authorAvatar.thumb}
                        srcSet={sourceSet}
                        className=" "
                    />
                )}
            </div>
            <div className="flex flex-col justify-between overflow-auto">
                <span className="text-sm font-medium text-theme-secondary-500 dark:text-theme-dark-300">
                    {t("common.author")}
                </span>

                <span className="truncate font-medium text-theme-secondary-900 dark:text-theme-dark-50">
                    {article.authorName}
                </span>
            </div>
        </div>
    );
};
