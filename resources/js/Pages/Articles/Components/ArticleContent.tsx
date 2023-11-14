/* eslint-disable unicorn/no-array-for-each */
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import Markdown from "react-markdown";
import rehypeExternalLinks from "rehype-external-links";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import tippy, { inlinePositioning } from "tippy.js";
import { useDarkModeContext } from "@/Contexts/DarkModeContext";
import { extractDomain } from "@/Utils/extract-domain";
import { remarkFigurePlugin } from "@/Utils/Remark/remarkFigurePlugin";

interface Properties {
    article: App.Data.Articles.ArticleData;
}

const externalIcon = `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M11.3986 3.85949V0.601562H8.14062" stroke="#72768E" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M11.3982 0.601562L4.21875 7.78106" stroke="#72768E" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M5.85128 2.39844H1.35152C0.976542 2.39844 0.601562 2.77342 0.601562 3.1484V10.648C0.601562 11.023 0.976542 11.398 1.35152 11.398H8.85112C9.2261 11.398 9.60108 11.023 9.60108 10.648V6.14824" stroke="#72768E" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

export const ArticleContent = ({ article }: Properties): JSX.Element => {
    const { t } = useTranslation();
    const { isDark } = useDarkModeContext();
  
    useEffect(() => {
        const links = document.querySelectorAll<HTMLAnchorElement>(".article-content a[target=_blank]");

        links.forEach((link) => {
            let domain: string;

            try {
                domain = extractDomain(link.href);
            } catch (error) {
                // Invalid domain, should not happen but showing "External Link"
                // just in case.
                domain = t("common.external_link").toString();
            }

            tippy(link, {
                content: `<span class="flex space-x-1.5 py-1 items-center">
                    <span class="text-sm font-medium">${domain}</span>
                    ${externalIcon}
                </span>`,
                theme: isDark ? "dark" : "light",
                allowHTML: true,
                inlinePositioning: true,
                plugins: [inlinePositioning],
            });
        });

        return () => {
            links.forEach((link) => {
                tippy(link).destroy();
            });
        };
    }, [isDark]);

    return (
        <div className="article-content">
            <Markdown
                rehypePlugins={[rehypeRaw, [rehypeExternalLinks, { target: "_blank" }]]}
                remarkPlugins={[remarkFigurePlugin, remarkGfm]}
                skipHtml
            >
                {article.content}
            </Markdown>
        </div>
    );
};
