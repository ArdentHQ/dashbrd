import { ArticleAuthor } from "./ArticleAuthor";
import { ArticleDate } from "./ArticleDate";
import { ArticleShare } from "./ArticleShare";

interface Properties {
    article: App.Data.Articles.ArticleData;
}

export const ArticleMeta = ({ article }: Properties): JSX.Element => (
    <div className="px-6 sm:px-8 lg:px-0">
        <div className="-mx-6 flex flex-col border-b border-t border-theme-secondary-300 px-6 py-4 dark:border-theme-dark-700 sm:-mx-8 sm:px-8 md:mx-0 md:rounded-xl md:border md:px-6 lg:rounded-none lg:border-x-0 lg:border-b-0">
            <div className="flex items-center justify-between">
                <div className="flex overflow-auto">
                    <ArticleAuthor article={article} />

                    <div className="mx-6 border-r border-theme-secondary-300 dark:border-theme-dark-700"></div>

                    <ArticleDate article={article} />
                </div>
            </div>

            <div className="mt-4 flex justify-between border-t border-dashed border-theme-secondary-400 pt-4 md:hidden">
                <div>
                    <ArticleShare
                        article={article}
                        className="flex space-x-2"
                    />
                </div>
            </div>
        </div>
    </div>
);
