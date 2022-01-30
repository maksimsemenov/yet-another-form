import { isEqual } from "./isEqual";

describe("isEqual", () => {
  describe("falsey", () => {
    it("returns true for equal values", () => {
      expect(isEqual(0, 0)).toBeTruthy();
      expect(isEqual("", "")).toBeTruthy();
      expect(isEqual(null, null)).toBeTruthy();
      expect(isEqual(undefined, undefined)).toBeTruthy();
      expect(isEqual(false, false)).toBeTruthy();
    });

    it("returns false for unequal values", () => {
      expect(isEqual(0, "")).toBeFalsy();
      expect(isEqual(0, null)).toBeFalsy();
      expect(isEqual(0, undefined)).toBeFalsy();
      expect(isEqual(0, false)).toBeFalsy();

      expect(isEqual("", 0)).toBeFalsy();
      expect(isEqual("", null)).toBeFalsy();
      expect(isEqual("", undefined)).toBeFalsy();
      expect(isEqual("", false)).toBeFalsy();

      expect(isEqual(null, 0)).toBeFalsy();
      expect(isEqual(null, "")).toBeFalsy();
      expect(isEqual(null, undefined)).toBeFalsy();
      expect(isEqual(null, false)).toBeFalsy();

      expect(isEqual(undefined, 0)).toBeFalsy();
      expect(isEqual(undefined, "")).toBeFalsy();
      expect(isEqual(undefined, null)).toBeFalsy();
      expect(isEqual(undefined, false)).toBeFalsy();

      expect(isEqual(false, 0)).toBeFalsy();
      expect(isEqual(false, "")).toBeFalsy();
      expect(isEqual(false, null)).toBeFalsy();
      expect(isEqual(false, undefined)).toBeFalsy();

      expect(isEqual({}, undefined)).toBeFalsy();
    });
  });

  describe("basic", () => {
    it("returns true for equal values", () => {
      expect(isEqual(123, 123)).toBeTruthy();
      expect(isEqual("string", "string")).toBeTruthy();
      expect(isEqual(true, true)).toBeTruthy();
    });

    it("returns false for unequal values", () => {
      expect(isEqual(123, "string")).toBeFalsy();
      expect(isEqual(123, true)).toBeFalsy();
      expect(isEqual("string", true)).toBeFalsy();
    });
  });

  describe("objects", () => {
    it("returns true for equal values", () => {
      expect(isEqual([123, 124, 125], [123, 124, 125])).toBeTruthy();
      expect(
        isEqual(
          ["an", "array", "of", "strings"],
          ["an", "array", "of", "strings"]
        )
      ).toBeTruthy();
      expect(
        isEqual(
          { first: "first", number: 123 },
          { number: 123, first: "first" }
        )
      ).toBeTruthy();
    });

    it("returns false for unequal values", () => {
      expect(isEqual([123, 124, 125], [123, 124, 126])).toBeFalsy();
      expect(isEqual([123, 124, 125], [123, 124, 125, 126])).toBeFalsy();
      expect(
        isEqual(["an", "array", "of", "strings"], {
          1: "an",
          2: "array",
          3: "of",
          4: "strings",
        })
      ).toBeFalsy();
      expect(
        isEqual(
          { first: "first", number: 123 },
          { first: "second", number: 123 }
        )
      ).toBeFalsy();
      expect(
        isEqual(
          { first: "first", number: 123 },
          { first: "first", number: 123, second: "second" }
        )
      ).toBeFalsy();
      expect(
        isEqual([123, 124, 125], { first: "second", number: 123 })
      ).toBeFalsy();
    });
  });
});
