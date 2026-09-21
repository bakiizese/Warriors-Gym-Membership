import { describe, expect, it, vi } from "vitest";
import { retry } from "../utils/retry.js";

describe("retry", () => {
  it("returns the value without retrying when the first call works", async () => {
    const fn = vi.fn().mockResolvedValue("ok");
    await expect(retry(fn, { delayMs: 1 })).resolves.toBe("ok");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("keeps trying until the call succeeds and reports each failure", async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error("refused"))
      .mockRejectedValueOnce(new Error("refused again"))
      .mockResolvedValue("up");
    const onRetry = vi.fn();

    await expect(retry(fn, { attempts: 5, delayMs: 1, onRetry })).resolves.toBe("up");

    expect(fn).toHaveBeenCalledTimes(3);
    expect(onRetry).toHaveBeenCalledTimes(2);
    expect(onRetry.mock.calls[0][1]).toBe(1);
    expect(onRetry.mock.calls[1][1]).toBe(2);
  });

  it("gives up after the last attempt and throws the last error", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("still down"));

    await expect(retry(fn, { attempts: 3, delayMs: 1 })).rejects.toThrow("still down");
    expect(fn).toHaveBeenCalledTimes(3);
  });
});
