import "tailwindcss/tailwind.css";
import { i18n } from "./i18n";
import "../resources/css/app.css";

const breakpoints = ["1440", "1280", "1024", "960", "768", "640", "375"];

const viewports = breakpoints.reduce((carry, breakpoint) => {
    const pixels = `${breakpoint}px`;

    carry[pixels] = {
        name: pixels,
        styles: {
            width: pixels,
            height: "800px",
        },
    };

    return carry;
}, {});

const preview = {
    parameters: {
        i18n,
        locale: "en",
        locales: {
            en: "English",
        },
        actions: { argTypesRegex: "^on[A-Z].*" },
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/,
            },
        },
        options: {
            storySort: {
                method: "alphabetical",
                order: ["Documentation", "*"],
            },
        },
        viewport: {
            viewports,
        },
    },
};

export default preview;
