import { useTranslation } from "react-i18next";
import { ArticleCopy } from "./ArticleCopy";
import { ButtonLink } from "@/Components/Buttons/ButtonLink";
import { Tooltip } from "@/Components/Tooltip";

interface Properties extends React.AnchorHTMLAttributes<HTMLUListElement> {
    article: App.Data.Articles.ArticleData;
}

const ShareTooltip = ({ platform, children }: { platform: string; children: JSX.Element }): JSX.Element => {
    const { t } = useTranslation();

    return (
        <Tooltip
            content={t("common.share_on", {
                platform,
            })}
            placement="left"
        >
            {children}
        </Tooltip>
    );
};

export const ArticleShare = ({ article, ...properties }: Properties): JSX.Element => {
    const url = route("articles.view", { article: article.slug });

    const { t } = useTranslation();

    const titleUrlQuery = new URLSearchParams({ title: article.title, url }).toString();

    const urlQuery = new URLSearchParams({ url }).toString();

    return (
        <ul {...properties}>
            <li>
                <ShareTooltip platform={t("common.x")}>
                    <ButtonLink
                        variant="icon"
                        href={`https://twitter.com/intent/tweet?${titleUrlQuery}`}
                        icon="Twitter"
                        target="_blank"
                    />
                </ShareTooltip>
            </li>
            <li>
                <ShareTooltip platform={t("common.facebook")}>
                    <ButtonLink
                        variant="icon"
                        href={`https://www.facebook.com/sharer/sharer.php?u=${url}`}
                        icon="Facebook"
                        target="_blank"
                    />
                </ShareTooltip>
            </li>
            <li>
                <ShareTooltip platform={t("common.reddit")}>
                    <ButtonLink
                        variant="icon"
                        href={`https://www.reddit.com/submit?${urlQuery}`}
                        icon="Reddit"
                        target="_blank"
                    />
                </ShareTooltip>
            </li>

            <li>
                <ArticleCopy article={article} />
            </li>
        </ul>
    );
};
