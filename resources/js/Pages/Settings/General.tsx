import { type PageProps } from "@inertiajs/core";
import { Head, useForm, usePage } from "@inertiajs/react";
import { type FormEvent, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Layout from "./Layout";
import { SetDefaultsButton } from "./SetDefaultsButton";
import { Button } from "@/Components/Buttons/Button";
import { InputGroup } from "@/Components/Form/InputGroup";
import { Listbox } from "@/Components/Form/Listbox";
import { Form } from "@/Pages/Settings/Form";

interface Currency {
    name: string;
    code: string;
    symbol: string;
}

interface Timezone {
    key: string;
    label: string;
}

interface DateFormat {
    key: string;
    label: string;
    default: boolean;
}

interface Properties {
    currencies: Currency[];
    timezones: Timezone[];
    dateFormats: DateFormat[];
    auth: PageProps["auth"];
    title: string;
}

const General = ({ auth, currencies, timezones, dateFormats, title }: Properties): JSX.Element => {
    const { t } = useTranslation();
    const user = auth.user as App.Data.UserData;
    const { props } = usePage();

    const [loading, setLoading] = useState(false);

    const { data, setData, put, processing, errors } = useForm({
        currency: user.attributes.currency,
        date_format: user.attributes.date_format,
        time_format: user.attributes.time_format,
        timezone: user.attributes.timezone,
    });

    const activeCurrency = useMemo(
        () => currencies.filter((currency) => currency.code === data.currency)[0],
        [data.currency],
    );

    const activeDateFormat = useMemo(
        () => dateFormats.filter((format) => format.key === data.date_format)[0],
        [data.date_format],
    );

    const activeTimezone = useMemo(
        (): Timezone => timezones.filter((tz) => tz.key === data.timezone)[0],
        [data.timezone],
    );

    const resetToDefaults = (closeModal: () => void): void => {
        data.currency = "USD";
        data.date_format = dateFormats.filter((format) => format.default)[0].key;
        data.time_format = "24";
        data.timezone = "UTC";

        put(route("settings.general"), {
            onFinish: () => {
                closeModal();
            },
        });
    };

    const formActions = (): JSX.Element => (
        <>
            <SetDefaultsButton
                onConfirm={resetToDefaults}
                isDisabled={processing}
            />

            <Button
                type="submit"
                className="w-1/2 justify-center whitespace-nowrap px-0 sm:w-auto sm:px-5"
                variant="primary"
                disabled={loading}
            >
                {t("pages.settings.general.save")}
            </Button>
        </>
    );

    const submit = (event: FormEvent): void => {
        event.preventDefault();

        setLoading(true);

        put(route("settings.general"), {
            onFinish: () => {
                setLoading(false);
            },
        });
    };

    return (
        <Layout
            title="General"
            toastMessage={props.toast}
        >
            <Head title={title} />

            <Form
                onSubmit={submit}
                footer={formActions()}
            >
                <Form.Section
                    title={t("pages.settings.general.currency")}
                    subtitle={t("pages.settings.general.currency_subtitle")}
                >
                    <div>
                        <InputGroup
                            label={t("pages.settings.general.currency").toString()}
                            error={errors.currency}
                        >
                            {({ hasError }) => (
                                <Listbox
                                    value={data.currency}
                                    label={`${activeCurrency.code} (${activeCurrency.symbol})`}
                                    onChange={(value) => {
                                        setData("currency", value);
                                    }}
                                    hasError={hasError}
                                >
                                    {currencies.map((currency, index) => (
                                        <Listbox.Option
                                            value={currency.code}
                                            key={index}
                                        >
                                            {currency.code} ({currency.symbol})
                                        </Listbox.Option>
                                    ))}
                                </Listbox>
                            )}
                        </InputGroup>
                    </div>
                </Form.Section>

                <Form.Separator />

                <Form.Section
                    title={t("pages.settings.general.time_date")}
                    subtitle={t("pages.settings.general.time_date_subtitle")}
                >
                    <div className="space-y-4">
                        <div>
                            <InputGroup
                                label={t("pages.settings.general.date_format").toString()}
                                error={errors.date_format}
                            >
                                {({ hasError }) => (
                                    <Listbox
                                        value={data.date_format}
                                        label={activeDateFormat.label}
                                        onChange={(value) => {
                                            setData("date_format", value);
                                        }}
                                        hasError={hasError}
                                    >
                                        {dateFormats.map((format, index) => (
                                            <Listbox.Option
                                                value={format.key}
                                                key={index}
                                            >
                                                {format.label}
                                            </Listbox.Option>
                                        ))}
                                    </Listbox>
                                )}
                            </InputGroup>
                        </div>

                        <div>
                            <InputGroup
                                label={t("pages.settings.general.time_format").toString()}
                                error={errors.time_format}
                            >
                                {({ hasError }) => (
                                    <Listbox
                                        value={data.time_format}
                                        label={data.time_format === "12" ? "12h" : "24h"}
                                        onChange={(value) => {
                                            setData("time_format", value);
                                        }}
                                        hasError={hasError}
                                    >
                                        <Listbox.Option value="12">12h</Listbox.Option>
                                        <Listbox.Option value="24">24h</Listbox.Option>
                                    </Listbox>
                                )}
                            </InputGroup>
                        </div>

                        <div>
                            <InputGroup
                                label={t("pages.settings.general.timezone").toString()}
                                error={errors.timezone}
                            >
                                {({ hasError }) => (
                                    <Listbox
                                        value={data.timezone}
                                        label={activeTimezone.label}
                                        onChange={(value) => {
                                            setData("timezone", value);
                                        }}
                                        hasError={hasError}
                                    >
                                        {timezones.map((tz, index) => (
                                            <Listbox.Option
                                                value={tz.key}
                                                key={index}
                                            >
                                                {tz.label}
                                            </Listbox.Option>
                                        ))}
                                    </Listbox>
                                )}
                            </InputGroup>
                        </div>
                    </div>
                </Form.Section>
            </Form>
        </Layout>
    );
};

export default General;
