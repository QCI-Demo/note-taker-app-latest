import { debounce } from "@/utils/debounce";

describe("debounce", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("delays invocation until after delay ms", () => {
    const fn = jest.fn();
    const d = debounce(fn, 300);

    d("a");
    expect(fn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(299);
    expect(fn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("a");
  });

  it("resets the timer on rapid calls (only last args run)", () => {
    const fn = jest.fn();
    const d = debounce(fn, 300);

    d("first");
    jest.advanceTimersByTime(100);
    d("second");
    jest.advanceTimersByTime(299);
    expect(fn).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("second");
  });

  it("works with regular functions and preserves this", () => {
    const fn = jest.fn(function (this: { x: number }, v: string) {
      return this.x + v;
    });
    const d = debounce(fn, 300);
    const ctx = { x: 1 };

    d.call(ctx, "a");
    jest.runAllTimers();
    expect(fn).toHaveBeenCalledWith("a");
    expect(fn.mock.instances[0]).toBe(ctx);
  });

  it("cancel prevents pending invocation", () => {
    const fn = jest.fn();
    const d = debounce(fn, 300);
    d("x");
    d.cancel();
    jest.runAllTimers();
    expect(fn).not.toHaveBeenCalled();
  });
});
