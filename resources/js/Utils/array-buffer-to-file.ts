export const arrayBufferToFile = (
    buffer: ArrayBuffer | null,
    fileName: string | null,
    fileType: string | null,
): File | null => {
    if (buffer === null || fileName === null || fileType === null) {
        return null;
    }

    const blob: Blob = new Blob([buffer], { type: fileType });

    return new File([blob], fileName, { type: fileType });
};
