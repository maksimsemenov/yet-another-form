import { pathToArray } from "./pathToArray";

describe("pathToArray", () => {
  it("returns empty array for falsy path", () => {
    expect(pathToArray()).toEqual([]);
  });

  it("throws an error for non-string path", () => {
    expect(() => pathToArray(2)).toThrow("Path must be a string");
  });

  it("returns array with just on esegment if path not splitable", () => {
    expect(pathToArray("pathToSomeField")).toEqual(["pathToSomeField"]);
  });

  it("returns array of strings", () => {
    expect(pathToArray("path.to.some.field")).toEqual([
      "path",
      "to",
      "some",
      "field",
    ]);
  });

  it("returns array of strings and numbers", () => {
    expect(pathToArray("path.to[23][3].23field-with_dash.34")).toEqual([
      "path",
      "to",
      23,
      3,
      "23field-with_dash",
      34,
    ]);
  });

  it("returns array of strings and numbers", () => {
    expect(pathToArray("path.to[23][3].23field-with_dash23")).toEqual([
      "path",
      "to",
      23,
      3,
      "23field-with_dash23",
    ]);
  });

  it("returns array of number", () => {
    expect(pathToArray("2")).toEqual([2]);
  });

  it("uses cache for equals paths", () => {
    const result1 = pathToArray("path.to.some.field");
    const result2 = pathToArray("path.to.some.field");
    expect(result1).toEqual(["path", "to", "some", "field"]);
    expect(result2).toBe(result1);
  });
});
