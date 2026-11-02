import { describe, expect, it } from "vitest";
import { YoucamError, withKeyFallback } from "@/lib/youcam-keys";

describe("YouCam backup key", () => {
  it("switches to the second key when the first is out of credits", async () => {
    const r = await withKeyFallback(["k1", "k2"], async (k) => { if (k === "k1") throw new YoucamError("credits", 402); return "ok"; });
    expect(r.key).toBe("k2");
  });
  it("keeps using the first key while it works", async () => {
    const r = await withKeyFallback(["k1", "k2"], async () => "ok");
    expect(r.key).toBe("k1");
  });
  it("does not switch for a bad photo", async () => {
    await expect(withKeyFallback(["k1", "k2"], async () => { throw new YoucamError("photo", 400); })).rejects.toThrow("photo");
  });
});
