import path from "path";
import { mergeConfig } from "vite";
import { configDefaults, defineConfig } from "vitest/config";

import viteConfig from "./vite.config";

const coverageThresholdLines = Number(process.env.COVERAGE_THRESHOLD_LINES || 0);
const coverageThresholdFunctions = Number(process.env.COVERAGE_THRESHOLD_FUNCTIONS || 0);
const coverageThresholdStatements = Number(process.env.COVERAGE_THRESHOLD_STATEMENTS || 0);
const coverageThresholdBranches = Number(process.env.COVERAGE_THRESHOLD_BRANCHES || 0);

export default mergeConfig(
    viteConfig,
    defineConfig({
        test: {
            logHeapUsage: true,
            maxConcurrency: 3,
            globals: true,
            environment: "jsdom",
            isolate: true,
            setupFiles: ["./vitest.setup.tsx"],
            server: {
                deps: {
                    inline: ["@ardenthq/sdk-intl"],
                },
            },
            coverage: {
                all: true,
                include: process.env.COVERAGE_INCLUDE_PATH
                    ? process.env.COVERAGE_INCLUDE_PATH.split(",")
                    : ["resources/js"],
                exclude: [
                    "resources/js/bootstrap.ts",
                    "resources/js/images.ts",
                    "resources/js/app.tsx",
                    "resources/js/Types/",
                    "resources/js/Tests/",
                    "resources/js/i18n/",
                    "vendor",
                ],
                provider: "istanbul",
                reporter: ["json", "lcov", "text", "clover", "html"],
                lines: coverageThresholdLines,
                functions: coverageThresholdFunctions,
                branches: coverageThresholdBranches,
                statements: coverageThresholdStatements,
            },
            exclude: [...configDefaults.exclude, "**/vendor/**"],
        },
        resolve: {
            alias: {
                "@": path.resolve(__dirname, "./resources/js"),
            },
        },
    }),
);
