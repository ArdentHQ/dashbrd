import { useTranslation } from "react-i18next";
import { ErrorContent } from "./ErrorBlock.blocks";
import { Error401, Error403, Error404, Error419, Error429, Error500, Error503 } from "@/images";

export interface ErrorBlockProperties {
    contactEmail: string;
    statusCode: 404 | 401 | 403 | 419 | 429 | 500 | 503;
}

export const ErrorBlock = ({ contactEmail, statusCode }: ErrorBlockProperties): JSX.Element => {
    const { t } = useTranslation();

    const isMaintenance = statusCode === 503;

    const ErrorImage = {
        404: Error404,
        401: Error401,
        403: Error403,
        419: Error419,
        429: Error429,
        500: Error500,
        503: Error503,
    }[statusCode];

    return (
        <>
            <ErrorImage className="w-full max-w-full" />

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
