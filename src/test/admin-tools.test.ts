import { describe, expect, it } from "vitest";
import { canStartSupportThread, supportDraftError, MAX_OPEN_SUPPORT_THREADS } from "@/lib/support";
import { parseCatalogueCsv, rowHasListing, IMPORT_MAX_ROWS } from "@/lib/import-csv";
import { labelWithOverride, toOverrideMap, overrideCount } from "@/lib/locale-overrides";

const draft = (subject: string, body: string) => ({ subject, body });

describe("support desk rules", () => {
  it("rejects a message with no subject", () => {
    expect(supportDraftError(draft("   ", "My photo was rejected twice today."))).toMatch(/subject/i);
  });

  it("rejects a body shorter than 10 characters", () => {
    expect(supportDraftError(draft("Help", "too short"))).toMatch(/10 characters/);
  });

  it("rejects a subject longer than 120 characters", () => {
    expect(supportDraftError(draft("a".repeat(121), "a".repeat(20)))).toMatch(/120 characters/);
  });

  it("rejects a body longer than 4000 characters", () => {
    expect(supportDraftError(draft("Help", "a".repeat(4001)))).toMatch(/4000 characters/);
  });

  it("accepts a normal message", () => {
    expect(supportDraftError(draft("Photo rejected", "My photo was rejected twice today, both in daylight."))).toBeNull();
  });

  it("blocks a 4th open thread but allows one after a close", () => {
    const open = [{ status: "open" }, { status: "replied" }, { status: "open" }];
    expect(canStartSupportThread(open)).toBe(false);
    expect(canStartSupportThread([...open, { status: "closed" }])).toBe(false);
    expect(canStartSupportThread([{ status: "open" }, { status: "closed" }, { status: "closed" }])).toBe(true);
    expect(MAX_OPEN_SUPPORT_THREADS).toBe(3);
  });
});

describe("catalogue bulk import sheet", () => {
  it("reads a header line and product rows", () => {
    const out = parseCatalogueCsv("name,brand,category,actives,country,retailer,price,currency,url\nHydrating Serum,Example Lab,serum,hyaluronic acid,Pakistan,Example Store,2499,PKR,https://example.com");
    expect(out.errors).toEqual([]);
    expect(out.rows).toHaveLength(1);
    expect(out.rows[0]).toMatchObject({ name: "Hydrating Serum", brand: "Example Lab", country: "Pakistan", price: "2499", currency: "PKR" });
  });

  it("skips blank lines, comments and rows with no name", () => {
    const out = parseCatalogueCsv("# a note\n\n,,serum\nNight Cream,Lab,cream,retinol\n");
    expect(out.rows.map((r) => r.name)).toEqual(["Night Cream"]);
    expect(out.errors[0]).toMatch(/no product name/i);
  });

  it("rejects a price that is not a number and a currency that is not 3 letters", () => {
    expect(parseCatalogueCsv("Aurora Gel,Lab,gel,,Pakistan,Shop,abc,PKR").errors[0]).toMatch(/not a number/);
    expect(parseCatalogueCsv("Aurora Gel,Lab,gel,,Pakistan,Shop,99,PAKR").errors[0]).toMatch(/3 letters/);
  });

  it("keeps a product with no country as product-only", () => {
    const out = parseCatalogueCsv("Aurora Gel,Lab,gel,niacinamide");
    expect(out.rows).toHaveLength(1);
    expect(rowHasListing(out.rows[0])).toBe(false);
  });

  it("stops after the row limit", () => {
    const many = Array.from({ length: IMPORT_MAX_ROWS + 5 }, () => "Product,Lab,cream").join("\n");
    const out = parseCatalogueCsv(many);
    expect(out.rows).toHaveLength(IMPORT_MAX_ROWS);
    expect(out.errors.some((e) => /first 500 lines/.test(e))).toBe(true);
  });
});

describe("interface label overrides", () => {
  it("lets the maintainer's wording win over the built-in label", () => {
    const map = toOverrideMap([{ locale: "ur", label_key: "overview", label_value: "Aap ka jaiza" }]);
    expect(labelWithOverride(map, "ur", "overview", "جائزہ")).toBe("Aap ka jaiza");
    expect(labelWithOverride(map, "en", "overview", "Overview")).toBe("Overview");
  });

  it("ignores an empty override", () => {
    const map = toOverrideMap([{ locale: "ur", label_key: "overview", label_value: "   " }]);
    expect(labelWithOverride(map, "ur", "overview", "جائزہ")).toBe("جائزہ");
    expect(overrideCount(map)).toBe(1);
  });
});
