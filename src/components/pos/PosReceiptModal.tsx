import { usePDF } from "@react-pdf/renderer";
import { Modal } from "../UI/Modal";
import { Button } from "../UI/Button";
import { PosReceiptDocument, type PosReceiptDocumentProps } from "../../pdf/PosReceiptDocument";

interface PosReceiptModalProps extends PosReceiptDocumentProps {
  isOpen: boolean;
  onClose: () => void;
}

/** Same single-shared-render pattern as InvoicePdfPreviewModal — see there
 * for why (three independent renders of the same document was the actual
 * cause of the modal being slow to open, not something to paper over). */
export function PosReceiptModal({ isOpen, onClose, ...doc }: PosReceiptModalProps) {
  const fileName = `receipt-${doc.invoiceNo}.pdf`;
  const [instance] = usePDF({ document: <PosReceiptDocument {...doc} /> });
  const ready = !instance.loading && !!instance.url;

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
            disabled={!ready}
            onClick={() => instance.url && window.open(instance.url, "_blank")}
          >
            Print
          </Button>
          <a href={instance.url || undefined} download={ready ? fileName : undefined}>
            <Button disabled={!ready}>{ready ? "Download" : "Preparing…"}</Button>
          </a>
        </>
      }
    >
      <div className="h-[60vh] rounded-lg overflow-hidden border border-slate-200/80">
        {ready ? (
          <iframe
            src={`${instance.url}#toolbar=0`}
            title={`Receipt ${doc.invoiceNo || ""}`}
            className="w-full h-full border-0"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">
            Preparing receipt…
          </div>
        )}
      </div>
    </Modal>
  );
}
