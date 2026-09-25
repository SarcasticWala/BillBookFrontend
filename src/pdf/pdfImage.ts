/**
 * `@react-pdf/renderer` can only embed JPG, PNG and SVG. Its base64 resolver
 * *throws* on anything else (`Base64 image invalid format: webp`), and because
 * one bad <Image> rejects the whole document render, an unembeddable logo takes
 * the entire invoice down — it surfaces as a preview that never finishes rather
 * than as a missing logo. Business logos are stored inline as
 * `data:<mimetype>;base64,…` straight from whatever the user uploaded, so a
 * WebP logo (what many phones and browsers now produce by default) is a live
 * possibility on any account created before the uploader was narrowed to
 * PNG/JPEG.
 *
 * Returns a src safe to hand to <Image>, or undefined to drop it — losing a
 * logo beats losing the invoice.
 */
const PDF_EMBEDDABLE_DATA_IMAGE = /^data:image\/(jpe?g|png|svg\+xml)\s*[;,]/i;

export function pdfEmbeddableImageSrc(src?: string | null): string | undefined {
  if (!src) return undefined;
  // Remote URLs are fetched and format-sniffed from their bytes by react-pdf,
  // so only inline data URIs can be screened ahead of time here.
  if (!src.startsWith("data:")) return src;
  return PDF_EMBEDDABLE_DATA_IMAGE.test(src) ? src : undefined;
}
