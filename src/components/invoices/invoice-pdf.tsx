import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { format } from 'date-fns';

const s = (color: string) => StyleSheet.create({
    page: { fontFamily: 'Helvetica', fontSize: 10, color: '#1f2937', padding: 40 },
    header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
    invoiceTitle: { fontSize: 26, fontWeight: 'bold', color: color },
    invoiceNum: { fontSize: 11, color: '#6b7280', marginTop: 4 },
    partiesRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
    partyBox: { width: '45%' },
    partyLabel: { fontSize: 8, textTransform: 'uppercase', color: '#9ca3af', letterSpacing: 1, marginBottom: 6 },
    partyName: { fontSize: 12, fontWeight: 'bold', marginBottom: 2 },
    partyText: { fontSize: 9, color: '#6b7280', lineHeight: 1.5 },
    tableHead: { flexDirection: 'row', backgroundColor: color, padding: '8 12', borderRadius: 6, marginBottom: 2 },
    tableHeadText: { color: '#fff', fontSize: 9, fontWeight: 'bold' },
    tableRow: { flexDirection: 'row', padding: '8 12', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: color, padding: '10 12', borderRadius: 6, marginTop: 4 },
    totalText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
    footer: { position: 'absolute', bottom: 30, left: 40, right: 40, flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 10 },
    footerText: { fontSize: 8, color: '#9ca3af' },
    stamp: { position: 'absolute', top: 100, right: 40, fontSize: 36, fontWeight: 'bold', opacity: 0.1, transform: 'rotate(-30deg)' },
});

export function InvoicePDF({ invoice }: { invoice: any }) {
    const color = invoice.templateColor || '#2563EB';
    const styles = s(color);
    const fmt = (n: number) =>
        new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(n);

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {invoice.status === 'PAID' && (
                    <Text style={[styles.stamp, { color: '#16a34a' }]}>PAID</Text>
                )}

                <View style={styles.header}>
                    <View>
                        <Text style={{ fontSize: 16, fontWeight: 'bold', color }}>{invoice.fromName}</Text>
                        <Text style={styles.partyText}>{invoice.fromAddress}</Text>
                        {invoice.fromGstin && <Text style={styles.partyText}>GSTIN: {invoice.fromGstin}</Text>}
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.invoiceTitle}>INVOICE</Text>
                        <Text style={styles.invoiceNum}># {invoice.invoiceNumber}</Text>
                        <Text style={[styles.partyText, { marginTop: 4 }]}>
                            Date: {format(new Date(invoice.invoiceDate), 'MMM d, yyyy')}
                        </Text>
                        {invoice.dueDate && (
                            <Text style={[styles.partyText, { color: invoice.status === 'OVERDUE' ? '#dc2626' : '#6b7280' }]}>
                                Due: {format(new Date(invoice.dueDate), 'MMM d, yyyy')}
                            </Text>
                        )}
                    </View>
                </View>

                <View style={styles.partiesRow}>
                    <View style={styles.partyBox}>
                        <Text style={styles.partyLabel}>Billed To</Text>
                        <Text style={styles.partyName}>{invoice.toName}</Text>
                        <Text style={styles.partyText}>{invoice.toAddress}</Text>
                        {invoice.toGstin && <Text style={styles.partyText}>GSTIN: {invoice.toGstin}</Text>}
                        {invoice.toPan && <Text style={styles.partyText}>PAN: {invoice.toPan}</Text>}
                        <Text style={styles.partyText}>{invoice.toEmail}</Text>
                    </View>
                    {invoice.fromBankAccountNumber && (
                        <View style={[styles.partyBox, { backgroundColor: '#f9fafb', padding: 10, borderRadius: 8 }]}>
                            <Text style={[styles.partyLabel, { color: color }]}>Bank Details</Text>
                            <Text style={styles.partyText}>A/C: {invoice.fromBankAccountNumber}</Text>
                            <Text style={styles.partyText}>IFSC: {invoice.fromBankIfsc}</Text>
                            <Text style={styles.partyText}>Bank: {invoice.fromBankName}</Text>
                        </View>
                    )}
                </View>

                <View style={styles.tableHead}>
                    <Text style={[styles.tableHeadText, { flex: 3 }]}>Description</Text>
                    <Text style={[styles.tableHeadText, { flex: 1, textAlign: 'center' }]}>Qty</Text>
                    <Text style={[styles.tableHeadText, { flex: 1, textAlign: 'right' }]}>Rate</Text>
                    <Text style={[styles.tableHeadText, { flex: 1, textAlign: 'right' }]}>Tax%</Text>
                    <Text style={[styles.tableHeadText, { flex: 1, textAlign: 'right' }]}>Amount</Text>
                </View>

                {invoice.lineItems.map((item: any, i: number) => (
                    <View key={item.id} style={[styles.tableRow, i % 2 === 1 ? { backgroundColor: '#fafafa' } : {}]}>
                        <Text style={{ flex: 3, fontSize: 9 }}>{item.description}</Text>
                        <Text style={{ flex: 1, textAlign: 'center', fontSize: 9 }}>{item.quantity}</Text>
                        <Text style={{ flex: 1, textAlign: 'right', fontSize: 9 }}>{fmt(item.rate)}</Text>
                        <Text style={{ flex: 1, textAlign: 'right', fontSize: 9 }}>{item.taxRate}%</Text>
                        <Text style={{ flex: 1, textAlign: 'right', fontSize: 9 }}>{fmt(item.amount)}</Text>
                    </View>
                ))}

                <View style={{ alignItems: 'flex-end', marginTop: 16, marginBottom: 24 }}>
                    <View style={{ width: '40%' }}>
                        {invoice.cgstAmount > 0 && (
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: '4 0', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' }}>
                                <Text style={{ color: '#6b7280', fontSize: 9 }}>CGST ({invoice.cgstRate}%)</Text>
                                <Text style={{ fontSize: 9 }}>{fmt(invoice.cgstAmount)}</Text>
                            </View>
                        )}
                        {invoice.sgstAmount > 0 && (
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: '4 0', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' }}>
                                <Text style={{ color: '#6b7280', fontSize: 9 }}>SGST ({invoice.sgstRate}%)</Text>
                                <Text style={{ fontSize: 9 }}>{fmt(invoice.sgstAmount)}</Text>
                            </View>
                        )}
                        {invoice.igstAmount > 0 && (
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: '4 0', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' }}>
                                <Text style={{ color: '#6b7280', fontSize: 9 }}>IGST ({invoice.igstRate}%)</Text>
                                <Text style={{ fontSize: 9 }}>{fmt(invoice.igstAmount)}</Text>
                            </View>
                        )}
                        {invoice.discountAmount > 0 && (
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: '4 0', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' }}>
                                <Text style={{ color: '#16a34a', fontSize: 9 }}>Discount</Text>
                                <Text style={{ color: '#16a34a', fontSize: 9 }}>-{fmt(invoice.discountAmount)}</Text>
                            </View>
                        )}
                        <View style={styles.totalRow}>
                            <Text style={styles.totalText}>Total Due</Text>
                            <Text style={[styles.totalText, { fontSize: 14 }]}>{fmt(invoice.totalAmount)}</Text>
                        </View>
                    </View>
                </View>

                {invoice.notes && (
                    <View style={{ borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 12, marginBottom: 12 }}>
                        <Text style={styles.partyLabel}>Notes</Text>
                        <Text style={styles.partyText}>{invoice.notes}</Text>
                    </View>
                )}

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Generated by TaxMate • taxmate.in</Text>
                    <Text style={styles.footerText}>Thank you for your business!</Text>
                </View>
            </Page>
        </Document>
    );
}
