import { useTranslation } from "react-i18next";
import { Icon, type IconName } from "@/Components/Icon";

interface Provider {
    url: string;
    icon: IconName;
    title: string;
}

export const PoweredByIcons = (): JSX.Element => {
    const { t } = useTranslation();

    const providers: Provider[] = [
        { title: "Etherscan", icon: "Etherscan", url: t("urls.etherscan") },
        { title: "Coingecko", icon: "Coingecko", url: t("urls.coingecko") },
        { title: "Polygonscan", icon: "Polygonscan", url: t("urls.polygonscan") },
        { title: "Alchemy", icon: "Alchemy", url: t("urls.alchemy") },
        { title: "Moralis", icon: "Moralis", url: t("urls.moralis") },
        { title: "Mnemonic", icon: "Mnemonic", url: t("urls.mnemonic") },
        { title: "OpenSea", icon: "OpenseaCircle", url: t("urls.opensea") },
    ];

    return (
        <ul className="flex items-center space-x-2">
            {providers.map(({ title, icon, url }, index) => (
                <li key={index}>
                    <PoweredByLink
                        url={url}
                        title={title}
                        icon={icon}
                    />
                </li>
            ))}
        </ul>
    );
};

const PoweredByLink = ({ url, icon, title }: Provider): JSX.Element => (
    <a
        href={url}
        className="transition-default text-theme-secondary-700 hover:text-theme-primary-700 dark:text-theme-dark-200 dark:hover:text-theme-dark-300"
        target="_blank"
        rel="noopener nofollow noreferrer"
    >
        <span className="sr-only">{title}</span>

        <Icon
            name={icon}
            aria-hidden="true"
        />
    </a>
);
