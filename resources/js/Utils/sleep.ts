export const sleep = async (ms: number): Promise<void> => {
    // eslint-disable-next-line @typescript-eslint/return-await
    await new Promise((resolve) => setTimeout(resolve, ms));
};
