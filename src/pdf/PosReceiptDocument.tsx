import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { format } from "date-fns";

export interface PosReceiptItemRow {
  itemName?: string;
  quantity?: number;
  pricePerItem?: number;
  totalAmount?: number;
}

export interface PosReceiptPayment {
  accountName?: string;
  amount: number;
}

export interface PosReceiptDocumentProps {
  invoiceNo: string;
  invoiceDate?: string | Date | null;
  partyName: string;
  items: PosReceiptItemRow[];
  taxable: number;
  tax: number;
  total: number;
  payments: PosReceiptPayment[];
  businessName?: string;
  gstin?: string;
}

const inr = (v: unknown) => `Rs. ${Number(v || 0).toFixed(2)}`;
const fmtDate = (v: unknown) => {
  if (!v) return "-";
  const d = new Date(v as string);
  return isNaN(d.getTime()) ? "-" : format(d, "dd MMM yyyy, HH:mm");
};

// 80mm thermal receipt width.
const RECEIPT_WIDTH = 227; // points (~80mm)

const styles = StyleSheet.create({
  page: { padding: 12, fontSize: 8, fontFamily: "Helvetica" },
  center: { textAlign: "center" },
  businessName: { fontSize: 11, fontWeight: 700, marginBottom: 2, textAlign: "center" },
  muted: { color: "#4b5563", textAlign: "center" },
  divider: { borderTopWidth: 1, borderTopColor: "#000", borderStyle: "dashed", marginVertical: 6 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 2 },
  itemRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 3 },
  colName: { flex: 2 },
  colQty: { flex: 0.6, textAlign: "center" },
  colAmount: { flex: 1, textAlign: "right" },
  grand: { fontSize: 10, fontWeight: 700 },
  footer: { marginTop: 10, textAlign: "center", color: "#4b5563" },
});

export function PosReceiptDocument(props: PosReceiptDocumentProps) {
  return (
    <Document title={`Receipt ${props.invoiceNo}`}>
      <Page size={[RECEIPT_WIDTH, 800]} style={styles.page}>
        <Text style={styles.businessName}>{props.businessName || "Your Business"}</Text>
        {props.gstin ? <Text style={styles.muted}>GSTIN: {props.gstin}</Text> : null}

        <View style={styles.divider} />
        <View style={styles.row}>
          <Text>Receipt #{props.invoiceNo}</Text>
        </View>
        <View style={styles.row}>
          <Text>{fmtDate(props.invoiceDate)}</Text>
        </View>
        <View style={styles.row}>
          <Text>{props.partyName}</Text>
        </View>
        <View style={styles.divider} />

        {props.items.map((row, i) => (
          <View style={styles.itemRow} key={i}>
            <Text style={styles.colName}>{row.itemName || "-"}</Text>
            <Text style={styles.colQty}>x{row.quantity ?? 0}</Text>
            <Text style={styles.colAmount}>{inr(row.totalAmount)}</Text>
          </View>
        ))}

        <View style={styles.divider} />
        <View style={styles.row}>
          <Text>Taxable</Text>
          <Text>{inr(props.taxable)}</Text>
        </View>
        <View style={styles.row}>
          <Text>Tax</Text>
          <Text>{inr(props.tax)}</Text>
        </View>
        <View style={[styles.row, styles.grand]}>
          <Text>Total</Text>
          <Text>{inr(props.total)}</Text>
        </View>
        <View style={styles.divider} />

        {props.payments.map((p, i) => (
          <View style={styles.row} key={i}>
            <Text>{p.accountName || "Payment"}</Text>
            <Text>{inr(p.amount)}</Text>
          </View>
        ))}

        <Text style={styles.footer}>Thank you for your business!</Text>
      </Page>
    </Document>
  );
}
