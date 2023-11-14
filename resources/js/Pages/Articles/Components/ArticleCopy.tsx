import { IconButton } from "@/Components/Buttons";
import { Clipboard } from "@/Components/Clipboard";

interface Properties {
    article: App.Data.Articles.ArticleData;
}

export const ArticleCopy = ({ article }: Properties): JSX.Element => {
    const url = route("articles.view", { article: article.slug });

    return (
        <Clipboard
            text={url}
            copiedIconClass="group button-icon"
            tooltipPlacement="left"
        >
            <IconButton icon="Copy" />
        </Clipboard>
    );
};
