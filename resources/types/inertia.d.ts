import { ToastMessage } from "@/Components/Toast";
import { Features } from "@/Types/app";

// So we can use string literals for link methods
declare module "@inertiajs/core" {
    // So we can pass a string literal to the link method
    export type Method = "get" | "post" | "put" | "patch" | "delete";

    export interface PageProps {
        allowsGuests: boolean;
        contactEmail: string;
        analyticsTrackingCode: ?string;
        isEuropeanVisitor: boolean;
        features: Features;
        environment: string;
        testingWallet: string | null;
        auth: App.Data.AuthData;
        reportReasons: {
            [key: string]: string;
        };
        toast: ToastMessage;
        maticToken: App.Data.TokenData;
        allowedExternalDomains: string[];
        error: boolean | undefined;
    }
}
