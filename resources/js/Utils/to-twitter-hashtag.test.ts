import { toTwitterHashtag } from "./to-twitter-hashtag";

describe("toTwitterHashtag", () => {
    it.each(["", null, undefined])("returns empty string for %s", (value) => {
        expect(toTwitterHashtag(value)).toEqual("");
    });

    it.each([
        ["Los 3 Mosqueteros", "los3mosqueteros"],
        ["Moonbirds", "moonbirds"],
        ["CrypToadz by GREMPLIN", "cryptoadzbygremplin"],
        ["tyny dinos", "tynydinos"],
    ])("returns %s for %s", (value, expected) => {
        expect(toTwitterHashtag(value)).toEqual(expected);
    });
});
