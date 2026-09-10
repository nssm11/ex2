/**
 * Text helpers for French search, kept free of any server-only import so they
 * can be unit-tested and reused by the client if needed.
 *
 * The catalogue used to rely on the PostgreSQL `unaccent` extension for
 * accent-insensitive search. That extension is not created by `drizzle-kit
 * push` and is often not installable on a managed database, so every query
 * failed with `function unaccent(character varying) does not exist` — the
 * search bar looked dead. Folding is therefore done here instead: the same
 * table is applied to the user's input in JS and to the columns in SQL, so
 * "serum" matches "Sérum" and "creme" matches "Crème" on any PostgreSQL.
 */

/**
 * Accented groups and the ASCII letter each folds to. Both SQL strings below
 * are derived from this list, so they can never drift out of alignment —
 * a mismatch would silently fold a letter to the wrong character.
 */
const FOLD_GROUPS: [string, string][] = [
  ["àâäáãå", "a"],
  ["ÀÂÄÁÃÅ", "a"],
  ["èêëé", "e"],
  ["ÈÊËÉ", "e"],
  ["ìîïí", "i"],
  ["ÌÎÏÍ", "i"],
  ["òôöóõ", "o"],
  ["ÒÔÖÓÕ", "o"],
  ["ùûüú", "u"],
  ["ÙÛÜÚ", "u"],
  ["ç", "c"],
  ["Ç", "c"],
  ["ñ", "n"],
  ["Ñ", "n"],
  ["ýÿ", "y"],
  ["ÝŸ", "y"],
  ["æ", "a"],
  ["Æ", "a"],
  ["œ", "o"],
  ["Œ", "o"],
  ["ß", "s"],
  ["đ", "d"],
  ["Đ", "d"],
  ["ł", "l"],
  ["Ł", "l"],
];

/**
 * Accented characters, in the exact order of their replacement below.
 * Kept in sync with {@link FOLDED} by construction.
 */
export const ACCENTED = FOLD_GROUPS.map(([chars]) => chars).join("");

/** ASCII replacement for each character of {@link ACCENTED}. */
export const FOLDED = FOLD_GROUPS.flatMap(([chars, replacement]) => [...chars].map(() => replacement)).join("");

/**
 * Fold accents and lowercase a string. The SQL side uses
 * `lower(translate(col, ACCENTED, FOLDED))` — keep the two tables in sync.
 */
export function foldText(value: string): string {
  let out = "";
  for (const ch of value.toLowerCase()) {
    const i = ACCENTED.indexOf(ch);
    out += i >= 0 ? FOLDED[i] : ch;
  }
  return out;
}

/**
 * Split a query into the tokens a product must match. Every token has to
 * appear somewhere, so "crème solaire" no longer returns every cream in the
 * shop. Bounded so a pathological query cannot build a huge SQL clause.
 */
export function searchTokens(query: string, max = 6): string[] {
  return foldText(query)
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 0)
    .slice(0, max);
}

/** Escape LIKE wildcards so a customer typing "50%" cannot break the pattern. */
export function likePattern(token: string): string {
  return `%${token.replace(/[\\%_]/g, (m) => `\\${m}`)}%`;
}
