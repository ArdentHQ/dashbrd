import { t } from "i18next";

const getRangeFilter = (plural: string): RegExpExecArray | null => /^\[(?<from>\d+),(?<to>(\d+|\*))?\]/.exec(plural);

const hasFilter = (plural: string): boolean => /^({|\[)\d+/.test(plural);

const hasFilterForValue = (plural: string, value: number): boolean => new RegExp(`^\\{${value}\\}`).test(plural);

const hasMatches = (plural: string, value: number): boolean => {
    if (hasFilterForValue(plural, value)) {
        return true;
    }

    const filter = getRangeFilter(plural);
    if (filter != null) {
        const rangeFrom = Number(filter.groups?.from);
        const rangeTo: number | null =
            filter.groups?.to !== undefined && filter.groups.to !== "*" ? Number(filter.groups.to) : null;

        if (rangeFrom <= value && (rangeTo === null || rangeTo >= value)) {
            return true;
        }
    }

    return false;
};

const processData = (output: string, data?: Record<string, string | number>): string => {
    output = output.replace(/^({|\[)\d(,((\d+)|\*)?)?(}|\])\s?/, "");
    if (data !== undefined) {
        for (const [key, dataValue] of Object.entries(data)) {
            output = output.replace(`:${key}`, dataValue.toString());
        }
    }

    return output;
};

export const TranslatePlural = (key: string, value: number, data?: Record<string, string | number>): string => {
    const translation = t(key, data ?? {});
    if (!translation.includes("|")) {
        return translation;
    }

    const plurals = translation.split("|");
    for (let [index, plural] of Object.entries(plurals)) {
        plural = plural.trim();
        const pluralHasFilter = hasFilter(plural);

        if (
            (pluralHasFilter && !hasMatches(plural, value)) ||
            (!pluralHasFilter && (Number(index) !== 0 || value !== 1) && (Number(index) !== 1 || value <= 1))
        ) {
            continue;
        }

        return processData(plural, data);
    }

    return translation;
};

export const tp = TranslatePlural;
