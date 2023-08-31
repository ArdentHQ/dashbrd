import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import { configuration } from "../resources/js/I18n";

i18n.use(initReactI18next).init(configuration);

export { default as i18n } from "i18next";
