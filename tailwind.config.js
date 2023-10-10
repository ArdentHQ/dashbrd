const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: "class",

    future: {
        hoverOnlyWhenSupported: true,
    },

    content: [
        "./vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php",
        "./storage/framework/views/*.php",
        "./resources/views/**/*.blade.php",
        "./resources/js/**/*.tsx",
        "./resources/js/**/*.ts",
        "./resources/images/errors/**/*.svg",
        "./stories/**/*.tsx",
        "./stories/**/*.mdx",
        "./stories/**/*.css",
    ],

    theme: {
        extend: {
            screens: {
                xs: "375px",
                "md-lg": "960px",
                "2xl": "1440px",
            },

            fontFamily: {
                sans: ["Ubuntu", ...defaultTheme.fontFamily.sans],
            },

            lineHeight: {
                4.5: "1.125rem",
                5.5: "1.375rem",
            },

            boxShadow: {
                "3xl": "0px 48px 64px -36px rgba(49, 51, 63, 0.13), 0px 24px 48px -8px rgba(49, 51, 63, 0.11)",
                dialog: "0px 2px 6px rgba(33, 34, 37, 0.06), 0px 32px 41px -23px rgba(33, 34, 37, 0.07)",
                dropdown: "0px 2px 4px -2px rgba(49, 51, 63, 0.06), 0px 4px 8px -2px rgba(49, 51, 63, 0.1)",
            },

            borderRadius: {
                "2.5xl": "1.375rem",
            },

            borderWidth: {
                3: "3px",
            },

            opacity: {
                15: ".15",
            },

            outlineWidth: {
                3: "3px",
            },

            width: {
                1.25: "0.313rem",
                15: "3.75rem",
                25: "6.25rem",
                28.5: "7.125rem",
                30: "7.5rem",
            },

            minWidth: {
                md: "28rem",
            },

            maxWidth: {
                "site-content": "90rem",
                content: "86rem",
                23: "5.75rem",
                32: "8rem",
                36: "9rem",
            },

            height: {
                1.25: "0.313rem",
                5.5: "1.375rem",
                6.5: "1.625rem",
                7.5: "1.875rem",
                15: "3.75rem",
                21: "5.25rem",
                30: "7.5rem",
                50: "12.5rem",
            },

            margin: {
                px: "1px",
            },

            rounded: {
                "3xl": "1.25rem",
            },

            backgroundSize: {
                500: "500px",
                1000: "1000px",
                "200%": "200%",
            },

            animation: {
                "move-bg": "move-bg 15s infinite linear",
            },

            keyframes: {
                "move-bg": {
                    "0%": { backgroundPosition: 0 },
                    "100%": { backgroundPosition: "500px" },
                },
            },

            spacing: {
                18: "4.5rem",
            },
        },

        colors: {
            black: "rgb(var(--theme-color-black) / <alpha-value>)",
            white: "rgb(var(--theme-color-white) / <alpha-value>)",
            transparent: "transparent",

            // Tailwind overrides
            "theme-primary-50": "rgb(var(--theme-color-primary-50) / <alpha-value>)",
            "theme-primary-100": "rgb(var(--theme-color-primary-100) / <alpha-value>)",
            "theme-primary-200": "rgb(var(--theme-color-primary-200) / <alpha-value>)",
            "theme-primary-300": "rgb(var(--theme-color-primary-300) / <alpha-value>)",
            "theme-primary-400": "rgb(var(--theme-color-primary-400) / <alpha-value>)",
            "theme-primary-500": "rgb(var(--theme-color-primary-500) / <alpha-value>)",
            "theme-primary-600": "rgb(var(--theme-color-primary-600) / <alpha-value>)",
            "theme-primary-700": "rgb(var(--theme-color-primary-700) / <alpha-value>)",
            "theme-primary-800": "rgb(var(--theme-color-primary-800) / <alpha-value>)",
            "theme-primary-900": "rgb(var(--theme-color-primary-900) / <alpha-value>)",

            "theme-secondary-50": "rgb(var(--theme-color-secondary-50) / <alpha-value>)",
            "theme-secondary-100": "rgb(var(--theme-color-secondary-100) / <alpha-value>)",
            "theme-secondary-200": "rgb(var(--theme-color-secondary-200) / <alpha-value>)",
            "theme-secondary-300": "rgb(var(--theme-color-secondary-300) / <alpha-value>)",
            "theme-secondary-400": "rgb(var(--theme-color-secondary-400) / <alpha-value>)",
            "theme-secondary-500": "rgb(var(--theme-color-secondary-500) / <alpha-value>)",
            "theme-secondary-600": "rgb(var(--theme-color-secondary-600) / <alpha-value>)",
            "theme-secondary-700": "rgb(var(--theme-color-secondary-700) / <alpha-value>)",
            "theme-secondary-800": "rgb(var(--theme-color-secondary-800) / <alpha-value>)",
            "theme-secondary-900": "rgb(var(--theme-color-secondary-900) / <alpha-value>)",

            "theme-dark-50": "rgb(var(--theme-color-dark-50) / <alpha-value>)",
            "theme-dark-100": "rgb(var(--theme-color-dark-100) / <alpha-value>)",
            "theme-dark-200": "rgb(var(--theme-color-dark-200) / <alpha-value>)",
            "theme-dark-300": "rgb(var(--theme-color-dark-300) / <alpha-value>)",
            "theme-dark-400": "rgb(var(--theme-color-dark-400) / <alpha-value>)",
            "theme-dark-500": "rgb(var(--theme-color-dark-500) / <alpha-value>)",
            "theme-dark-600": "rgb(var(--theme-color-dark-600) / <alpha-value>)",
            "theme-dark-700": "rgb(var(--theme-color-dark-700) / <alpha-value>)",
            "theme-dark-800": "rgb(var(--theme-color-dark-800) / <alpha-value>)",
            "theme-dark-900": "rgb(var(--theme-color-dark-900) / <alpha-value>)",
            "theme-dark-950": "rgb(var(--theme-color-dark-950) / <alpha-value>)",

            "theme-danger-50": "rgb(var(--theme-color-danger-50) / <alpha-value>)",
            "theme-danger-100": "rgb(var(--theme-color-danger-100) / <alpha-value>)",
            "theme-danger-200": "rgb(var(--theme-color-danger-200) / <alpha-value>)",
            "theme-danger-300": "rgb(var(--theme-color-danger-300) / <alpha-value>)",
            "theme-danger-400": "rgb(var(--theme-color-danger-400) / <alpha-value>)",
            "theme-danger-500": "rgb(var(--theme-color-danger-500) / <alpha-value>)",
            "theme-danger-600": "rgb(var(--theme-color-danger-600) / <alpha-value>)",
            "theme-danger-700": "rgb(var(--theme-color-danger-700) / <alpha-value>)",
            "theme-danger-800": "rgb(var(--theme-color-danger-800) / <alpha-value>)",
            "theme-danger-900": "rgb(var(--theme-color-danger-900) / <alpha-value>)",

            "theme-warning-50": "rgb(var(--theme-color-warning-50) / <alpha-value>)",
            "theme-warning-100": "rgb(var(--theme-color-warning-100) / <alpha-value>)",
            "theme-warning-200": "rgb(var(--theme-color-warning-200) / <alpha-value>)",
            "theme-warning-300": "rgb(var(--theme-color-warning-300) / <alpha-value>)",
            "theme-warning-400": "rgb(var(--theme-color-warning-400) / <alpha-value>)",
            "theme-warning-500": "rgb(var(--theme-color-warning-500) / <alpha-value>)",
            "theme-warning-600": "rgb(var(--theme-color-warning-600) / <alpha-value>)",
            "theme-warning-700": "rgb(var(--theme-color-warning-700) / <alpha-value>)",
            "theme-warning-800": "rgb(var(--theme-color-warning-800) / <alpha-value>)",
            "theme-warning-900": "rgb(var(--theme-color-warning-900) / <alpha-value>)",

            "theme-success-50": "rgb(var(--theme-color-success-50) / <alpha-value>)",
            "theme-success-100": "rgb(var(--theme-color-success-100) / <alpha-value>)",
            "theme-success-200": "rgb(var(--theme-color-success-200) / <alpha-value>)",
            "theme-success-300": "rgb(var(--theme-color-success-300) / <alpha-value>)",
            "theme-success-400": "rgb(var(--theme-color-success-400) / <alpha-value>)",
            "theme-success-500": "rgb(var(--theme-color-success-500) / <alpha-value>)",
            "theme-success-600": "rgb(var(--theme-color-success-600) / <alpha-value>)",
            "theme-success-700": "rgb(var(--theme-color-success-700) / <alpha-value>)",
            "theme-success-800": "rgb(var(--theme-color-success-800) / <alpha-value>)",
            "theme-success-900": "rgb(var(--theme-color-success-900) / <alpha-value>)",

            "theme-info-50": "rgb(var(--theme-color-info-50) / <alpha-value>)",
            "theme-info-100": "rgb(var(--theme-color-info-100) / <alpha-value>)",
            "theme-info-200": "rgb(var(--theme-color-info-200) / <alpha-value>)",
            "theme-info-300": "rgb(var(--theme-color-info-300) / <alpha-value>)",
            "theme-info-400": "rgb(var(--theme-color-info-400) / <alpha-value>)",
            "theme-info-500": "rgb(var(--theme-color-info-500) / <alpha-value>)",
            "theme-info-600": "rgb(var(--theme-color-info-600) / <alpha-value>)",
            "theme-info-700": "rgb(var(--theme-color-info-700) / <alpha-value>)",
            "theme-info-800": "rgb(var(--theme-color-info-800) / <alpha-value>)",
            "theme-info-900": "rgb(var(--theme-color-info-900) / <alpha-value>)",

            "theme-hint-50": "rgb(var(--theme-color-hint-50) / <alpha-value>)",
            "theme-hint-100": "rgb(var(--theme-color-hint-100) / <alpha-value>)",
            "theme-hint-200": "rgb(var(--theme-color-hint-200) / <alpha-value>)",
            "theme-hint-300": "rgb(var(--theme-color-hint-300) / <alpha-value>)",
            "theme-hint-400": "rgb(var(--theme-color-hint-400) / <alpha-value>)",
            "theme-hint-500": "rgb(var(--theme-color-hint-500) / <alpha-value>)",
            "theme-hint-600": "rgb(var(--theme-color-hint-600) / <alpha-value>)",
            "theme-hint-700": "rgb(var(--theme-color-hint-700) / <alpha-value>)",
            "theme-hint-800": "rgb(var(--theme-color-hint-800) / <alpha-value>)",
            "theme-hint-900": "rgb(var(--theme-color-hint-900) / <alpha-value>)",
        },
    },

    plugins: [require("@tailwindcss/forms")],
};
