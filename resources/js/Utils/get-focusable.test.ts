import { getFirstFocusableElement, getNextFocusableElement, getPreviousFocusableElement } from "./get-focusable";

describe("getFirstFocusableElement", () => {
    it("returns the first focusable element in the container", () => {
        const container = document.createElement("div");
        container.innerHTML = `
          <input type="text" name="input1" />
          <button>Click me</button>
          <input type="text" name="input2" />
        `;

        const firstFocusableElement = getFirstFocusableElement(container);

        expect(firstFocusableElement).toEqual(container.querySelector("input[type=text]"));
    });

    it("returns null if no focusable elements are found", () => {
        const container = document.createElement("div");
        container.innerHTML = `
          <span>Not focusable</span>
          <div><div><div></div></div></div>
        `;

        const firstFocusableElement = getFirstFocusableElement(container);

        expect(firstFocusableElement).toBeNull();
    });
});

describe("getNextFocusableElement", () => {
    it("returns the next focusable element in the container", () => {
        const container = document.createElement("div");
        container.innerHTML = `
        <input type="text" name="input1" />
        <button>Click me</button>
        <input type="text" name="input2" />
      `;

        const firstFocusableElement = getFirstFocusableElement(container);
        const nextFocusableElement = getNextFocusableElement(container, firstFocusableElement as HTMLInputElement);

        expect(nextFocusableElement).toEqual(container.querySelector("button"));
    });

    it("returns null if there is no next focusable element in the container", () => {
        const container = document.createElement("div");
        container.innerHTML = `
        <input type="text" name="input1" />
      `;

        const inputElement = container.querySelector("input");
        const nextFocusableElement = getNextFocusableElement(container, inputElement as HTMLInputElement);

        expect(nextFocusableElement).toBeNull();
    });

    it("returns null if the current element is not in the container", () => {
        const container = document.createElement("div");
        container.innerHTML = `
        <input type="text" name="input1" />
        <button>Click me</button>
      `;

        const inputElement = document.createElement("input");
        const buttonElement = container.querySelector("button");
        const nextFocusableElement = getNextFocusableElement(container, inputElement);

        expect(nextFocusableElement).not.toEqual(buttonElement);
        expect(nextFocusableElement).toBeNull();
    });
});

describe("getPreviousFocusableElement", () => {
    it("returns the previous focusable element in the container", () => {
        const container = document.createElement("div");
        container.innerHTML = `
        <input type="text" name="input1" />
        <button>Click me</button>
        <input type="text" name="input2" />
      `;

        const lastInputElement = container.querySelector("[name=input2]");
        const previousFocusableElement = getPreviousFocusableElement(container, lastInputElement as HTMLInputElement);

        expect(previousFocusableElement).toEqual(container.querySelector("button"));
    });

    it("returns null if there is no previous focusable element in the container", () => {
        const container = document.createElement("div");
        container.innerHTML = `
        <input type="text" name="input1" />
      `;

        const inputElement = container.querySelector("input");
        const previousFocusableElement = getPreviousFocusableElement(container, inputElement as HTMLInputElement);

        expect(previousFocusableElement).toBeNull();
    });

    it("returns null if the current element is not in the container", () => {
        const container = document.createElement("div");
        container.innerHTML = `
        <input type="text" name="input1" />
        <button>Click me</button>
      `;

        const inputElement = container.querySelector("input");
        const buttonElement = document.createElement("button");
        const previousFocusableElement = getPreviousFocusableElement(container, buttonElement);

        expect(previousFocusableElement).not.toEqual(inputElement);
        expect(previousFocusableElement).toBeNull();
    });
});
