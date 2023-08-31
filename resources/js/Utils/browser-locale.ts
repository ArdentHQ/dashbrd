export const browserLocale = (): string =>
    navigator.languages.length > 0 ? navigator.languages[0] : navigator.language;
