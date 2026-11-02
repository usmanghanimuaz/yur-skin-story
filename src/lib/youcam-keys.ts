/** Statuses that mean "this YouCam account can't serve the request" — try the backup key. */
export const SWITCH_KEY = new Set([401, 402, 403, 429]);

export class YoucamError extends Error {
  constructor(msg: string, public status: number) { super(msg); }
}

/** Runs `fn` with each key in order, moving on only when an account is rejected or out of credits. */
export async function withKeyFallback<T>(keys: string[], fn: (key: string) => Promise<T>): Promise<{ key: string; value: T }> {
  for (const [i, key] of keys.entries()) {
    try {
      return { key, value: await fn(key) };
    } catch (e) {
      if (!(e instanceof YoucamError && SWITCH_KEY.has(e.status)) || i === keys.length - 1) throw e;
    }
  }
  throw new Error("No YouCam key is configured.");
}
