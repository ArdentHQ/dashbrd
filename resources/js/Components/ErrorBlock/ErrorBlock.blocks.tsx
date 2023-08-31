import { useTranslation } from "react-i18next";
import { ButtonLink } from "@/Components/Buttons/ButtonLink";
import { Heading } from "@/Components/Heading";
import { isTruthy } from "@/Utils/is-truthy";

export const ErrorContent = ({
    title,
    description,
    contactEmail,
    showActionButtons = true,
}: {
    title?: string;
    description?: string;
    contactEmail?: string;
    showActionButtons?: boolean;
}): JSX.Element => {
    const { t } = useTranslation();

    return (
        <div
            className="mt-8 text-center"
            data-testid="ErrorContent"
        >
            <Heading level={1}>{title}</Heading>
            <p className="text-sm text-theme-secondary-700 md:text-lg">{description}</p>

            {showActionButtons && (
                <div className="mt-6 flex flex-col space-y-3 sm:flex-row sm:justify-center sm:space-x-3 sm:space-y-0">
                    {isTruthy(contactEmail) && (
                        <ButtonLink
                            className="w-full justify-center sm:w-auto"
                            variant="primary"
                            href={`mailto:${contactEmail}`}
                        >
                            {t("common.contact")}
                        </ButtonLink>
                    )}

                    <ButtonLink
                        className="w-full justify-center sm:w-auto"
                        variant="primary"
                        href={t("urls.landing")}
                    >
                        {t("common.home")}
                    </ButtonLink>
                </div>
            )}
        </div>
    );
};
