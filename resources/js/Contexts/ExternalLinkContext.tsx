import { createContext, useContext, useState } from "react";
import { ExternalLinkConfirmModal } from "@/Components/ExternalLinkConfirmModal";

interface ContextProperties {
    allowedExternalDomains: string[];
    setUrl?: (url: string) => void;
    setOpen?: (open: boolean) => void;
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
    const [open, setOpen] = useState(false);

    return (
        <ExternalLinkContext.Provider
            value={{
                allowedExternalDomains,
                setUrl,
                setOpen,
            }}
        >
            <div>
                {children}

                <ExternalLinkConfirmModal
                    isOpen={open}
                    onClose={() => {
                        setOpen(false);
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
            context.setOpen?.(true);
            context.setUrl?.(url);
        },
    };
};
