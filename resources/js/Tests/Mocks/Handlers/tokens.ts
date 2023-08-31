import { type RequestHandler, rest } from "msw";

import priceHistory from "@/Tests/Fixtures/price_history.json";
import breakdown from "@/Tests/Fixtures/tokens.breakdown.json";
import tokensList from "@/Tests/Fixtures/tokens.list.json";
import prices from "@/Tests/Fixtures/tokens.price.json";
import { BASE_URL } from "@/Tests/Mocks/server";

const getEndpoints = [
    { path: "token/price", data: prices },
    { path: "tokens/breakdown", data: breakdown },
    { path: "tokens/list", data: tokensList },
    { path: "tokens/price", data: prices },
];

const postEndpoints = [{ path: "price_history", data: priceHistory }];

export const tokensHandlers = (): RequestHandler[] => [
    ...getEndpoints.map((endpoint) =>
        rest.get(
            `${BASE_URL}/${endpoint.path}`,
            async (_, response, context) => await response(context.status(200), context.json(endpoint.data)),
        ),
    ),
    ...postEndpoints.map((endpoint) =>
        rest.post(
            `${BASE_URL}/${endpoint.path}`,
            async (_, response, context) => await response(context.status(200), context.json(endpoint.data)),
        ),
    ),
];
