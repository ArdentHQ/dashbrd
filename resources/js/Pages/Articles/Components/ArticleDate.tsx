import { useTranslation } from "react-i18next";
import { useAuth } from "@/Hooks/useAuth";
import { type DateFormat } from "@/Types/enums";
import { formatTimestamp } from "@/Utils/dates";

interface Properties {
    article: App.Data.Articles.ArticleData;
}

export const ArticleDate = ({ article }: Properties): JSX.Element => {
    const { t } = useTranslation();

    const { user } = useAuth();

    return (
        <div className="flex flex-col justify-center">
            <span className="text-sm font-medium text-theme-secondary-500 dark:text-theme-dark-300">
                {t("common.published")}
            </span>

            <span className="whitespace-nowrap font-medium text-theme-secondary-900 dark:text-theme-dark-50">
                {formatTimestamp(
                    article.publishedAt * 1000,
                    user?.attributes.date_format as DateFormat,
                    user?.attributes.timezone,
                )}
            </span>
        </div>
    );
};
