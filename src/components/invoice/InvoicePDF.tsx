import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'

// @react-pdf/renderer only supports TTF/OTF fonts.
// Using the default Helvetica font for compatibility.

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: 'Helvetica',
        fontSize: 10,
        color: '#1a1a1a',
        backgroundColor: '#ffffff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 40,
        borderBottomWidth: 2,
        borderBottomColor: '#f3f4f6',
        paddingBottom: 20,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    logoPlaceholder: {
        width: 40,
        height: 40,
        backgroundColor: '#f97316', // Default primary if logo missing
        borderRadius: 8,
    },
    companyName: {
        fontSize: 20,
        fontWeight: 900,
        textTransform: 'uppercase',
        letterSpacing: -0.5,
    },
    companyDetails: {
        marginTop: 8,
        color: '#6b7280',
        fontSize: 9,
        lineHeight: 1.4,
    },
    invoiceInfo: {
        textAlign: 'right',
    },
    invoiceLabel: {
        fontSize: 32,
        fontWeight: 900,
        color: '#f3f4f6',
        textTransform: 'uppercase',
        marginBottom: -5,
    },
    invoiceNumber: {
        fontSize: 12,
        fontWeight: 700,
    },
    billingSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 40,
    },
    column: {
        width: '45%',
    },
    sectionLabel: {
        fontSize: 8,
        fontWeight: 900,
        color: '#9ca3af',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginBottom: 8,
    },
    clientName: {
        fontSize: 14,
        fontWeight: 700,
        marginBottom: 4,
    },
    clientDetails: {
        color: '#4b5563',
        lineHeight: 1.4,
    },
    dateItem: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 20,
        marginBottom: 4,
    },
    dateLabel: {
        color: '#9ca3af',
        fontWeight: 700,
    },
    dateValue: {
        fontWeight: 700,
    },
    table: {
        marginBottom: 30,
    },
    tableHeader: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        paddingBottom: 8,
        marginBottom: 12,
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    descriptionCol: {
        flex: 1,
    },
    amountCol: {
        width: 100,
        textAlign: 'right',
    },
    tableHeaderText: {
        fontSize: 8,
        fontWeight: 900,
        color: '#9ca3af',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    categoryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 15,
        marginBottom: 8,
    },
    categoryLabel: {
        fontSize: 9,
        fontWeight: 900,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    totalsSection: {
        flexDirection: 'column',
        alignItems: 'flex-end',
        marginTop: 20,
        gap: 8,
    },
    totalItem: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 30,
        width: 200,
    },
    totalLabel: {
        fontSize: 9,
        fontWeight: 700,
        color: '#6b7280',
        textTransform: 'uppercase',
    },
    totalValue: {
        fontSize: 11,
        fontWeight: 700,
        width: 80,
        textAlign: 'right',
    },
    grandTotalItem: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 30,
        marginTop: 15,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        width: 250,
    },
    grandTotalLabel: {
        fontSize: 12,
        fontWeight: 900,
        textTransform: 'uppercase',
    },
    grandTotalValue: {
        fontSize: 24,
        fontWeight: 900,
        width: 120,
        textAlign: 'right',
    },
    notesSection: {
        marginTop: 50,
    },
    notesBox: {
        backgroundColor: '#f9fafb',
        padding: 15,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#f3f4f6',
    },
    notesText: {
        fontSize: 9,
        color: '#4b5563',
        lineHeight: 1.5,
        fontStyle: 'italic',
    }
})

interface InvoicePDFProps {
    invoice: any
    settings: any
}

export function InvoicePDF({ invoice, settings }: InvoicePDFProps) {
    const brandColor = settings?.brand_color || '#f97316'
    const subtotal = (invoice.labor_line1_amount || 0) + (invoice.labor_line2_amount || 0) +
        (invoice.materials_line1_amount || 0) + (invoice.materials_line2_amount || 0)
    const tax = (subtotal * (invoice.tax_rate || 0)) / 100
    const total = subtotal + tax

    return (
        <Document title={`Invoice ${invoice.invoice_number}`}>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <View style={styles.logoContainer}>
                            {settings?.logo_url ? (
                                <Image src={settings.logo_url} style={{ width: 40, height: 40, borderRadius: 8 }} />
                            ) : (
                                <View style={[styles.logoPlaceholder, { backgroundColor: brandColor }]} />
                            )}
                            <Text style={styles.companyName}>{settings?.company_name || 'Business'}</Text>
                        </View>
                        <View style={styles.companyDetails}>
                            <Text>{settings?.company_address}</Text>
                            <Text>{settings?.company_phone}</Text>
                            <Text>{settings?.company_email}</Text>
                        </View>
                    </View>
                    <View style={styles.invoiceInfo}>
                        <Text style={styles.invoiceLabel}>Invoice</Text>
                        <Text style={styles.invoiceNumber}>#{invoice.invoice_number}</Text>
                    </View>
                </View>

                {/* Billing */}
                <View style={styles.billingSection}>
                    <View style={styles.column}>
                        <Text style={styles.sectionLabel}>Bill To</Text>
                        <Text style={styles.clientName}>{invoice.clients?.name}</Text>
                        <Text style={styles.clientDetails}>{invoice.clients?.address}</Text>
                        <Text style={styles.clientDetails}>{invoice.clients?.email}</Text>
                    </View>
                    <View style={[styles.column, { alignItems: 'flex-end' }]}>
                        <View style={styles.dateItem}>
                            <Text style={styles.dateLabel}>Date Issued</Text>
                            <Text style={styles.dateValue}>{invoice.invoice_date}</Text>
                        </View>
                        <View style={styles.dateItem}>
                            <Text style={styles.dateLabel}>Due Date</Text>
                            <Text style={styles.dateValue}>{invoice.due_date}</Text>
                        </View>
                    </View>
                </View>

                {/* Table */}
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.tableHeaderText, styles.descriptionCol]}>Description</Text>
                        <Text style={[styles.tableHeaderText, styles.amountCol]}>Amount</Text>
                    </View>

                    {/* Labor */}
                    <View style={styles.categoryRow}>
                        <Text style={[styles.categoryLabel, { color: brandColor }]}>Labor & Services</Text>
                    </View>
                    {invoice.labor_line1_desc && (
                        <View style={styles.tableRow}>
                            <Text style={styles.descriptionCol}>{invoice.labor_line1_desc}</Text>
                            <Text style={styles.amountCol}>${(invoice.labor_line1_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
                        </View>
                    )}
                    {invoice.labor_line2_desc && (
                        <View style={styles.tableRow}>
                            <Text style={styles.descriptionCol}>{invoice.labor_line2_desc}</Text>
                            <Text style={styles.amountCol}>${(invoice.labor_line2_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
                        </View>
                    )}

                    {/* Materials */}
                    <View style={styles.categoryRow}>
                        <Text style={[styles.categoryLabel, { color: '#8b5cf6' }]}>Materials & Components</Text>
                    </View>
                    {invoice.materials_line1_desc && (
                        <View style={styles.tableRow}>
                            <Text style={styles.descriptionCol}>{invoice.materials_line1_desc}</Text>
                            <Text style={styles.amountCol}>${(invoice.materials_line1_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
                        </View>
                    )}
                    {invoice.materials_line2_desc && (
                        <View style={styles.tableRow}>
                            <Text style={styles.descriptionCol}>{invoice.materials_line2_desc}</Text>
                            <Text style={styles.amountCol}>${(invoice.materials_line2_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
                        </View>
                    )}
                </View>

                {/* Totals */}
                <View style={styles.totalsSection}>
                    <View style={styles.totalItem}>
                        <Text style={styles.totalLabel}>Subtotal</Text>
                        <Text style={styles.totalValue}>${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
                    </View>
                    <View style={styles.totalItem}>
                        <Text style={styles.totalLabel}>Tax ({invoice.tax_rate}%)</Text>
                        <Text style={styles.totalValue}>${tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
                    </View>
                    <View style={styles.grandTotalItem}>
                        <Text style={styles.grandTotalLabel}>Grand Total</Text>
                        <Text style={[styles.grandTotalValue, { color: brandColor }]}>${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
                    </View>
                </View>

                {/* Notes */}
                {invoice.notes && (
                    <View style={styles.notesSection}>
                        <Text style={styles.sectionLabel}>Notes & Terms</Text>
                        <View style={styles.notesBox}>
                            <Text style={styles.notesText}>{invoice.notes}</Text>
                        </View>
                    </View>
                )}
            </Page>
        </Document>
    )
}
