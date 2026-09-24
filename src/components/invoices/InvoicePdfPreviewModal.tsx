import { PDFViewer, PDFDownloadLink, usePDF } from "@react-pdf/renderer";
import { Modal } from "../UI/Modal";
import { Button } from "../UI/Button";
import { InvoicePdfDocument, type InvoicePdfDocumentProps } from "../../pdf/InvoicePdfDocument";

interface InvoicePdfPreviewModalProps extends InvoicePdfDocumentProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Preview-before-download: the same InvoicePdfDocument renders both the
 * on-screen preview (PDFViewer) and the actual downloaded file
 * (PDFDownloadLink), so what you see here is exactly what you get.
 */
export function InvoicePdfPreviewModal({
  isOpen,
  onClose,
  ...doc
}: InvoicePdfPreviewModalProps) {
  const fileName = `${doc.type === "SALE" ? "invoice" : "purchase-bill"}-${
    doc.invoiceNo || "draft"
  }.pdf`;

  // The in-modal PDFViewer runs with showToolbar={false} (its native toolbar
  // is Chrome-only and looks out of place inline), which also hides the
  // print button that toolbar would otherwise provide — so there was
  // previously no way to print at all short of downloading first. Opening
  // the rendered PDF in a new tab hands it to the browser's own PDF viewer,
  // which has real print/zoom controls on every major browser.
  const [printInstance] = usePDF({ document: <InvoicePdfDocument {...doc} /> });

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
            disabled={printInstance.loading || !printInstance.url}
            onClick={() => printInstance.url && window.open(printInstance.url, "_blank")}
          >
            Print
          </Button>
          <PDFDownloadLink document={<InvoicePdfDocument {...doc} />} fileName={fileName}>
            {({ loading }) => (
              <Button disabled={loading}>{loading ? "Preparing…" : "Download PDF"}</Button>
            )}
          </PDFDownloadLink>
        </>
      }
    >
      <div className="h-[70vh] rounded-lg overflow-hidden border border-slate-200/80">
        <PDFViewer width="100%" height="100%" showToolbar={false}>
          <InvoicePdfDocument {...doc} />
        </PDFViewer>
      </div>
    </Modal>
  );
}
