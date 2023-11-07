const extractDomain = (url: string): string => {
    const hostname = new URL(url).hostname;

    return hostname.replace(/^www\./, "");
};

export { extractDomain };
