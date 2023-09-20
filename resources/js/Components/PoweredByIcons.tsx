import { useTranslation } from "react-i18next";
import { Icon } from "@/Components/Icon";

const PoweredByLink = ({ url, icon, title }: { url: string; icon: React.ReactNode; title: string }): JSX.Element => (
    <a
        href={url}
        className="transition-default text-theme-secondary-700 hover:text-theme-primary-700"
        target="_blank"
        rel="noopener nofollow noreferrer"
    >
        <span className="sr-only">{title}</span>
        {icon}
    </a>
);

export const PoweredByIcons = (): JSX.Element => {
    const { t } = useTranslation();

    return (
        <ul className="flex items-center space-x-2">
            <li>
                <PoweredByLink
                    url={t("urls.etherscan")}
                    title="Etherscan"
                    icon={
                        <Icon
                            name="Etherscan"
                            aria-hidden="true"
                        />
                    }
                />
            </li>
            <li>
                <PoweredByLink
                    url={t("urls.coingecko")}
                    title="Coingecko"
                    icon={
                        <Icon
                            name="Coingecko"
                            aria-hidden="true"
                        />
                    }
                />
            </li>
            <li>
                <PoweredByLink
                    url={t("urls.polygonscan")}
                    title="Polygonscan"
                    icon={
                        <Icon
                            name="Polygonscan"
                            aria-hidden="true"
                        />
                    }
                />
            </li>
            <li>
                <PoweredByLink
                    url={t("urls.alchemy")}
                    title="Alchemy"
                    icon={
                        <Icon
                            name="Alchemy"
                            aria-hidden="true"
                        />
                    }
                />
            </li>
            <li>
                <PoweredByLink
                    url={t("urls.moralis")}
                    title="Moralis"
                    icon={
                        <Icon
                            name="Moralis"
                            aria-hidden="true"
                        />
                    }
                />
            </li>
            <li>
                <PoweredByLink
                    url={t("urls.mnemonic")}
                    title="Mnemonic"
                    icon={
                        <Icon
                            name="Mnemonic"
                            aria-hidden="true"
                        />
                    }
                />
            </li>
        </ul>
    );
};
