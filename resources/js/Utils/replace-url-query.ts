import omitBy from "lodash/omitBy";

import { getQueryParameters } from "@/Utils/get-query-parameters";

export const replaceUrlQuery = (newParameters: Record<string, string>): string => {
    const urlObject = new URL(window.location.href);

    const existingParameters = getQueryParameters();

    const filteredParameters = omitBy(
        {
            ...existingParameters,
            ...newParameters,
        },
        (value) => value === "",
    );

    let searchQuery = new URLSearchParams(filteredParameters).toString();

    if (searchQuery !== "") {
        searchQuery = `?${searchQuery}`;
    }

    const newUrl = `${urlObject.origin}${urlObject.pathname}${searchQuery}`;

    history.replaceState(null, "", newUrl);

    return newUrl;
};
