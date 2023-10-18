import { ButtonLink } from "@/Components/Buttons/ButtonLink";

interface Properties extends React.AnchorHTMLAttributes<HTMLUListElement> {
    article: App.Data.Articles.ArticleData;
}

export const ArticleShare = ({ article, ...properties }: Properties): JSX.Element => {
    const url = route("articles.view", { article: article.slug });

    const titleUrlQuery = new URLSearchParams({ title: article.title, url }).toString();

    const urlQuery = new URLSearchParams({ url }).toString();

    return (
        <ul {...properties}>
            <li>
                <ButtonLink
                    variant="icon"
                    href={`https://twitter.com/intent/tweet?${titleUrlQuery}`}
                    icon="Twitter"
                    target="_blank"
                />
            </li>
            <li>
                <ButtonLink
                    variant="icon"
                    href={`https://www.facebook.com/sharer/sharer.php?u=${url}`}
                    icon="Facebook"
                    target="_blank"
                />
            </li>
            <li>
                <ButtonLink
                    variant="icon"
                    href={`https://www.reddit.com/submit?${urlQuery}`}
                    icon="Reddit"
                    target="_blank"
                />
            </li>
        </ul>
    );
};
