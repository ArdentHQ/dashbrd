import type React from "react";
import { useEffect, useState } from "react";
import { isTruthy } from "@/Utils/is-truthy";

interface ClipboardOptions {
    resetAfter?: number;
    reference?: React.RefObject<HTMLElement>;
    onSuccess?: (data: string) => void;
    onError?: () => void;
}

interface UseClipboardReturnType {
    isCopied: boolean;
    copy: (data: string) => Promise<void>;
}

export const useClipboard = (options?: ClipboardOptions): UseClipboardReturnType => {
    const [isCopied, setHasCopied] = useState(false);

    useEffect(() => {
        if (isCopied && isTruthy(options?.resetAfter)) {
            const handler = setTimeout(
                () => {
                    setHasCopied(false);
                },
                options?.resetAfter,
            );

            return () => {
                clearTimeout(handler);
            };
        }
    }, [isCopied, options?.resetAfter]);

    const copy = async (data: string): Promise<void> => {
        const clipboard: Clipboard | undefined = window.navigator.clipboard;

        if (isTruthy(clipboard)) {
            try {
                await navigator.clipboard.writeText(data);

                setHasCopied(true);

                options?.onSuccess?.(data);
            } catch {
                options?.onError?.();
            }
            return;
        }

        copyUsingExec(data, options?.reference);
    };

    // Fallback for older browsers and non-https environments
    // https://github.com/ArkEcosystem/laravel-foundation/blob/main/resources/assets/js/clipboard.js
    const copyUsingExec = (data: string, reference?: React.RefObject<HTMLElement>): void => {
        const textArea = document.createElement("textarea");
        textArea.value = data;

        // Prevent keyboard from showing on mobile
        textArea.setAttribute("readonly", "");

        // fontSize prevents zooming on iOS
        textArea.style.cssText = "position:absolute;top:0;left:0;z-index:-9999;opacity:0;fontSize:12pt;";

        (reference?.current ?? document.documentElement).append(textArea);

        const isiOSDevice = /ipad|iphone/i.exec(navigator.userAgent);

        if (isiOSDevice != null) {
            const editable = textArea.contentEditable;
            const readOnly = textArea.readOnly;

            textArea.contentEditable = "true";
            textArea.readOnly = false;

            const range = document.createRange();
            range.selectNodeContents(textArea);

            const selection = window.getSelection();

            if (selection != null) {
                selection.removeAllRanges();
                selection.addRange(range);
            }

            textArea.setSelectionRange(0, 999999);
            textArea.contentEditable = editable;
            textArea.readOnly = readOnly;
        } else {
            textArea.select();
            textArea.focus();
        }

        setHasCopied(true);

        document.execCommand("copy");

        textArea.remove();
    };

    return { isCopied, copy };
};
