import { useTranslation } from "react-i18next";
import { FeaturedCollections } from "@/Components/Articles/ArticleCard/ArticleCard.blocks";
import { type ArticleCollections } from "@/Components/Articles/ArticleCard/ArticleCardContracts";

interface Properties {
    // TODO(@alfonsobries)[2023-09-30]. Replace with a dynamic type once defined
    article: {
        title: string;
    };
    collections: ArticleCollections;
}

export const ArticleListItem = ({ article, collections }: Properties): JSX.Element => {
    const { t } = useTranslation();

    return (
        <a
            data-testid="ArticleListItem"
            href="#"
            className="flex space-x-3 bg-white p-6 sm:rounded-lg sm:border sm:border-theme-secondary-300"
        >
            <div className="aspect-video h-11 flex-shrink-0 overflow-hidden rounded-[4px] bg-theme-secondary-300 sm:h-16">
                <img
                    className="w-full object-cover"
                    alt="TBD"
                    src="https://images.unsplash.com/photo-1638803040283-7a5ffd48dad5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2592&q=80"
                />
            </div>

            <div className="flex flex-1 flex-col space-y-2">
                <h4 className="line-clamp-2 text-sm font-medium  leading-[22px] text-theme-secondary-900 sm:text-lg sm:leading-7">
                    {article.title}
                </h4>

                <div className="flex items-center space-x-3">
                    <div className="text-xs font-medium text-theme-secondary-700 sm:text-sm">24 Oct 2023</div>
                    <span className="block h-[5px] w-[5px] rounded-full bg-theme-secondary-400"></span>
                    <div className="flex flex-1 items-center">
                        <span className="mr-2 hidden shrink-0 text-sm font-medium text-theme-secondary-700 sm:block">
                            {t("pages.articles.featured_collections")}:
                        </span>
                        <FeaturedCollections collections={collections} />
                    </div>
                </div>
            </div>
        </a>
    );
};
