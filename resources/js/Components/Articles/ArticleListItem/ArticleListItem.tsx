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
            className="group flex w-full max-w-[335px] flex-col overflow-hidden rounded-xl border border-theme-secondary-300 bg-white"
        >
            <div className="mx-2 mt-2 aspect-[16/9] overflow-hidden rounded-lg bg-theme-secondary-300">
                <img
                    className="w-full object-cover"
                    alt="TBD"
                    src="https://images.unsplash.com/photo-1638803040283-7a5ffd48dad5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2592&q=80"
                />
            </div>

            <div className="flex flex-1 flex-col px-6 py-3">
                <div className="text-sm font-medium text-theme-secondary-700">24 Oct 2023</div>

                <h4 className="mt-1 line-clamp-2 text-lg font-medium leading-7 text-theme-secondary-900">
                    {article.title}
                </h4>
            </div>

            <div className="flex items-center bg-theme-secondary-50 px-6 py-3">
                <span className="mr-2 text-sm font-medium text-theme-secondary-700">
                    {t("pages.articles.featured_collections")}:
                </span>

                <div className="flex">
                    {collections.map((collection) => (
                        <ArticleListItemCollection
                            key={collection.slug}
                            collection={collection}
                        />
                    ))}
                </div>
            </div>
        </a>
    );
};
