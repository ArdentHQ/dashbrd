import { DateTime } from "@ardenthq/sdk-intl";
import { Period } from "@/Components/Tokens/Tokens.contracts";
import { DateFormat } from "@/Types/enums";

export const getTimestampParts = ({
    timestamp,
    timezone,
    options,
}: {
    timestamp: number;
    timezone: string;
    options?: Omit<Intl.DateTimeFormatOptions, "timeZone">;
}): Record<Intl.DateTimeFormatPartTypes, string> => {
    const date = new Date(timestamp);

    const formatter = new Intl.DateTimeFormat(undefined, {
        timeZone: timezone,
        ...options,
    });

    const parts: Record<Intl.DateTimeFormatPartTypes, string> | Record<string, string> = {};

    for (const { type, value } of formatter.formatToParts(date)) {
        if (type !== "literal") {
            parts[type] = value;
        }
    }

    return parts;
};

const getMonthFormat = (dateFormat?: DateFormat): "2-digit" | "short" =>
    dateFormat === DateFormat.A || dateFormat === DateFormat.B ? "2-digit" : "short";

const getMonthDelimiter = (dateFormat: DateFormat): string => {
    if (dateFormat === DateFormat.A || dateFormat === DateFormat.B) {
        return "/";
    }

    return " ";
};

export const formatTimestamp = (timestamp: number, format: DateFormat = "d M Y" as DateFormat): string =>
    DateTime.fromUnix(timestamp).format(format);

const getYearDelimiter = (dateFormat: DateFormat): string => {
    if (dateFormat === DateFormat.D) {
        return ", ";
    }

    return getMonthDelimiter(dateFormat);
};

const buildHourMinute = (parts: Record<Intl.DateTimeFormatPartTypes, string>, timeFormat: string): string => {
    if (timeFormat === "12") {
        return `${parts.hour}:${parts.minute} ${parts.dayPeriod}`;
    }

    return `${parts.hour}:${parts.minute}`;
};

const buildDayMonth = (parts: Record<Intl.DateTimeFormatPartTypes, string>, dateFormat: DateFormat): string => {
    let result = [parts.day, parts.month];

    if (dateFormat === DateFormat.B || dateFormat === DateFormat.D) {
        result = result.reverse();
    }

    return result.join(getMonthDelimiter(dateFormat));
};

export const formatTimestampForPeriod = ({
    timestamp,
    timezone,
    dateFormat,
    timeFormat,
    period,
    short = false,
}: {
    timestamp: number;
    timezone: string;
    dateFormat: DateFormat;
    timeFormat: "12" | "24";
    period: Period;
    short?: boolean;
}): string => {
    if (period === Period.DAY) {
        const parts = getTimestampParts({
            timestamp,
            timezone,
            options: {
                hour: "2-digit",
                minute: "2-digit",
                hour12: timeFormat === "12",
            },
        });

        return buildHourMinute(parts, timeFormat);
    }

    if (short) {
        const parts = getTimestampParts({
            timestamp,
            timezone,
            options: {
                day: "2-digit",
                month: getMonthFormat(dateFormat),
            },
        });

        return buildDayMonth(parts, dateFormat);
    }

    if (period === Period.WEEK) {
        const parts = getTimestampParts({
            timestamp,
            timezone,
            options: {
                day: "2-digit",
                month: getMonthFormat(dateFormat),
                year: "numeric",

                hour: "2-digit",
                minute: "2-digit",
                hour12: timeFormat === "12",
            },
        });

        return `${buildDayMonth(parts, dateFormat)}${getYearDelimiter(dateFormat)}${parts.year} ${buildHourMinute(
            parts,
            timeFormat,
        )}`;
    }

    const parts = getTimestampParts({
        timestamp,
        timezone,
        options: {
            day: "2-digit",
            month: getMonthFormat(dateFormat),
            year: "numeric",
        },
    });

    return `${buildDayMonth(parts, dateFormat)}${getYearDelimiter(dateFormat)}${parts.year}`;
};

export const toHuman = (
    date: number,
    options: Pick<App.Data.Attributes, "date_format" | "timezone" | "time_format">,
): string => {
    const dateFormat = options.date_format as DateFormat;

    const parts = getTimestampParts({
        timestamp: date,
        timezone: options.timezone,
        options: {
            hour12: options.time_format === "12",
            day: "2-digit",
            month: getMonthFormat(dateFormat),
            year: "numeric",
            minute: "2-digit",
            hour: "2-digit",
            second: "2-digit",
        },
    });

    return `${buildDayMonth(parts, dateFormat)}${getYearDelimiter(dateFormat)}${parts.year}, ${buildHourMinute(
        parts,
        options.time_format,
    )}`;
};

/**
 * Formats as `Jan 2023`
 */
export const toMonthYear = (timestamp: number, options: { timezone: string }): string => {
    const date = new Date(timestamp);

    const formatter = new Intl.DateTimeFormat("en", {
        year: "numeric",
        month: "short",
        timeZone: options.timezone,
    });

    return formatter.format(date);
};
