import axios, { type AxiosError } from "axios";
import { sleep } from "@/Utils/sleep";

interface DefaultResponse {
    result: unknown;
    status: string;
    message: string;
}

/**
 * Explorer HTTP Client Service, that handles retries & rate limit errors.
 */
export class ExplorerClient {
    /**
     * Determine if response is a rate limit error.
     *
     * @param {string} status
     * @param {unknown} result
     */
    private readonly isRateLimitError = (status: string, result: unknown): boolean =>
        status === "0" && typeof result === "string" && result.includes("rate limit");

    /**
     * Fetch using axios.
     *
     * @param {string} url
     * @returns {Promise<TResponse>}
     */
    private readonly fetch = async <TResponse>(url: string): Promise<TResponse> => {
        const response = await axios.get<TResponse>(url, {
            // unsetting X-Requested-With to resolve CORS issue
            headers: {
                "X-Requested-With": undefined,
            },
        });

        return response.data;
    };

    /**
     * Fetches and caches results in memory with retries.
     *
     * @param {URL} url
     * @param {number} maxRetries - Maximum number of retries.
     * @param {number} requestRate - Request rate in milliseconds.
     * @returns {Promise<TResponse>}
     */
    public async get<TResponse extends DefaultResponse>(
        url: URL,
        maxRetries = 1,
        requestRate = 5000,
    ): Promise<TResponse["result"]> {
        const retryFetch = async (url: URL, retries: number): Promise<TResponse> => {
            try {
                const { status, result } = await this.fetch<TResponse>(url.toString());

                // retry if response `200` and says rate limit
                if (this.isRateLimitError(status, result)) {
                    if (retries > maxRetries) {
                        throw new Error(result as string);
                    }

                    await sleep(requestRate);

                    retries = retries + 1;
                    return await retryFetch(url, retries);
                }

                return result as TResponse;
            } catch (error) {
                const customError = error as AxiosError<TResponse>;

                if (customError.response != null) {
                    const { status, result } = customError.response.data;

                    // retry if response `500` and says rate limit
                    if (this.isRateLimitError(status, result)) {
                        if (retries > maxRetries) {
                            throw new Error(result as string);
                        }

                        await sleep(requestRate);

                        retries = retries + 1;
                        return await retryFetch(url, retries);
                    }
                }

                throw new Error(error as TResponse & string);
            }
        };

        return await retryFetch(url, 0);
    }
}
