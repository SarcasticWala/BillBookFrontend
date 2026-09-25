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
  const ready = !instance.loading && !!instance.url;

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
            <Button disabled={!ready}>{ready ? "Download PDF" : "Preparing…"}</Button>
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
        ) : (
          <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">
            Preparing preview…
          </div>
        )}
      </div>
    </Modal>
  );
}
