/** Parser for the catalogue bulk-import sheet. Pure and browser-safe so the rules can be tested. */

export const IMPORT_MAX_ROWS = 500;
export const COLUMNS = ["name", "brand", "category", "actives", "country", "retailer", "price", "currency", "url"] as const;
export type ImportColumn = (typeof COLUMNS)[number];

export type CatalogueRow = Record<ImportColumn, string>;
export type ParsedImport = { rows: CatalogueRow[]; errors: string[] };

const blank = (): CatalogueRow => ({ name: "", brand: "", category: "", actives: "", country: "", retailer: "", price: "", currency: "", url: "" });

/** Reads one product (and its listing) per line. Commas inside a value are not supported. */
export function parseCatalogueCsv(text: string): ParsedImport {
  const rows: CatalogueRow[] = [];
  const errors: string[] = [];
  const lines = text.split(/\r?\n/);
  let headerSkipped = false;

  for (const line of lines) {
    if (!line.trim() || line.trimStart().startsWith("#")) continue;
    const cells = line.split(",").map((c) => c.trim());
    if (!headerSkipped && cells[0]?.toLowerCase() === "name") { headerSkipped = true; continue; }
    headerSkipped = true;
    const row = blank();
    COLUMNS.forEach((key, i) => { row[key] = cells[i] ?? ""; });
    if (!row.name) { errors.push(`Line skipped: no product name in "${line.slice(0, 40)}".`); continue; }
    if (row.price && !Number.isFinite(Number(row.price))) { errors.push(`Line skipped for ${row.name}: "${row.price}" is not a number.`); continue; }
    if (row.currency && row.currency.length !== 3) { errors.push(`Line skipped for ${row.name}: currency must be 3 letters, e.g. PKR.`); continue; }
    rows.push(row);
    if (rows.length >= IMPORT_MAX_ROWS) { errors.push(`Only the first ${IMPORT_MAX_ROWS} lines were read.`); break; }
  }
  return { rows, errors };
}

/** Does this line carry a country, i.e. should a availability listing be created for it? */
export function rowHasListing(row: CatalogueRow): boolean {
  return Boolean(row.country.trim());
}
