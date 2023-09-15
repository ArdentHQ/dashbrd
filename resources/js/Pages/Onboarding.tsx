import { Head, router, usePage } from "@inertiajs/react";
import axios from "axios";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Heading } from "@/Components/Heading";
import { OnboardingPanel } from "@/Components/OnboardingPanel";
import { DefaultLayout } from "@/Layouts/DefaultLayout";

const POLLING_INTERVAL = 5000; // 5 seconds

const checkIfOnboarded = async (redirectTo: string): Promise<void> => {
    const response = await axios.get<{
        onboarded: boolean;
    }>(route("onboarding"));

    if (response.data.onboarded) {
        router.get(redirectTo);
    }
};

interface Properties {
    auth: App.Data.AuthData;
    redirectTo: string;
}

const Onboarding = ({ auth, redirectTo }: Properties): JSX.Element => {
    const { props } = usePage();
    const { t } = useTranslation();

    useEffect(() => {
        if (!auth.authenticated) {
            return;
        }

        const interval = setInterval(() => {
            void checkIfOnboarded(redirectTo);
        }, POLLING_INTERVAL);

        return () => {
            clearInterval(interval);
        };
    }, [POLLING_INTERVAL]);

    return (
        <DefaultLayout toastMessage={props.toast}>
            <Head title={t("pages.onboarding.title")} />

            <div className="mx-6 sm:mx-8 2xl:mx-0">
                <Heading level={1}>{t("pages.onboarding.title")}</Heading>

                <div className="flex flex-1 justify-center py-16 sm:py-32">
                    <OnboardingPanel
                        heading={t("pages.onboarding.heading")}
                        subheading={t("pages.onboarding.message")}
                    />
                </div>
            </div>
        </DefaultLayout>
    );
};

export default Onboarding;
