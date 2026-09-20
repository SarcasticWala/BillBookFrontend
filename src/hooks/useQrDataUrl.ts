import { useEffect, useState } from "react";
import { toQrDataUrl } from "../lib/qrCode";

/** Resolves a QR-eligible string into a rendered PNG data URL, or null while pending/absent. */
export function useQrDataUrl(text?: string | null): string | null {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (!text) {
      setDataUrl(null);
      return;
    }
    toQrDataUrl(text)
      .then((url) => {
        if (active) setDataUrl(url);
      })
      .catch(() => {
        if (active) setDataUrl(null);
      });
    return () => {
      active = false;
    };
  }, [text]);

  return dataUrl;
}
