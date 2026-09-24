import { PDFViewer, PDFDownloadLink, usePDF } from "@react-pdf/renderer";
import { Modal } from "../UI/Modal";
import { Button } from "../UI/Button";
import { PosReceiptDocument, type PosReceiptDocumentProps } from "../../pdf/PosReceiptDocument";

interface PosReceiptModalProps extends PosReceiptDocumentProps {
  isOpen: boolean;
  onClose: () => void;
}

/** Same preview-before-download pattern as the invoice PDF modal. */
export function PosReceiptModal({ isOpen, onClose, ...doc }: PosReceiptModalProps) {
  // See InvoicePdfPreviewModal for why this needs its own print action:
  // showToolbar={false} on the PDFViewer below hides the native toolbar
  // (and its print button) that would otherwise come for free.
  const [printInstance] = usePDF({ document: <PosReceiptDocument {...doc} /> });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Receipt #${doc.invoiceNo}`}
      maxWidthClassName="max-w-md"
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
          <PDFDownloadLink
            document={<PosReceiptDocument {...doc} />}
            fileName={`receipt-${doc.invoiceNo}.pdf`}
          >
            {({ loading }) => (
              <Button disabled={loading}>{loading ? "Preparing…" : "Download"}</Button>
            )}
          </PDFDownloadLink>
        </>
      }
    >
      <div className="h-[60vh] rounded-lg overflow-hidden border border-slate-200/80">
        <PDFViewer width="100%" height="100%" showToolbar={false}>
          <PosReceiptDocument {...doc} />
        </PDFViewer>
      </div>
    </Modal>
  );
}
