import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Search,
  Printer,
  Eye,
  Calendar,
  CreditCard,
  Banknote,
  QrCode,
  Download,
} from 'lucide-react';
import { BillingStatement } from '../types';

interface InvoicesHistoryViewProps {
  invoices: BillingStatement[];
  onViewInvoice: (inv: BillingStatement) => void;
  lang: 'en' | 'hi';
}

export const InvoicesHistoryView: React.FC<InvoicesHistoryViewProps> = ({
  invoices,
  onViewInvoice,
  lang,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<string>('All');

  const filtered = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.mobile_number.includes(searchQuery);
    const matchesPayment = paymentFilter === 'All' || inv.payment_method === paymentFilter;
    return matchesSearch && matchesPayment;
  });

  const totalFilteredSales = filtered.reduce((sum, inv) => sum + inv.grand_total, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-[#174a70]" />
            <span>{lang === 'hi' ? 'बिलिंग व इनवॉइस इतिहास' : 'Invoices & Billing Audit Register'}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {lang === 'hi'
              ? 'सभी पूर्ववर्ती इनवॉइस, जीएसटी विवरण और भुगतान विधियों का विस्तृत लेखा-जोखा।'
              : 'Complete repository of past billing statements with itemized lines, GST audit, and reprint support.'}
          </p>
        </div>

        <div className="text-right">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">
            {lang === 'hi' ? 'चयनित इनवॉइस कुल:' : 'Filtered Volume:'}
          </span>
          <div className="text-xl font-black text-[#174a70] font-mono">
            ₹{totalFilteredSales.toFixed(2)} ({filtered.length} Bills)
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === 'hi' ? 'इनवॉइस नंबर, ग्राहक या मोबाइल नंबर खोजें...' : 'Search by invoice #, customer name or mobile...'}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#174a70] text-slate-900"
          />
        </div>

        {/* Payment mode filter */}
        <div className="flex items-center gap-1.5">
          {['All', 'Cash', 'UPI', 'Card'].map((mode) => (
            <button
              key={mode}
              onClick={() => setPaymentFilter(mode)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                paymentFilter === mode
                  ? 'bg-[#174a70] text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-900 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Invoice #</th>
                <th className="px-5 py-3.5">{lang === 'hi' ? 'दिनांक व समय' : 'Date & Time'}</th>
                <th className="px-5 py-3.5">{lang === 'hi' ? 'ग्राहक विवरण' : 'Customer Details'}</th>
                <th className="px-5 py-3.5">{lang === 'hi' ? 'ऑर्डर प्रकार' : 'Order Type'}</th>
                <th className="px-5 py-3.5">{lang === 'hi' ? 'सामग्रियां (Items)' : 'Item Breakdown'}</th>
                <th className="px-5 py-3.5">{lang === 'hi' ? 'भुगतान विधि' : 'Payment Mode'}</th>
                <th className="px-5 py-3.5 text-right">{lang === 'hi' ? 'कुल राशि' : 'Grand Total'}</th>
                <th className="px-5 py-3.5 text-right">{lang === 'hi' ? 'रसीद' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400">
                    <FileSpreadsheet className="w-8 h-8 mx-auto mb-1 text-slate-300" />
                    <p>{lang === 'hi' ? 'कोई इनवॉइस नहीं मिला।' : 'No invoices matching search filter.'}</p>
                  </td>
                </tr>
              ) : (
                filtered.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-3.5 font-mono font-bold text-[#174a70]">
                      {inv.invoice_number}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {inv.bill_date}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-slate-900">{inv.customer_name}</span>
                        {inv.is_permanent_customer && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            ⭐ Permanent (5% Extra)
                          </span>
                        )}
                      </div>
                      {inv.mobile_number && (
                        <div className="text-[10px] text-slate-500 font-mono">{inv.mobile_number}</div>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">
                        {inv.order_type} {inv.table_number ? `(${inv.table_number})` : ''}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 max-w-xs truncate">
                      {inv.items.map((i) => `${i.item_name} (x${i.quantity})`).join(', ')}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-semibold text-slate-800 uppercase text-[11px]">
                        {inv.payment_method}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono font-black text-slate-900 text-sm">
                      ₹{inv.grand_total.toFixed(2)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        id={`view-invoice-${inv.invoice_number}`}
                        onClick={() => onViewInvoice(inv)}
                        className="px-3 py-1.5 bg-[#174a70] hover:bg-[#123956] text-white rounded-lg text-xs font-bold transition inline-flex items-center gap-1.5 shadow-xs"
                      >
                        <Printer className="w-3.5 h-3.5 text-amber-400" />
                        <span>{lang === 'hi' ? 'रसीद देखें' : 'View Slip'}</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
