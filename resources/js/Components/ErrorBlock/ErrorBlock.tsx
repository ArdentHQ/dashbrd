import { useTranslation } from "react-i18next";
import { ErrorContent } from "./ErrorBlock.blocks";
import { useDarkModeContext } from "@/Contexts/DarkModeContex";
import {
    Error401,
    Error401Dark,
    Error403,
    Error403Dark,
    Error404,
    Error404Dark,
    Error419,
    Error419Dark,
    Error429,
    Error429Dark,
    Error500,
    Error500Dark,
    Error503,
    Error503Dark,
} from "@/images";

export interface ErrorBlockProperties {
    contactEmail: string;
    statusCode: 404 | 401 | 403 | 419 | 429 | 500 | 503;
}

export const ErrorBlock = ({ contactEmail, statusCode }: ErrorBlockProperties): JSX.Element => {
    const { t } = useTranslation();
    const { isDark } = useDarkModeContext();

    const isMaintenance = statusCode === 503;

    const ErrorImage = {
        404: isDark ? Error404Dark : Error404,
        401: isDark ? Error401Dark : Error401,
        403: isDark ? Error403Dark : Error403,
        419: isDark ? Error419Dark : Error419,
        429: isDark ? Error429Dark : Error429,
        500: isDark ? Error500Dark : Error500,
        503: isDark ? Error503Dark : Error503,
    }[statusCode];

    return (
        <>
            <ErrorImage
                className="w-full max-w-full"
                data-testid={`Error__Image${statusCode}${isDark ? "Dark" : "Light"}`}
            />

            {isMaintenance && (
                <ErrorContent
                    title={t("pages.maintenance.title")}
                    description={t("pages.maintenance.description")}
                    showActionButtons={false}
                />
            )}

            {!isMaintenance && (
                <ErrorContent
                    title={t("pages.error.heading")}
                    description={t("pages.error.message")}
                    contactEmail={contactEmail}
                />
            )}
        </>
    );
};
