import { describe, expect, it } from "@jest/globals";
import { flatten } from "./flatten";

describe("flatten", () => {
  describe("non objects", () => {
    it("returns empty object for undefined", () => {
      expect(flatten()).toEqual({});
    });

    it("returns empty object for null", () => {
      expect(flatten(null)).toEqual({});
    });

    it("returns empty object for string", () => {
      expect(flatten("null")).toEqual({});
    });

    it("returns empty object for number", () => {
      expect(flatten(42)).toEqual({});
    });

    it("returns empty object for boolean", () => {
      expect(flatten(false)).toEqual({});
    });

    it("returns empty object for function", () => {
      expect(flatten(() => {})).toEqual({});
    });
  });

  it("flattens flat object", () => {
    expect(
      flatten({ string: "string", number: 42, promise: Promise.resolve() })
    ).toEqual({ string: "string", number: 42, promise: Promise.resolve() });
  });

  it("flattens nested object", () => {
    expect(
      flatten({
        first: { string: "string", number: 42, promise: Promise.resolve() },
      })
    ).toEqual({
      "first.string": "string",
      "first.number": 42,
      "first.promise": Promise.resolve(),
    });
  });

  it("flattens array", () => {
    expect(flatten([12, 42])).toEqual({ 0: 12, 1: 42 });
  });

  it("flattens nested object with array", () => {
    expect(
      flatten({
        first: {
          string: "string",
          number: 42,
          promise: Promise.resolve(),
          array: [12, 42],
        },
      })
    ).toEqual({
      "first.string": "string",
      "first.number": 42,
      "first.promise": Promise.resolve(),
      "first.array.0": 12,
      "first.array.1": 42,
    });
  });
});
