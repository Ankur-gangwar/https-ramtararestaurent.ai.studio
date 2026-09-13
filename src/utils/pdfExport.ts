import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BillingStatement, SystemSettings } from '../types';

export const exportInvoiceToPDF = (invoice: BillingStatement, settings?: SystemSettings) => {
  const doc = new jsPDF();
  
  const restName = settings?.restaurant_name || 'RAM TARA RESTAURANT';
  const restAddress = settings?.address || 'Bareilly, UP, India';
  const restGst = settings?.gstein || '09AAAAA0000A1Z5';
  
  // Header
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text(restName, 105, 20, { align: "center" });
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(restAddress, 105, 28, { align: "center" });
  doc.text(`GSTIN: ${restGst}`, 105, 34, { align: "center" });
  
  doc.setLineWidth(0.5);
  doc.line(14, 40, 196, 40);
  
  // Invoice Details
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(`TAX INVOICE`, 105, 48, { align: "center" });
  
  doc.setFont("helvetica", "normal");
  doc.text(`Bill No: ${invoice.invoice_number}`, 14, 58);
  doc.text(`Date: ${invoice.bill_date}`, 120, 58);
  
  doc.text(`Customer: ${invoice.customer_name}`, 14, 66);
  if (invoice.mobile_number) {
    doc.text(`Mobile: ${invoice.mobile_number}`, 120, 66);
  }
  
  doc.text(`Order Type: ${invoice.order_type}`, 14, 74);
  if (invoice.table_number) {
    doc.text(`Table: ${invoice.table_number}`, 120, 74);
  }
  
  // Table
  const tableData = invoice.items.map((item, index) => [
    index + 1,
    item.item_name,
    item.quantity,
    `Rs ${item.price.toFixed(2)}`,
    `Rs ${(item.price * item.quantity).toFixed(2)}`
  ]);
  
  autoTable(doc, {
    startY: 85,
    head: [['#', 'Item', 'Qty', 'Rate', 'Amount']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [23, 74, 112] },
  });
  
  const finalY = (doc as any).lastAutoTable.finalY || 150;
  
  // Totals
  doc.setFontSize(10);
  doc.text(`Subtotal:`, 130, finalY + 10);
  doc.text(`Rs ${invoice.subtotal.toFixed(2)}`, 170, finalY + 10, { align: 'right' });
  
  doc.text(`CGST (2.5%):`, 130, finalY + 18);
  doc.text(`Rs ${(invoice.goods_and_services_tax / 2).toFixed(2)}`, 170, finalY + 18, { align: 'right' });
  
  doc.text(`SGST (2.5%):`, 130, finalY + 26);
  doc.text(`Rs ${(invoice.goods_and_services_tax / 2).toFixed(2)}`, 170, finalY + 26, { align: 'right' });
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`Grand Total:`, 130, finalY + 36);
  doc.text(`Rs ${invoice.grand_total.toFixed(2)}`, 170, finalY + 36, { align: 'right' });
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Payment Mode: ${invoice.payment_method}`, 14, finalY + 36);
  
  // Footer
  doc.setFontSize(10);
  doc.setFont("helvetica", "italic");
  doc.text(settings?.invoice_footer || 'THANK YOU! PLEASE VISIT AGAIN', 105, finalY + 55, { align: "center" });
  
  doc.save(`${invoice.invoice_number}.pdf`);
};
