/**
 * Shrink a user-picked image before upload.
 *
 * The business logo is stored inline as a base64 data URI and re-embedded in
 * every invoice PDF, so its raw size is paid over and over. A photo straight
 * off a phone ran to ~1.6 MB base64 — 80% of the app's total page weight, and
 * the reason invoice previews took seconds to appear. At the size a logo is
 * actually displayed (a sidebar avatar, a PDF header) a few hundred pixels is
 * plenty, and that lands in the tens of KB.
 *
 * PNG is the output format because logos commonly have transparency, which
 * JPEG would flatten to black. PNG is also one of the three formats
 * @react-pdf/renderer can embed (see `pdfEmbeddableImageSrc`), so downscaling
 * doubles as a guarantee that the result is PDF-safe whatever was picked.
 *
 * Falls back to the original file if the browser can't decode it, rather than
 * blocking the upload.
 */
export async function downscaleImageFile(
  file: File,
  maxEdge = 256
): Promise<File> {
  const bitmap = await loadBitmap(file);
  if (!bitmap) return file;

  const { width, height } = bitmap;
  // Never upscale — a logo that is already small stays untouched apart from
  // the format normalisation.
  const scale = Math.min(1, maxEdge / Math.max(width, height));
  const targetW = Math.max(1, Math.round(width * scale));
  const targetH = Math.max(1, Math.round(height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, targetW, targetH);
  if ("close" in bitmap) bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/png")
  );
  if (!blob) return file;

  const name = file.name.replace(/\.[^.]+$/, "") || "logo";
  return new File([blob], `${name}.png`, { type: "image/png" });
}

async function loadBitmap(file: File): Promise<ImageBitmap | HTMLImageElement | null> {
  // createImageBitmap decodes off the main thread where available.
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file);
    } catch {
      /* fall through to the <img> path */
    }
  }
  const url = URL.createObjectURL(file);
  try {
    return await new Promise<HTMLImageElement | null>((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}
