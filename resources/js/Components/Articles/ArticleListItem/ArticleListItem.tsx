import { useTranslation } from "react-i18next";
import { Img } from "@/Components/Image";

interface Properties {
    // TODO(@alfonsobries)[2023-09-30]. Replace with a dynamic type once defined
    article: {
        title: string;
    };
    collections: Array<Pick<App.Data.Nfts.NftCollectionData, "image" | "slug">>;
}

const ArticleListItemCollection = ({
    collection,
}: {
    collection: Pick<App.Data.Nfts.NftCollectionData, "image" | "slug">;
}): JSX.Element => {
    if (collection.image === null) {
        return (
            <div className="relative z-10 -ml-[1.5px] block h-6 w-6 rounded-full bg-theme-secondary-300 outline outline-4 outline-theme-secondary-50" />
        );
    }

    return (
        <div className="relative z-10 -ml-[1.5px] h-6 w-6 shrink-0 overflow-hidden rounded-full bg-white outline outline-4 outline-theme-secondary-50">
            <Img
                className="h-auto w-full rounded-full object-cover"
                src={collection.image}
            />
        </div>
    );
};

export const ArticleListItem = ({ article, collections }: Properties): JSX.Element => {
    const { t } = useTranslation();

    return (
        <a
            data-testid="ArticleListItem"
            href="#"
            className="flex space-x-3 border-b-4  border-theme-secondary-100 bg-white p-6 lg:rounded-lg lg:border lg:border-theme-secondary-300"
        >
            <div className="aspect-video h-11 flex-shrink-0 overflow-hidden rounded-[4px] bg-theme-secondary-300 sm:h-16">
                <img
                    className="w-full object-cover"
                    alt="TBD"
                    src="https://i.ibb.co/42VMb58/CnUnPNz.png"
                />
            </div>

            <div className="flex flex-col space-y-2">
                <h4 className="line-clamp-2 text-sm font-medium leading-[22px]  text-theme-secondary-900 sm:line-clamp-1 sm:text-lg sm:leading-7">
                    {article.title}
                </h4>

                <div className="flex items-center space-x-3">
                    <div className="text-xs font-medium text-theme-secondary-700 sm:text-sm">24 Oct 2023</div>
                    <span className="block h-[5px] w-[5px] rounded-full bg-theme-secondary-400"></span>
                    <div className="flex items-center">
                        <span className="mr-2 hidden text-sm font-medium text-theme-secondary-700 sm:block">
                            {t("pages.articles.featured_collections")}:
                        </span>
                        {collections.map((collection) => (
                            <ArticleListItemCollection
                                key={collection.slug}
                                collection={collection}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </a>
    );
};
