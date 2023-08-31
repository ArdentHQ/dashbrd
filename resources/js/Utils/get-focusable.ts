const focusableElementsString = `
    [href],
    input:not([disabled]),
    select:not([disabled]),
    textarea:not([disabled]),
    button:not([disabled]),
    [tabindex]:not([tabindex="-1"]):not([disabled]),
    [contenteditable]
`;

type FocusableElement = HTMLButtonElement | HTMLAnchorElement | HTMLTextAreaElement | HTMLElement | HTMLInputElement;

export const getFirstFocusableElement = (container: Element): FocusableElement | null => {
    const elements: NodeListOf<FocusableElement> = container.querySelectorAll(focusableElementsString);

    return elements.length > 0 ? elements[0] : null;
};

export const getNextFocusableElement = (
    container: Element,
    currentElement: FocusableElement,
): FocusableElement | null => {
    const elements: NodeListOf<FocusableElement> = container.querySelectorAll(focusableElementsString);
    const index: number = Array.prototype.indexOf.call(elements, currentElement);

    if (index === -1 || index === elements.length - 1) {
        return null;
    }

    return elements[index + 1];
};

export const getPreviousFocusableElement = (
    container: Element,
    currentElement: FocusableElement,
): FocusableElement | null => {
    const elements: NodeListOf<FocusableElement> = container.querySelectorAll(focusableElementsString);
    const index: number = Array.prototype.indexOf.call(elements, currentElement);

    if (index === -1 || index === 0) {
        return null;
    }

    return elements[index - 1];
};
