/**
 * A unique key for a single logical create attempt. Generated once when a
 * create form/modal opens and sent as the `Idempotency-Key` header, so a
 * double-click or network retry can't create a duplicate record.
 */
export function newIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
