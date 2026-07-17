/** Format money for display with the Indian locale (never hand-concatenate ₹). */
export function formatCurrency(
  amount: number | null | undefined,
  currency: "INR" | "USD" = "INR"
): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));
}
