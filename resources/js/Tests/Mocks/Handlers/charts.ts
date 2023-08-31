import { type RequestHandler, rest } from "msw";

import lineChartData from "@/Tests/Fixtures/line_chart_data.json";
import { BASE_URL } from "@/Tests/Mocks/server";

const endpoints = [{ path: "line_chart_data", data: lineChartData }];

export const chartsHandlers = (): RequestHandler[] => [
    ...endpoints.map((endpoint) =>
        rest.post(
            `${BASE_URL}/${endpoint.path}`,
            async (_, response, context) => await response(context.status(200), context.json(endpoint.data)),
        ),
    ),
];
