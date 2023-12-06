export const toTwitterHashtag = (value: string | undefined | null): string => {
    if (value === undefined || value === null) {
        return "";
    }

    return value.toLowerCase().replace(/[^a-zA-Z0-9]/g, "");
};
