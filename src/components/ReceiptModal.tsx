import React from 'react';
import { Printer, CheckCircle2, X, Share2, Receipt, Download } from 'lucide-react';
import { BillingStatement, SystemSettings } from '../types';
import { exportInvoiceToPDF } from '../utils/pdfExport';

interface ReceiptModalProps {
  invoice: BillingStatement | null;
  settings?: SystemSettings;
  isOpen: boolean;
  onClose: () => void;
  lang: 'en' | 'hi';
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  invoice,
  settings,
  isOpen,
  onClose,
  lang,
}) => {
  if (!isOpen || !invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const restName = settings?.restaurant_name || 'RAM TARA RESTAURANT';
  const restAddress = settings?.address || 'Bareilly, UP, India';
  const restGst = settings?.gstein || '09AAAAA0000A1Z5';
  const footerMsg = settings?.invoice_footer || 'THANK YOU! PLEASE VISIT AGAIN';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Modal Top Bar (hidden during print) */}
        <div className="no-print flex items-center justify-between px-5 py-3.5 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-semibold">
              {lang === 'hi' ? 'बिल रसीद (Tax Invoice)' : 'Official Tax Receipt'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => exportInvoiceToPDF(invoice, settings)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition"
            >
              <Download className="w-4 h-4" />
              <span>{lang === 'hi' ? 'पीडीएफ डाउनलोड' : 'PDF'}</span>
            </button>
            <button
              id="print-receipt-btn"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition"
            >
              <Printer className="w-4 h-4" />
              <span>{lang === 'hi' ? 'प्रिंट' : 'Print Slip'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Thermal Receipt Body */}
        <div id="thermal-receipt" className="p-6 font-mono text-xs text-slate-800 bg-white">
          {/* Restaurant Header */}
          <div className="text-center pb-3 border-b border-dashed border-slate-400">
            <h2 className="text-base font-black tracking-wider text-slate-950 uppercase font-sans">
              {restName}
            </h2>
            <p className="text-[11px] font-semibold text-slate-600">PAI VICEROY MANAGEMENT SUITE V2</p>
            <p className="text-[10px] text-slate-500">{restAddress}</p>
            <p className="text-[10px] text-slate-500 font-semibold">GSTIN: {restGst}</p>
            <div className="mt-1 inline-block px-2 py-0.5 bg-slate-100 rounded text-[9px] font-bold uppercase text-slate-700">
              Tax Invoice / Cash Memo
            </div>
          </div>

          {/* Meta Details */}
          <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-500">Invoice No:</span>
              <span className="font-bold text-slate-900">{invoice.invoice_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Date & Time:</span>
              <span>{invoice.bill_date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Cashier:</span>
              <span className="capitalize">{invoice.cashier}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Order Type:</span>
              <span className="font-semibold">{invoice.order_type} {invoice.table_number ? `(${invoice.table_number})` : ''}</span>
            </div>
            {invoice.customer_name && (
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Customer:</span>
                <span className="flex items-center gap-1 font-semibold text-right">
                  <span>{invoice.customer_name} {invoice.mobile_number ? `(${invoice.mobile_number})` : ''}</span>
                  {invoice.is_permanent_customer && (
                    <span className="text-[9px] bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-bold border border-amber-300">
                      ⭐ VIP GUEST
                    </span>
                  )}
                </span>
              </div>
            )}
          </div>

          {/* Items Table */}
          <div className="py-3 border-b border-dashed border-slate-300">
            <div className="grid grid-cols-12 font-bold text-slate-900 pb-1.5 border-b border-slate-200 text-[10px] uppercase">
              <span className="col-span-6">Item</span>
              <span className="col-span-2 text-center">Qty</span>
              <span className="col-span-2 text-right">Price</span>
              <span className="col-span-2 text-right">Total</span>
            </div>
            <div className="space-y-1.5 pt-2">
              {invoice.items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 text-[11px] leading-tight">
                  <span className="col-span-6 font-medium text-slate-900">{item.item_name}</span>
                  <span className="col-span-2 text-center text-slate-600">x{item.quantity}</span>
                  <span className="col-span-2 text-right text-slate-600">{item.price.toFixed(2)}</span>
                  <span className="col-span-2 text-right font-semibold text-slate-900">{item.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="py-2.5 border-b border-dashed border-slate-400 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-600">Subtotal</span>
              <span>₹{invoice.subtotal.toFixed(2)}</span>
            </div>
            {invoice.discount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Order Discount (5% on ≥₹500)</span>
                <span>- ₹{invoice.discount.toFixed(2)}</span>
              </div>
            )}
            {invoice.permanent_customer_discount && invoice.permanent_customer_discount > 0 ? (
              <div className="flex justify-between text-amber-800 font-bold bg-amber-50 px-1 py-0.5 rounded">
                <span>⭐ Permanent Customer Disc (5% Extra)</span>
                <span>- ₹{invoice.permanent_customer_discount.toFixed(2)}</span>
              </div>
            ) : null}
            <div className="flex justify-between text-slate-600">
              <span>Service Charge (1%)</span>
              <span>₹{invoice.service_charge.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>GST (5% CGST+SGST)</span>
              <span>₹{invoice.goods_and_services_tax.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-sm font-black text-slate-950 pt-1.5 border-t border-slate-300">
              <span>GRAND TOTAL</span>
              <span>₹{invoice.grand_total.toFixed(2)}</span>
            </div>
          </div>

          {/* Tender & Change */}
          <div className="py-2.5 space-y-1 text-[11px] border-b border-dashed border-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-600">Payment Mode:</span>
              <span className="font-semibold uppercase">{invoice.payment_method}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Amount Paid:</span>
              <span>₹{invoice.amount_paid.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-slate-900">
              <span className="text-slate-600">Change Due:</span>
              <span className="text-emerald-700">₹{invoice.change_amount.toFixed(2)}</span>
            </div>
          </div>

          {/* Barcode & Thank You */}
          <div className="text-center pt-4 space-y-1">
            <div className="font-mono text-[9px] tracking-widest text-slate-400">
              ||||| | |||| |||| ||| ||||||| | |||||
            </div>
            <p className="text-[11px] font-bold text-slate-800 uppercase">{footerMsg}</p>
            <p className="text-[9px] text-slate-400">Powered by Pai Viceroy Suite V2 ERP</p>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="no-print p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs rounded-xl transition"
          >
            {lang === 'hi' ? 'बंद करें' : 'Close'}
          </button>
          <button
            onClick={() => exportInvoiceToPDF(invoice, settings)}
            className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow transition"
          >
            <Download className="w-4 h-4 text-emerald-200" />
            <span>{lang === 'hi' ? 'पीडीएफ डाउनलोड' : 'PDF'}</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2 bg-[#174a70] hover:bg-[#123956] text-white font-semibold text-xs rounded-xl shadow transition"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>{lang === 'hi' ? 'रसीद प्रिंट करें' : 'Print Slip'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
