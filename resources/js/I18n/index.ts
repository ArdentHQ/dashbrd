import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./Locales/en.json";

const defaultNS = "translation";

const resources = {
    en: {
        translation: en,
    },
};

export const configuration = {
    defaultNS,
    lng: "en",
    fallbackLng: "en",
    ns: [defaultNS],
    resources,
    returnNull: false,
};

void i18n.use(initReactI18next).init(configuration);

export { default as i18n } from "i18next";
