import { useEffect, useRef, useState } from "react";
import { usePDF } from "@react-pdf/renderer";
import { Modal } from "../UI/Modal";
import { Button } from "../UI/Button";
import { InvoicePdfDocument, type InvoicePdfDocumentProps } from "../../pdf/InvoicePdfDocument";

interface InvoicePdfPreviewModalProps extends InvoicePdfDocumentProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Preview-before-download: a single shared render (`usePDF`) drives the
 * on-screen preview, Print and Download — previously each of those used its
 * own separate component (`PDFViewer`, a manual `usePDF`, `PDFDownloadLink`),
 * which independently re-rendered the identical document three times in
 * parallel and made every open of this modal three times slower than it
 * needed to be for no benefit.
 */
export function InvoicePdfPreviewModal({
  isOpen,
  onClose,
  ...doc
}: InvoicePdfPreviewModalProps) {
  const fileName = `${doc.type === "SALE" ? "invoice" : "purchase-bill"}-${
    doc.invoiceNo || "draft"
  }.pdf`;

  const [instance, update] = usePDF({ document: <InvoicePdfDocument {...doc} /> });

  // A cheap signature of everything the document renders from. The two image
  // fields can be megabytes of base64, so they contribute their *length*
  // rather than their contents — enough to notice a change, cheap to compute
  // every render.
  const signature = JSON.stringify({
    ...doc,
    business: {
      ...doc.business,
      logoUrl: doc.business?.logoUrl?.length ?? 0,
    },
    paymentQrDataUrl: doc.paymentQrDataUrl?.length ?? 0,
    eInvoice: doc.eInvoice
      ? { irn: doc.eInvoice.irn, qr: doc.eInvoice.qrDataUrl?.length ?? 0 }
      : null,
  });

  // `usePDF` builds its render pipeline in a `useEffect` with an EMPTY
  // dependency array, so the document it captures at mount is the only one it
  // ever renders — passing a new element on re-render does nothing. Anything
  // that arrives after the modal opens (the business logo, the bank account
  // behind the Scan-to-Pay QR, the profile itself) would silently never make
  // it into the PDF. `update` is the library's escape hatch for exactly this;
  // discarding it, as this component did, is what made the output stale.
  const mounted = useRef(false);
  useEffect(() => {
    // Skip the first run: the mount effect inside usePDF has already queued
    // this exact document, and re-queueing it just renders twice.
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    update(<InvoicePdfDocument {...doc} />);
    // `doc` is covered by `signature`; depending on it directly would re-fire
    // on every render because the parent rebuilds `business` inline.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, update]);

  // `usePDF` reports a failed render by setting `error` and leaving `url` null
  // — it does NOT keep loading. Reading only `loading`/`url` therefore turned
  // every render failure into a "Preparing preview…" that sat there forever
  // with nothing said and nothing to do about it. Treat error as a distinct,
  // visible state.
  //
  // The watchdog covers the other half: a render that neither resolves nor
  // rejects. The library's success/error events come from an internal queue,
  // and if one is never emitted `loading` stays true for good — an eternal
  // spinner that tells the user nothing and leaves no trace to debug. After
  // 20 seconds, say so.
  const [timedOut, setTimedOut] = useState(false);
  useEffect(() => {
    if (!instance.loading) {
      setTimedOut(false);
      return;
    }
    const t = setTimeout(() => setTimedOut(true), 20_000);
    return () => clearTimeout(t);
  }, [instance.loading, signature]);

  const failed = !!instance.error || timedOut;
  const ready = !instance.loading && !!instance.url && !failed;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Invoice #${doc.invoiceNo || "-"}`}
      maxWidthClassName="max-w-3xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="outline"
            disabled={!ready}
            onClick={() => instance.url && window.open(instance.url, "_blank")}
          >
            Print
          </Button>
          <a href={instance.url || undefined} download={ready ? fileName : undefined}>
            <Button disabled={!ready}>
              {ready ? "Download PDF" : failed ? "Unavailable" : "Preparing…"}
            </Button>
          </a>
        </>
      }
    >
      <div className="h-[70vh] rounded-lg overflow-hidden border border-slate-200/80">
        {ready ? (
          // Same technique PDFViewer uses internally (a blob: URL in an
          // iframe) — just pointed at the one shared instance above instead
          // of triggering its own independent render.
          <iframe
            src={`${instance.url}#toolbar=0`}
            title={`Invoice ${doc.invoiceNo || ""}`}
            className="w-full h-full border-0"
          />
        ) : failed ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 px-6 text-center">
            <div className="w-11 h-11 rounded-full bg-red-50 flex items-center justify-center text-xl">
              ⚠️
            </div>
            <p className="text-sm text-gray-900">Couldn’t generate this PDF</p>
            <p className="text-xs text-gray-500 max-w-md break-words">
              {instance.error
                ? String(instance.error)
                : "The preview didn’t finish rendering. Close and try again — if it keeps happening, the browser console will show why."}
            </p>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">
            Preparing preview…
          </div>
        )}
      </div>
    </Modal>
  );
}
