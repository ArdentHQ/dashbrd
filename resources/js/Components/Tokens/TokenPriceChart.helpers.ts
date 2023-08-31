import { type ChartOptions, type Tick, type TooltipItem } from "chart.js";
import { type TFunction } from "i18next";
import defaultTheme from "tailwindcss/defaultTheme";
import { Period } from "@/Components/Tokens/Tokens.contracts";
import { type DateFormat } from "@/Types/enums";
import { browserLocale } from "@/Utils/browser-locale";
import { formatFiat } from "@/Utils/Currency";
import { formatTimestampForPeriod } from "@/Utils/dates";
export const chartColors = {
    primary: {
        default: "rgba(80, 96, 238, 1)",
        quarter: "rgba(80, 96, 238, 0.2)",
        zero: "rgba(80, 96, 238, 0)",
    },
};

const labelFont = {
    size: 12,
    weight: "500",
    color: chartColors.primary.default,
    family: ["Ubuntu", ...defaultTheme.fontFamily.sans].join(", "),
};

interface BuildOptionsParameters {
    getTooltipTitle: (tooltipItems: Array<TooltipItem<"line">>) => string;
    getTooltipLabel: (tooltipItem: TooltipItem<"line">) => string;
    getYTickLabel: (tickValue: string | number, index: number, ticks: Tick[]) => string;
    getXTickLabel: (tickValue: string | number, index: number, ticks: Tick[]) => string | null;
    yTickStepSize: number;
    maxValue: number;
}

export const buildChartOptions = ({
    getTooltipTitle,
    getTooltipLabel,
    getYTickLabel,
    getXTickLabel,
    yTickStepSize,
    maxValue,
}: BuildOptionsParameters): ChartOptions<"line"> => ({
    layout: {
        padding: {
            right: 8,
        },
    },
    plugins: {
        legend: {
            display: false,
        },
        tooltip: {
            enabled: true,
            caretPadding: 7,
            mode: "nearest",
            axis: "x",
            intersect: false,
            displayColors: false,
            titleFont: {
                weight: "400",
            },
            bodyFont: {
                weight: "600",
            },
            callbacks: {
                title: getTooltipTitle,
                label: getTooltipLabel,
            },
        },
    },
    hover: {
        mode: "nearest",
        intersect: false,
        axis: "x",
    },
    scales: {
        y: {
            suggestedMax: maxValue,
            ticks: {
                color: "rgba(178, 181, 204, 1)",
                font: labelFont,
                padding: 8,
                maxTicksLimit: 5,
                stepSize: yTickStepSize,
                callback: getYTickLabel,
            },
            grid: {
                drawTicks: false,
                color: "rgba(226, 227, 241, 1)",
            },
            border: {
                display: false,
                dash: [4, 4],
            },
        },
        x: {
            grid: {
                display: false,
            },
            ticks: {
                color: "rgba(178, 181, 204, 1)",
                maxRotation: 0,
                minRotation: 0,
                font: labelFont,
                padding: 8,
                maxTicksLimit: 7,
                autoSkip: true,
                autoSkipPadding: 0,
                callback: getXTickLabel,
            },
            border: {
                display: false,
            },
        },
    },
    responsive: true,
    maintainAspectRatio: false,
});

export const buildGetYTickLabel =
    ({
        t,
        currency,
    }: {
        t: TFunction<"translation", undefined, "translation">;
        currency: string;
    }): BuildOptionsParameters["getYTickLabel"] =>
    (tickValue) =>
        t("format.fiat", {
            value: tickValue,
            currency,
            formatParams: {
                value: {
                    lng: browserLocale(),
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2,
                    notation: "compact",
                    short: true,
                },
            },
        });

export const buildGetXTickLabel =
    ({ formattedTimeLabels }: { formattedTimeLabels: Array<string | null> }): BuildOptionsParameters["getXTickLabel"] =>
    (_, index) =>
        formattedTimeLabels[index];

export const buildGetTooltipTitle =
    ({
        periodData,
        timezone,
        dateFormat,
        timeFormat,
        period,
    }: {
        periodData: App.Data.PriceHistoryData[];
        timezone: string;
        dateFormat: DateFormat;
        timeFormat: "12" | "24";
        period: Period;
    }): BuildOptionsParameters["getTooltipTitle"] =>
    (tooltipItems) => {
        const [tooltipItem] = tooltipItems;

        const { timestamp } = periodData[tooltipItem.dataIndex];

        return formatTimestampForPeriod({
            timestamp,
            timezone,
            dateFormat,
            timeFormat,
            period,
        });
    };

export const buildGetTooltipLabel =
    ({
        t,
        currency,
    }: {
        t: TFunction<"translation", undefined, "translation">;
        currency: string;
    }): BuildOptionsParameters["getTooltipLabel"] =>
    (tooltipItem) =>
        formatFiat({
            t,
            value: (tooltipItem.raw as number).toString(),
            currency,
        });

/**
 * Used to determine if we should add a label for a specific point in the chart
 */
export const determineIfTimestampGroupChanged = ({
    date,
    periodData,
    index,
    period,
}: {
    date: Date;
    periodData: App.Data.PriceHistoryData[];
    index: number;
    period: Period;
}): boolean => {
    // If is a day we consider that the timestamp group changed if the hour
    // is different from the previous one
    if (period === Period.DAY) {
        if (index === 0) {
            // If first element return the value if is the beginning of the hour
            return date.getMinutes() === 0;
        }

        // Get the hour from the previous timestamp
        const hour = date.getHours();
        const previousHour = new Date(periodData[index - 1].timestamp).getHours();

        return hour !== previousHour;
        // Any other period we consider that the timestamp group changed if the day
        // is different from the previous one
    } else {
        if (index === 0) {
            return true;
        }

        // Get the day from the previous timestamp
        const day = date.getDate();
        const previousDay = new Date(periodData[index - 1].timestamp).getDate();

        return day !== previousDay;
    }
};
