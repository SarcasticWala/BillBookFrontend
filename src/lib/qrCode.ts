/**
 * Renders a QR-eligible string (e.g. an e-Invoice's signed QR payload) as a
 * PNG data URL. Dynamically imported — the `qrcode` library only loads for
 * the (rare) invoice that actually has a generated e-Invoice, not on every
 * page load (InvoiceDetailPage isn't lazy-loaded, so a static import here
 * would otherwise bloat the main bundle for every user).
 */
export async function toQrDataUrl(text: string): Promise<string> {
  const QRCode = await import("qrcode");
  return QRCode.toDataURL(text, { margin: 1, width: 160 });
}
