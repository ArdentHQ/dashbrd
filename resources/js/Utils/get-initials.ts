/**
 * Gets the first character of each word in the string to maximum of characters
 * on the parameter. If only one word, get the first N characters of the word.
 */
export const getInitials = (text: string, characters = 2): string => {
    const words = text.split(" ");

    if (words.length === 1) {
        return words[0].slice(0, characters).toLocaleUpperCase();
    }

    const initials = words.map((word) => word[0]);
    return initials.slice(0, characters).join("").toLocaleUpperCase();
};
