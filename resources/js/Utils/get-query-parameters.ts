import omitBy from "lodash/omitBy";

export const getQueryParameters = (): Record<string, string> => {
    const existingParameters = Object.fromEntries(new URLSearchParams(window.location.search).entries());

    return omitBy(existingParameters, (value) => value === "");
};
