export type PriceRow = { price: number | null; currency: string | null; price_verified_at: string | null };
export const PRICE_FRESH_DAYS = 30;

/** Only a price verified within 30 days is shown as a fact; everything else is labelled unverified. */
export function isPriceVerified(row: PriceRow, now = new Date()): boolean {
  if (row.price === null || !row.price_verified_at) return false;
  const age = now.getTime() - new Date(row.price_verified_at).getTime();
  return age >= 0 && age <= PRICE_FRESH_DAYS * 86400000;
}

export function priceLabel(row: PriceRow, now = new Date()): string {
  if (row.price === null) return "Price not listed";
  if (!isPriceVerified(row, now)) return "Price unverified";
  return `${row.currency ?? ""} ${Number(row.price).toFixed(2)} · verified`.trim();
}
