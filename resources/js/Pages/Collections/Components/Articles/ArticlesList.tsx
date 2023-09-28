import { ArticleListItem } from "@/Components/Articles/ArticleListItem";

export const ArticlesList = (): JSX.Element => (
    <div className="-mx-6 space-y-2 sm:-mx-8 lg:mx-0">
        {Array.from({ length: 20 })
            .fill([])
            .map((_, index) => (
                <ArticleListItem
                    key={index}
                    article={{
                        title: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centurie",
                    }}
                    collections={[
                        {
                            slug: "hello",
                            image: "https://res.cloudinary.com/alchemyapi/image/upload/w_512,h_512/thumbnailv2/eth-mainnet/eca1c33c4e569ce7c4dee9a477ad945e",
                        },
                    ]}
                />
            ))}
    </div>
);
