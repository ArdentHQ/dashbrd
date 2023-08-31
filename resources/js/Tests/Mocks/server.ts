import type {
    DefaultBodyType,
    MockedRequest,
    PathParams,
    RequestHandler,
    ResponseComposition,
    RestContext,
    RestHandler,
    RestRequest,
} from "msw";
import { rest } from "msw";
import { setupServer } from "msw/node";

import { chartsHandlers, tokensHandlers } from "./Handlers";
import { appUrl } from "@/Utils/app";

export const BASE_URL = `${appUrl()}/api`;

interface RequestOptions {
    method: "get" | "post";
    status: number;
    modifier?: "once";
    query?: Record<string, string | number | undefined | null>;
    delay?: number;
}

export const requestMock = (
    path: string,
    data: undefined | string | object,
    options: Partial<RequestOptions> = {},
): RestHandler<MockedRequest<DefaultBodyType>> => {
    const requestOptions: RequestOptions = {
        method: "get",
        status: 200,
        modifier: undefined,
        query: undefined,
        ...options,
    };

    return rest[requestOptions.method](
        path,
        async (
            request: RestRequest<never, PathParams<string>>,
            response: ResponseComposition<DefaultBodyType>,
            context: RestContext,
        ) => {
            if (options.delay !== undefined) {
                await new Promise((resolve) => setTimeout(resolve, options.delay));
            }

            if (typeof data === "function") {
                throw new Error(`Mock request using "rest.${requestOptions.method}()"`);
            }

            if (requestOptions.query !== undefined) {
                const parameters = request.url.searchParams;

                for (const [name, value] of Object.entries(requestOptions.query)) {
                    if (parameters.get(name) !== (value === null || value === undefined ? null : value.toString())) {
                        return;
                    }
                }
            }

            if (requestOptions.modifier !== undefined) {
                return await response[requestOptions.modifier](
                    context.status(requestOptions.status),
                    context.json(data),
                );
            }

            return await response(context.status(requestOptions.status), context.json(data));
        },
    );
};

export const requestMockOnce = (
    path: string,
    data: undefined | string | object,
    options = {},
): RestHandler<MockedRequest<DefaultBodyType>> => requestMock(path, data, { ...options, modifier: "once" });

const restHandlers: RequestHandler[] = [...tokensHandlers(), ...chartsHandlers()];

export const server = setupServer(...restHandlers);
