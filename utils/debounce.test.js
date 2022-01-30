import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { debounce } from "./debounce";

jest.useFakeTimers();

beforeEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
});

describe("debounce", () => {
  it("calls the passed function with correct args", () => {
    let func = jest.fn();
    let debouncer = debounce(func);

    debouncer("123", 123);

    jest.runAllTimers();

    expect(func).toHaveBeenCalledWith("123", 123);
  });

  it("calls the passed function only once within a threshold", () => {
    let func = jest.fn();
    let debouncer = debounce(func, 50);

    debouncer("123", 123);
    debouncer("124", 124);
    debouncer("125", 125);
    debouncer("126", 126);
    jest.runAllTimers();

    debouncer("123", 123);
    debouncer("124", 124);
    debouncer("125", 125);
    debouncer("126", 126);
    jest.runAllTimers();

    expect(func).toHaveBeenCalledTimes(2);
  });

  it("calls the passed function with the latest args", () => {
    let func = jest.fn();
    let debouncer = debounce(func, 50);

    debouncer("123", 123);
    debouncer("124", 124);
    debouncer("125", 125);
    debouncer("126", 126);

    jest.runAllTimers();

    expect(func).toHaveBeenCalledTimes(1);
    expect(func).toHaveBeenNthCalledWith(1, "126", 126);
  });
});
