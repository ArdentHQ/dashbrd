/* eslint-disable prefer-arrow/prefer-arrow-functions */
import "vanilla-cookieconsent";
import "vanilla-cookieconsent/dist/cookieconsent.css";

/* istanbul ignore next -- @preserve */
function gtag(): void {
    // eslint-disable-next-line prefer-rest-params, @typescript-eslint/no-explicit-any
    (window.dataLayer as any[]).push(arguments);
}

/* istanbul ignore next -- @preserve */
const addAnalytics = (cookieConsentCode: string): void => {
    const analyticsScript = document.createElement("script");
    analyticsScript.id = "google_analytics_script";
    analyticsScript.type = "text/javascript";
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    analyticsScript.src = `https://www.googletagmanager.com/gtag/js?id=${cookieConsentCode}`;
    document.body.append(analyticsScript);

    window.dataLayer = Array.isArray(window.dataLayer) ? window.dataLayer : [];

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any
    (gtag as any)("js", new Date());
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any
    (gtag as any)("config", cookieConsentCode);
};

/* istanbul ignore next -- @preserve */
const removeAnalytics = (cookieConsentCode: string): void => {
    const analyticsScript = document.getElementById("google_analytics_script") as HTMLElement;
    analyticsScript.remove();

    // Get google analytics cookies
    const cookieNames = document.cookie
        .split(";")
        .filter((cookie) => cookie.trim().startsWith("_ga"))
        .map((cookie) => cookie.split("=")[0]);

    const host = document.domain;
    window.CC.eraseCookies(cookieNames, "/", host);

    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
    (window as any)[`ga-disable-${cookieConsentCode}`] = true;
};

export const CookieConsent = ({
    cookieConsentCode,
    contactEmail,
    cookiePolicyUrl,
}: {
    cookieConsentCode: string;
    contactEmail: string;
    cookiePolicyUrl: string;
}): void => {
    /* istanbul ignore next -- @preserve */
    window.CC = window.initCookieConsent();

    /* istanbul ignore next -- @preserve */
    window.CC.run({
        current_lang: "en",
        /* istanbul ignore next -- @preserve */
        onAccept: (settings) => {
            if (settings.categories.includes("analytics")) {
                addAnalytics(cookieConsentCode);
            }
        },
        /* istanbul ignore next -- @preserve */
        onChange: (settings) => {
            if (settings.categories.includes("analytics")) {
                addAnalytics(cookieConsentCode);
            } else {
                removeAnalytics(cookieConsentCode);
            }
        },
        languages: {
            en: {
                consent_modal: {
                    title: "Dashbrd uses cookies! 🍪",
                    description:
                        'Dashbrd uses essential cookies to ensure its proper operation and tracking cookies to understand how you interact with it. The latter will be set only after consent. <button type="button" data-cc="c-settings" class="cc-link">Let me choose</button>',
                    primary_btn: {
                        text: "Accept all",
                        role: "accept_all", // 'accept_selected' or 'accept_all'
                    },
                    secondary_btn: {
                        text: "Reject all",
                        role: "accept_necessary", // 'settings' or 'accept_necessary'
                    },
                },
                settings_modal: {
                    title: "Cookie Settings",
                    save_settings_btn: "Save settings",
                    accept_all_btn: "Accept all",
                    reject_all_btn: "Reject all",
                    close_btn_label: "Close",
                    cookie_table_headers: [
                        { col1: "Name" },
                        { col2: "Domain" },
                        { col3: "Expiration" },
                        { col4: "Description" },
                    ],
                    blocks: [
                        {
                            title: "Cookie usage 📢",
                            description: `I use cookies to ensure the basic functionalities of the website and to enhance your online experience. You can choose for each category to opt-in/out whenever you want. For more details relative to cookies and other sensitive data, please read the full <a href="${cookiePolicyUrl}" target="_blank" rel="noopener" class="cc-link">cookie policy</a>.`,
                        },
                        {
                            title: "Strictly necessary cookies",
                            description:
                                "These cookies are essential for the proper functioning of my website. Without these cookies, the website would not work properly",
                            toggle: {
                                value: "necessary",
                                enabled: true,
                                readonly: true, // cookie categories with readonly=true are all treated as "necessary cookies"
                            },
                        },
                        {
                            title: "Performance and Analytics cookies",
                            description:
                                "These cookies allow the website to remember the choices you have made in the past",
                            toggle: {
                                value: "analytics", // your cookie category
                                enabled: false,
                                readonly: false,
                            },
                            cookie_table: [
                                {
                                    col1: "^_ga",
                                    col2: "*.dashbrd.com",
                                    col3: "2 years",
                                    col4: "This cookie is installed by Google Analytics and used for the site's analytics report. This information is stored anonymously and assigned a random number to identify unique visitors.",
                                    is_regex: true,
                                },
                                {
                                    col1: "_gid",
                                    col2: "*.dashbrd.com",
                                    col3: "24 hours",
                                    col4: "This cookie is installed by Google Analytics for session management.",
                                },
                            ],
                        },
                        {
                            title: "Advertisement and Targeting cookies",
                            description:
                                "These cookies collect information about how you use the website, which pages you visited and which links you clicked on. All of the data is anonymized and cannot be used to identify you",
                            toggle: {
                                value: "targeting",
                                enabled: false,
                                readonly: false,
                            },
                        },
                        {
                            title: "More information",
                            description: `For any queries in relation to our policy on cookies and your choices, please <a class="cc-link" href="mailto:${contactEmail}">contact us</a>.`,
                        },
                    ],
                },
            },
        },
        gui_options: {
            consent_modal: {
                layout: "box",
                position: "bottom center",
                transition: "slide",
            },
            settings_modal: {
                transition: "slide",
            },
        },
    });
};
