import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import { format } from "date-fns";

export interface InvoicePdfItemRow {
  itemName?: string;
  hsnCode?: string;
  quantity?: number;
  pricePerItem?: number;
  taxAmount?: number;
  taxPercentage?: number;
  totalAmount?: number;
}

export interface InvoicePdfBusiness {
  businessName?: string;
  name?: string;
  gstin?: string;
  address?: string;
  state?: string;
  logoUrl?: string;
}

export interface InvoicePdfDocumentProps {
  type: "SALE" | "PURCHASE";
  invoiceNo: string;
  invoiceDate?: string | Date | null;
  dueDate?: string | Date | null;
  partyName: string;
  partyMobile?: string;
  partyGst?: string;
  items: InvoicePdfItemRow[];
  taxable: number;
  tax: number;
  additionalCharges: number;
  discountAfterTax: number;
  total: number;
  paid: number;
  due: number;
  status: string;
  notes?: string;
  termsAndConditions?: string;
  business: InvoicePdfBusiness;
  /** Present only for a generated GST e-Invoice — omitted, this section just doesn't render. */
  eInvoice?: { irn: string; qrDataUrl: string | null };
}

const inr = (v: unknown) => `Rs. ${Number(v || 0).toLocaleString("en-IN")}`;
const fmtDate = (v: unknown) => {
  if (!v) return "-";
  const d = new Date(v as string);
  return isNaN(d.getTime()) ? "-" : format(d, "dd MMM yyyy");
};

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 9, fontFamily: "Helvetica", color: "#1f2937" },
  headerRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 18 },
  logo: { width: 48, height: 48, objectFit: "contain", marginBottom: 6 },
  businessName: { fontSize: 14, fontWeight: 700, marginBottom: 2 },
  muted: { color: "#6b7280" },
  title: { fontSize: 16, fontWeight: 700, textAlign: "right" },
  section: { marginBottom: 14 },
  partyRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 14 },
  label: { fontSize: 8, color: "#6b7280", textTransform: "uppercase", marginBottom: 2 },
  table: { borderTopWidth: 1, borderTopColor: "#e5e7eb" },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    paddingVertical: 6,
    paddingHorizontal: 4,
    fontWeight: 700,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  colItem: { flex: 3 },
  colHsn: { flex: 1.2 },
  colQty: { flex: 0.8, textAlign: "right" },
  colPrice: { flex: 1.2, textAlign: "right" },
  colTax: { flex: 1.2, textAlign: "right" },
  colAmount: { flex: 1.3, textAlign: "right" },
  totals: { alignSelf: "flex-end", width: 220, marginTop: 12 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3 },
  grandRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 6,
    marginTop: 3,
    borderTopWidth: 1,
    borderTopColor: "#1f2937",
    fontWeight: 700,
    fontSize: 11,
  },
  notes: { marginTop: 20, fontSize: 8, color: "#4b5563" },
  eInvoiceBox: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  qrImage: { width: 64, height: 64 },
  irnText: { fontSize: 7, color: "#4b5563", maxWidth: 380 },
});

/**
 * Single source of truth for both the in-app preview (PDFViewer) and the
 * downloaded file (PDFDownloadLink) — same component, same output.
 */
export function InvoicePdfDocument(props: InvoicePdfDocumentProps) {
  const { business } = props;
  const businessName = business.businessName?.trim() || business.name?.trim() || "Your Business";

  return (
    <Document title={`Invoice ${props.invoiceNo}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View>
            {business.logoUrl ? <Image src={business.logoUrl} style={styles.logo} /> : null}
            <Text style={styles.businessName}>{businessName}</Text>
            {business.gstin ? <Text style={styles.muted}>GSTIN: {business.gstin}</Text> : null}
            {business.address ? <Text style={styles.muted}>{business.address}</Text> : null}
            {business.state ? <Text style={styles.muted}>{business.state}</Text> : null}
          </View>
          <View>
            <Text style={styles.title}>
              {props.type === "SALE" ? "TAX INVOICE" : "PURCHASE BILL"}
            </Text>
            <Text style={[styles.muted, { textAlign: "right", marginTop: 4 }]}>
              #{props.invoiceNo || "-"}
            </Text>
          </View>
        </View>

        <View style={styles.partyRow}>
          <View>
            <Text style={styles.label}>{props.type === "SALE" ? "Bill To" : "Supplier"}</Text>
            <Text>{props.partyName}</Text>
            {props.partyMobile ? <Text style={styles.muted}>{props.partyMobile}</Text> : null}
            {props.partyGst ? <Text style={styles.muted}>GSTIN: {props.partyGst}</Text> : null}
          </View>
          <View>
            <Text style={styles.label}>Invoice Date</Text>
            <Text>{fmtDate(props.invoiceDate)}</Text>
            <Text style={[styles.label, { marginTop: 6 }]}>Due Date</Text>
            <Text>{fmtDate(props.dueDate)}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colItem}>Item</Text>
            <Text style={styles.colHsn}>HSN</Text>
            <Text style={styles.colQty}>Qty</Text>
            <Text style={styles.colPrice}>Price</Text>
            <Text style={styles.colTax}>Tax</Text>
            <Text style={styles.colAmount}>Amount</Text>
          </View>
          {props.items.map((row, i) => (
            <View style={styles.tableRow} key={i}>
              <Text style={styles.colItem}>{row.itemName || "-"}</Text>
              <Text style={styles.colHsn}>{row.hsnCode || "-"}</Text>
              <Text style={styles.colQty}>{row.quantity ?? 0}</Text>
              <Text style={styles.colPrice}>{inr(row.pricePerItem)}</Text>
              <Text style={styles.colTax}>
                {inr(row.taxAmount)}
                {row.taxPercentage ? ` (${row.taxPercentage}%)` : ""}
              </Text>
              <Text style={styles.colAmount}>{inr(row.totalAmount)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text>Taxable Amount</Text>
            <Text>{inr(props.taxable)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>Total Tax</Text>
            <Text>{inr(props.tax)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>Additional Charges</Text>
            <Text>{inr(props.additionalCharges)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>Discount</Text>
            <Text>- {inr(props.discountAfterTax)}</Text>
          </View>
          <View style={styles.grandRow}>
            <Text>Grand Total</Text>
            <Text>{inr(props.total)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>{props.type === "SALE" ? "Received" : "Paid"}</Text>
            <Text>{inr(props.paid)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>Balance Due</Text>
            <Text>{inr(props.due)}</Text>
          </View>
        </View>

        {(props.notes || props.termsAndConditions) && (
          <View style={styles.notes}>
            {props.notes ? <Text>Notes: {props.notes}</Text> : null}
            {props.termsAndConditions ? (
              <Text style={{ marginTop: 4 }}>Terms & Conditions: {props.termsAndConditions}</Text>
            ) : null}
          </View>
        )}

        {props.eInvoice ? (
          <View style={styles.eInvoiceBox}>
            {props.eInvoice.qrDataUrl ? (
              <Image src={props.eInvoice.qrDataUrl} style={styles.qrImage} />
            ) : null}
            <View>
              <Text style={styles.label}>IRN (Invoice Reference Number)</Text>
              <Text style={styles.irnText}>{props.eInvoice.irn}</Text>
            </View>
          </View>
        ) : null}
      </Page>
    </Document>
  );
}
