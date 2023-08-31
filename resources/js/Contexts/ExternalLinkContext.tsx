import { createContext, useContext, useState } from "react";
import { ExternalLinkConfirmModal } from "@/Components/ExternalLinkConfirmModal";
import { isTruthy } from "@/Utils/is-truthy";

interface ContextProperties {
    allowedExternalDomains: string[];
    setUrl?: (url: string) => void;
}

interface ProviderProperties extends ContextProperties {
    children: React.ReactNode;
}

const ExternalLinkContext = createContext<ContextProperties>({
    allowedExternalDomains: [],
});

export const ExternalLinkContextProvider = ({
    children,
    allowedExternalDomains = [],
}: ProviderProperties): JSX.Element => {
    const [url, setUrl] = useState<string | undefined>();

    return (
        <ExternalLinkContext.Provider
            value={{
                allowedExternalDomains,
                setUrl,
            }}
        >
            <div>
                {children}

                <ExternalLinkConfirmModal
                    isOpen={isTruthy(url)}
                    onClose={() => {
                        setUrl(undefined);
                    }}
                    href={url}
                    hasDisabledLinkWarning={localStorage.getItem("has_disabled_link_warning") === "true"}
                    onDisableLinkWarning={() => {
                        localStorage.setItem("has_disabled_link_warning", "true");
                    }}
                />
            </div>
        </ExternalLinkContext.Provider>
    );
};

export const useExternalLinkContext = (): {
    openConfirmationModal: (url: string) => void;
    hasDisabledLinkWarning: boolean;
    isDomainAllowed: (url: string) => boolean;
} => {
    const context = useContext(ExternalLinkContext);

    return {
        isDomainAllowed: (url: string): boolean => context.allowedExternalDomains.includes(new URL(url).hostname),
        hasDisabledLinkWarning: localStorage.getItem("has_disabled_link_warning") === "true",
        openConfirmationModal: (url: string) => {
            context.setUrl?.(url);
        },
    };
};
