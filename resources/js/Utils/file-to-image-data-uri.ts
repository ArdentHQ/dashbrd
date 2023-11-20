export const fileToImageDataURI = async (file: File): Promise<string> =>
    await new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onloadend = () => {
            if (typeof reader.result !== "string") {
                reject(new Error("Failed to convert file to data URI"));
                return;
            }

            resolve(reader.result);
        };

        reader.onerror = reject;

        reader.readAsDataURL(file);
    });
