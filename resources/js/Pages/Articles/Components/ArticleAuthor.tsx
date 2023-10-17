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
        <div className="flex items-center space-x-3">
            <div className="flex h-[54px] w-[54px] items-center justify-center overflow-hidden rounded-full bg-theme-secondary-200">
                {article.authorAvatar.thumb === null ? (
                    <Icon
                        name="D"
                        className="text-theme-secondary-500"
                    />
                ) : (
                    <img
                        src={article.authorAvatar.thumb}
                        srcSet={sourceSet}
                        className=" "
                    />
                )}
            </div>
            <div className="flex flex-col justify-between">
                <span className="text-sm font-medium text-theme-secondary-500">{t("common.author")}</span>

                <span className="font-medium text-theme-secondary-900">{article.authorName}</span>
            </div>
        </div>
    );
};
