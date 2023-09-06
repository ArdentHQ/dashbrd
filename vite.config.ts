import path from "path";
import { defineConfig, PluginOption } from "vite";
import laravel from "laravel-vite-plugin";
import { watch } from "vite-plugin-watch";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import { parseAll } from "./resources/js/I18n/loader";
import markdown from "@vavt/vite-plugin-import-markdown";

const buildTranslations = (inputPath: string, outputPath: string): PluginOption => {
    let files: { name: string; path: string }[] = [];

    return {
        name: "i18n",
        enforce: "post",
        config(config) {
            files = parseAll(inputPath, outputPath);
        },
        handleHotUpdate(context) {
            if (/lang\/.*\.php$/.test(context.file)) {
                files = parseAll(inputPath, outputPath);
            }
        },
    };
};

export default defineConfig({
    define: {
        "process.env": {},
    },
    plugins: [
        buildTranslations("lang", "resources/js/I18n/Locales"),
        laravel({
            input: ["resources/js/app.tsx", "resources/css/filament.css"],
            refresh: true,
        }),
        process.env.NODE_ENV !== "production"
            ? watch({
                  pattern: "app/{Data,Enums}/**/*.php",
                  command: "npm run generate:typescript",
              })
            : null,
        react(),
        svgr(),
        markdown(),
    ],
    resolve: {
        alias: {
            "@icons": path.resolve(__dirname, "./resources/icons/"),
            "@images": path.resolve(__dirname, "./resources/images/"),
        },
    },
});
