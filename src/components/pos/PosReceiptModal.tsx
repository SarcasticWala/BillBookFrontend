import { PDFViewer, PDFDownloadLink } from "@react-pdf/renderer";
import { Modal } from "../UI/Modal";
import { Button } from "../UI/Button";
import { PosReceiptDocument, type PosReceiptDocumentProps } from "../../pdf/PosReceiptDocument";

interface PosReceiptModalProps extends PosReceiptDocumentProps {
  isOpen: boolean;
  onClose: () => void;
}

/** Same preview-before-download pattern as the invoice PDF modal. */
export function PosReceiptModal({ isOpen, onClose, ...doc }: PosReceiptModalProps) {
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
          <PDFDownloadLink
            document={<PosReceiptDocument {...doc} />}
            fileName={`receipt-${doc.invoiceNo}.pdf`}
          >
            {({ loading }) => (
              <Button disabled={loading}>{loading ? "Preparing…" : "Download / Print"}</Button>
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
