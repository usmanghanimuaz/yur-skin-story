import { describe, expect, it } from "vitest";
import { isPriceVerified, priceLabel } from "@/lib/catalogue";
import { translate, isRtl } from "@/lib/i18n";

const now = new Date("2026-10-31T00:00:00Z");
describe("catalogue prices", () => {
  it("never shows an unverified price as fact", () => {
    expect(priceLabel({ price: 1200, currency: "PKR", price_verified_at: null }, now)).toBe("Price unverified");
  });
  it("treats prices older than 30 days as stale", () => {
    expect(isPriceVerified({ price: 10, currency: "EUR", price_verified_at: "2026-09-20T00:00:00Z" }, now)).toBe(false);
  });
  it("shows a recently verified price", () => {
    expect(priceLabel({ price: 10, currency: "EUR", price_verified_at: "2026-10-25T00:00:00Z" }, now)).toBe("EUR 10.00 · verified");
  });
});
describe("locales", () => {
  it("uses RTL only for Urdu script", () => { expect(isRtl("ur")).toBe(true); expect(isRtl("ur-Latn")).toBe(false); });
  it("falls back to English for unknown locales", () => { expect(translate("xx", "overview")).toBe("Overview"); });
});
