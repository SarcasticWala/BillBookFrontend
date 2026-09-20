import { PDFViewer, PDFDownloadLink } from "@react-pdf/renderer";
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
