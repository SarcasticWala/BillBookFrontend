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

  const [instance] = usePDF({ document: <InvoicePdfDocument {...doc} /> });
  // `usePDF` reports a failed render by setting `error` and leaving `url` null
  // — it does NOT keep loading. Reading only `loading`/`url` therefore turned
  // every render failure into a "Preparing preview…" that sat there forever
  // with nothing said and nothing to do about it. Treat error as a distinct,
  // visible state.
  const failed = !!instance.error;
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
              {instance.error}
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
