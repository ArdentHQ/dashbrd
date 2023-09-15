import { type PageProps } from "@inertiajs/core";
import { Head } from "@inertiajs/react";
import { useTranslation } from "react-i18next";
import { ErrorBlock, type ErrorBlockProperties } from "@/Components/ErrorBlock";
import { DefaultLayout } from "@/Layouts/DefaultLayout";

const Error = ({ contactEmail, statusCode }: ErrorBlockProperties & PageProps): JSX.Element => {
    const { t } = useTranslation();

    return (
        <DefaultLayout
            wrapperClassName="flex-1 flex items-center justify-center mx-6 sm:mx-8 2xl:mx-0"
            isMaintenanceModeActive={statusCode === 503}
        >
            <Head
                title={t("metatags.error.title", {
                    code: statusCode,
                })}
            />

            <div className="w-full max-w-[680px]">
                <ErrorBlock
                    statusCode={statusCode}
                    contactEmail={contactEmail}
                />
            </div>
        </DefaultLayout>
    );
};

export default Error;
