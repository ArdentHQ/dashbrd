export const toTwitterHashtag = (value: string | undefined | null): string => {
    if (value === undefined || value === null || value === "") {
        return "";
    }

    const result = value.toLowerCase().replace(/[^a-zA-Z0-9]/g, "");

    if (result === "") {
        return "";
    }

    return `#${result}`;
};
