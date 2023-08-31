import { tp, TranslatePlural } from "./TranslatePlural";

describe("TranslatePlural", () => {
    const translationSimpleWithoutData = "common.simple_plural_without_data";
    const translationSimpleWithData = "common.simple_plural_with_data";
    const translationAdvancedWithoutData = "common.advanced_plural_without_data";
    const translationAdvancedWithData = "common.advanced_plural_with_data";

    it("should translate standard key if passed in", () => {
        expect(TranslatePlural("common.other", 0)).toBe("Other");
    });

    it("should work with alias", () => {
        expect(tp("common.other", 0)).toBe("Other");
    });

    describe("without data", () => {
        describe("simple", () => {
            it("should return with 1", () => {
                expect(TranslatePlural(translationSimpleWithoutData, 1)).toBe("One comment");
            });

            it.each([2, 3, 4, 5, 6])("should return with many", () => {
                expect(TranslatePlural(translationSimpleWithoutData, 2)).toBe("Many comments");
            });
        });

        describe("advanced", () => {
            it("should return key if nothing matches", () => {
                expect(TranslatePlural("{0} no comments yet|{1} 1 comment|[2,*] Many comments", -1)).toBe(
                    "{0} no comments yet|{1} 1 comment|[2,*] Many comments",
                );
            });

            it("should return with 0", () => {
                expect(TranslatePlural(translationAdvancedWithoutData, 0)).toBe("no comments yet");
            });

            it("should return with 1", () => {
                expect(TranslatePlural(translationAdvancedWithoutData, 1)).toBe("1 comment");
            });

            it.each([2, 3, 4, 5, 6])("should return with many", () => {
                expect(TranslatePlural(translationAdvancedWithoutData, 2)).toBe("Many comments");
            });

            it("should handle without a translation", () => {
                expect(TranslatePlural("{0} No cars|{1} One car|[2,*] Many cars", 4)).toBe("Many cars");
            });

            it("should handle range without asterisk", () => {
                expect(TranslatePlural("{0} No comments|{1} One comment|[2,] Many comments", 4)).toBe("Many comments");
            });
        });
    });

    describe("with data", () => {
        describe("simple", () => {
            it("should return with 1", () => {
                expect(TranslatePlural(translationSimpleWithData, 1, { count: "One" })).toBe("One comment");
            });

            it.each([2, 3, 4, 5, 6])("should return with many", () => {
                expect(TranslatePlural(translationSimpleWithData, 2, { count: "Many" })).toBe("Many comments");
            });
        });

        describe("advanced", () => {
            it("should return key if nothing matches", () => {
                expect(
                    TranslatePlural("{0} :count comments|{1} :count comment|[2,*] :count comments", -1, { count: 0 }),
                ).toBe("{0} :count comments|{1} :count comment|[2,*] :count comments");
            });

            it("should return correct value", () => {
                expect(TranslatePlural(translationAdvancedWithData, 0, { count: 0 })).toBe("no comments yet");
                expect(TranslatePlural(translationAdvancedWithData, 1, { count: 1 })).toBe("1 comment");
                expect(TranslatePlural(translationAdvancedWithData, 2, { count: 2 })).toBe("2 comments");
                expect(TranslatePlural(translationAdvancedWithData, 3, { count: 3 })).toBe("3 comments");
                expect(TranslatePlural(translationAdvancedWithData, 4, { count: 4 })).toBe("4 comments");
            });

            it("should handle without a translation", () => {
                expect(
                    TranslatePlural("{0} :count :types|{1} :count :type|[2,*] :count :types", 4, {
                        count: 4,
                        type: "car",
                    }),
                ).toBe("4 cars");
            });

            it("should handle range without asterisk", () => {
                expect(
                    TranslatePlural("{0} :count comments|{1} :count comment|[2,] :count comments", 4, { count: 4 }),
                ).toBe("4 comments");
            });

            it("should handle range with with a 'to'", () => {
                expect(
                    TranslatePlural(
                        "{0} :count comments|{1} :count comment|[2,4] Some comments|[5,] Many comments",
                        4,
                        { count: 4 },
                    ),
                ).toBe("Some comments");
                expect(
                    TranslatePlural(
                        "{0} :count comments|{1} :count comment|[2,4] Some comments|[5,] Many comments",
                        5,
                        { count: 5 },
                    ),
                ).toBe("Many comments");
            });
        });
    });
});
