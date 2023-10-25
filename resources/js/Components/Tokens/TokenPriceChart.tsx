import { Transition } from "@headlessui/react";
import { type Chart, type ChartData } from "chart.js";
import maxBy from "lodash/maxBy";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { Line } from "react-chartjs-2";
import { useTranslation } from "react-i18next";
import { Icon } from "@/Components/Icon";
import { Toast } from "@/Components/Toast";
import {
    buildChartOptions,
    buildGetTooltipLabel,
    buildGetTooltipTitle,
    buildGetXTickLabel,
    buildGetYTickLabel,
    chartColors,
    determineIfTimestampGroupChanged,
} from "@/Components/Tokens/TokenPriceChart.helpers";
import { type Period } from "@/Components/Tokens/Tokens.contracts";
import { useAuth } from "@/Contexts/AuthContext";
import { useDarkModeContext } from "@/Contexts/DarkModeContex";
import { type DateFormat } from "@/Types/enums";
import { getPriceHistory } from "@/Utils/api";
import { assertUser } from "@/Utils/assertions";
import { formatTimestampForPeriod } from "@/Utils/dates";

// Used to define the number of points to be displayed on the chart
const SAMPLE_SIZE = 40;

interface Properties extends React.HTMLAttributes<HTMLDivElement> {
    token: App.Data.TokenListItemData;
    period: Period;
}

type ChartReference = Chart<"line", number[], number>;

export const TokenPriceChart = ({ token, period, ...properties }: Properties): JSX.Element => {
    const { t } = useTranslation();

    const { user } = useAuth();

    const { isDark } = useDarkModeContext();

    assertUser(user);

    const chartReference = useRef<ChartReference>();

    const [gradient, setGradient] = useState<CanvasGradient>();
    const [loading, setLoading] = useState(false);
    const [errored, setErrored] = useState(false);
    const [apiData, setApiData] = useState<{
        [key in Period]?: App.Data.PriceHistoryData[];
    }>();
    const [ready, setReady] = useState(false);
    const [data, setData] = useState<ChartData<"line", number[], number> | null>(null);

    useEffect(() => {
        if (!ready || chartReference.current === undefined) {
            return;
        }

        const gradient = chartReference.current.ctx.createLinearGradient(0, 25, 0, 300);

        gradient.addColorStop(0, chartColors.primary.quarter);
        gradient.addColorStop(0.5, chartColors.primary.zero);

        setGradient(gradient);
    }, [ready]);

    const periodData = useMemo(() => apiData?.[period], [apiData, period]);

    const formattedTimeLabels = useMemo(() => {
        if (periodData === undefined) {
            return [];
        }

        return periodData.map(({ timestamp }, index) => {
            const date = new Date(timestamp);

            if (determineIfTimestampGroupChanged({ date, periodData, index, period })) {
                date.setMinutes(0);

                return formatTimestampForPeriod({
                    timestamp: date.getTime(),
                    timezone: user.attributes.timezone,
                    dateFormat: user.attributes.date_format as DateFormat,
                    timeFormat: user.attributes.time_format,
                    period,
                    short: true,
                });
            }

            return null;
        });
    }, [periodData, period]);

    const options = useMemo(() => {
        if (periodData === undefined) {
            return;
        }

        const maxValue = maxBy(periodData, "price")?.price ?? 0;

        return buildChartOptions({
            maxValue,
            yTickStepSize: Math.max(maxValue / 1000, 0.025),
            getYTickLabel: buildGetYTickLabel({ t, currency: user.attributes.currency }),
            getXTickLabel: buildGetXTickLabel({ formattedTimeLabels }),
            getTooltipTitle: buildGetTooltipTitle({
                period,
                periodData,
                timezone: user.attributes.timezone,
                dateFormat: user.attributes.date_format as DateFormat,
                timeFormat: user.attributes.time_format,
            }),
            getTooltipLabel: buildGetTooltipLabel({ t, currency: user.attributes.currency }),
        });
    }, [periodData, formattedTimeLabels]);

    useEffect(() => {
        if (periodData === undefined) {
            setLoading(true);

            return;
        }

        setData({
            labels: Array.from({ length: periodData.length }).map((_, index) => index),
            datasets: [
                {
                    data: periodData.map((item) => item.price),
                    borderColor: chartColors.primary.default,
                    pointRadius: 0,
                    borderWidth: 2,
                    backgroundColor: gradient,
                    fill: true,
                    clip: 10,
                    pointHoverRadius: 5,
                    pointHoverBorderColor: isDark ? "#3D444D" : "#fff",
                    pointHoverBorderWidth: 2,
                    pointHoverBackgroundColor: chartColors.primary.default,
                },
            ],
        });

        setLoading(false);
    }, [gradient, periodData]);

    const requiresDataLoad = useMemo(() => apiData?.[period] === undefined, [apiData, period]);

    useEffect(() => {
        setErrored(false);

        if (!requiresDataLoad) {
            return;
        }

        const loadHistory = async (): Promise<void> => {
            try {
                const data = await getPriceHistory({
                    token: token.symbol,
                    currency: user.attributes.currency,
                    period,
                    sample: SAMPLE_SIZE,
                });

                setApiData((previous) => ({
                    ...previous,
                    [period]: data,
                }));
            } catch (error) {
                setErrored(true);
            } finally {
                // Due to other checks in the template, chart won't render if we don't give it a "next tick" to mount to element to DOM...
                setTimeout(() => {
                    setReady(true);
                }, 10);
            }
        };

        void loadHistory();
    }, [token, period, requiresDataLoad]);

    if (errored) {
        return (
            <div
                {...properties}
                data-testid="TokenPriceChart"
            >
                <Toast
                    type="error"
                    className="w-full"
                    message={t("pages.token_panel.chart.failed")}
                    data-testid="TokenPriceChart__error"
                />
            </div>
        );
    }

    return (
        <div
            {...properties}
            data-testid="TokenPriceChart"
            className="relative -m-2 h-60 sm:h-72" // Height has to be hardcoded because we render the initial loading state before chart is created, so we need to "guess" how tall the chart will be... So things don't jump around...
        >
            <InitialLoadingIndicator show={!ready} />

            {data !== null && (
                <div className="relative z-10 h-full">
                    <TransientLoadingIndicator show={loading} />

                    <Line
                        data-testid="TokenPriceChart__chart"
                        ref={chartReference}
                        data={data}
                        options={options}
                    />
                </div>
            )}
        </div>
    );
};

const TransientLoadingIndicator = ({ show }: { show: boolean }): JSX.Element => (
    <ChartTransition
        show={show}
        className="absolute inset-0 flex items-center justify-center backdrop-blur-sm"
        data-testid="TokenPriceChart__transient__loader"
    >
        <Icon
            name="Spinner"
            className="animate-spin text-theme-secondary-800"
            size="2xl"
        />
    </ChartTransition>
);

const InitialLoadingIndicator = ({ show }: { show: boolean }): JSX.Element => (
    <ChartTransition
        show={show}
        className="absolute inset-0 z-20 flex items-center justify-center bg-white dark:bg-theme-dark-900"
        data-testid="TokenPriceChart__loading"
    >
        <Icon
            name="Spinner"
            className="animate-spin text-theme-secondary-500 dark:text-theme-dark-200"
            size="2xl"
        />
    </ChartTransition>
);

const ChartTransition = ({
    children,
    show,
    className,
}: {
    children: ReactNode;
    show: boolean;
    className?: string;
}): JSX.Element => (
    <Transition
        show={show}
        enter="transition-opacity duration-200"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-300"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
        as="div"
        className={className}
    >
        {children}
    </Transition>
);
