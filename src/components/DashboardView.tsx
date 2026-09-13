import React from 'react';
import {
  TrendingUp,
  Banknote,
  ShoppingCart,
  Boxes,
  AlertTriangle,
  Receipt,
  Eye,
  CheckCircle2,
  Calendar,
  CreditCard,
  QrCode,
  Flame,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { BillingStatement, Ingredient, WastageLog, MenuItem } from '../types';
import posStaffTeamBg from '../assets/images/pos_staff_team_bg_1788891670528.jpg';

interface DashboardViewProps {
  invoices: BillingStatement[];
  ingredients: Ingredient[];
  wastageLogs: WastageLog[];
  menuItems: MenuItem[];
  onViewInvoice: (inv: BillingStatement) => void;
  onNavigateTab: (tab: string) => void;
  lang: 'en' | 'hi';
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  invoices,
  ingredients,
  wastageLogs,
  menuItems,
  onViewInvoice,
  onNavigateTab,
  lang,
}) => {
  // Aggregate Metrics
  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.grand_total, 0);
  const totalOrders = invoices.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const lowStockItems = ingredients.filter((i) => i.current_stock <= i.min_stock_alert);
  const depletedItems = ingredients.filter((i) => i.current_stock <= 0);

  // Payment Breakdown
  const paymentBreakdown = invoices.reduce(
    (acc, inv) => {
      const mode = inv.payment_method;
      acc[mode] = (acc[mode] || 0) + inv.grand_total;
      return acc;
    },
    { Cash: 0, UPI: 0, Card: 0 } as Record<string, number>
  );

  // Top Selling Dishes
  const dishSales: Record<string, { qty: number; revenue: number }> = {};
  for (const inv of invoices) {
    for (const item of inv.items) {
      if (!dishSales[item.item_name]) {
        dishSales[item.item_name] = { qty: 0, revenue: 0 };
      }
      dishSales[item.item_name].qty += item.quantity;
      dishSales[item.item_name].revenue += item.amount;
    }
  }

  const topDishes = Object.entries(dishSales)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome Banner matching Tkinter style (#174a70) with AI Staff Team Background */}
      <div className="rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden bg-slate-900 border border-slate-800">
        {/* Background Image with Dark & Amber Vignette Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={posStaffTeamBg}
            alt="High-Energy Restaurant Staff Team"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center filter brightness-[0.38] contrast-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-[#174a70]/85 to-slate-900/60" />
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold mb-3 border border-amber-400/30">
            <ShieldCheck className="w-4 h-4" />
            <span>{lang === 'hi' ? 'प्रबंधक डैशबोर्ड व संचालन' : 'Executive ERP Overview'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            RAM TARA RESTAURANT • DASHBOARD
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 mt-2 font-medium leading-relaxed">
            {lang === 'hi'
              ? 'दैनिक बिक्री, रेसिपी बीओएम इन्वेंटरी कटौती, बिलिंग काउंटर एवं अपव्यय का केंद्रीकृत प्रबंधन।'
              : 'Real-time monitoring of POS billing, Recipe BOM ingredient deductions, low stock alerts, and wastage control.'}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateTab('pos')}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow transition flex items-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>{lang === 'hi' ? 'बिलिंग काउंटर खोलें' : 'Open POS Billing'}</span>
            </button>
            <button
              onClick={() => onNavigateTab('inventory')}
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition flex items-center gap-2"
            >
              <Boxes className="w-4 h-4 text-amber-400" />
              <span>{lang === 'hi' ? 'इन्वेंटरी देखें' : 'View Stock Table'}</span>
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Critical Stock Alert Banner if any ingredients are low */}
      {lowStockItems.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-200/80 flex items-center justify-center text-amber-800 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold">
                {lang === 'hi'
                  ? `⚠️ ध्यान दें! ${lowStockItems.length} सामग्री न्यूनतम स्टॉक सीमा से नीचे हैं:`
                  : `⚠️ Attention! ${lowStockItems.length} raw ingredients have hit the minimum alert threshold:`}
              </div>
              <div className="text-[11px] text-amber-800 font-medium mt-0.5">
                {lowStockItems.map((i) => `${i.name} (${i.current_stock.toFixed(2)} ${i.unit})`).join(', ')}
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('inventory')}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition shrink-0"
          >
            {lang === 'hi' ? 'तुरंत रीस्टॉक करें' : 'Restock Now'}
          </button>
        </div>
      )}

      {/* Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {lang === 'hi' ? 'कुल संचित बिक्री' : "Total Revenue"}
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Banknote className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 font-mono">
              ₹{totalRevenue.toFixed(2)}
            </div>
            <div className="text-[11px] text-emerald-800 font-semibold mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{lang === 'hi' ? 'सक्रिय बिलिंग सत्र' : 'Live POS tracking'}</span>
            </div>
          </div>
        </div>

        {/* Total Invoices */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {lang === 'hi' ? 'कुल ऑर्डर्स / इनवॉइस' : 'Total Invoices'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 font-mono">
              {totalOrders} Bills
            </div>
            <div className="text-[11px] text-slate-500 font-medium mt-1">
              {lang === 'hi' ? 'औसत टिकट:' : 'Avg Ticket:'} ₹{avgOrderValue.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {lang === 'hi' ? 'कम स्टॉक अलर्ट' : 'Stock Alerts'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-amber-600 font-mono">
              {lowStockItems.length} Items
            </div>
            <div className="text-[11px] text-slate-500 font-medium mt-1">
              {depletedItems.length > 0 ? `${depletedItems.length} completely zero` : 'All items active'}
            </div>
          </div>
        </div>

        {/* Menu Catalog Depth */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {lang === 'hi' ? 'मेन्यू डिश संख्या' : 'Menu Catalog'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Boxes className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 font-mono">
              {menuItems.length} Dishes
            </div>
            <div className="text-[11px] text-slate-500 font-medium mt-1">
              {ingredients.length} raw ingredients in stock
            </div>
          </div>
        </div>
      </div>

      {/* Middle Section: Payment Methods & Top Selling Dishes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Payment Methods Split (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              {lang === 'hi' ? 'भुगतान विधि विभाजन' : 'Revenue by Payment Mode'}
            </h3>
            <span className="text-xs text-slate-400 font-mono">100% Audited</span>
          </div>

          <div className="space-y-3 pt-1">
            {[
              { label: 'Cash Tender', amount: paymentBreakdown.Cash || 0, icon: Banknote, color: 'bg-emerald-500' },
              { label: 'UPI / QR Code', amount: paymentBreakdown.UPI || 0, icon: QrCode, color: 'bg-blue-500' },
              { label: 'Card Payment', amount: paymentBreakdown.Card || 0, icon: CreditCard, color: 'bg-purple-500' },
            ].map((p) => {
              const pct = totalRevenue > 0 ? (p.amount / totalRevenue) * 100 : 0;
              const Icon = p.icon;
              return (
                <div key={p.label} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <Icon className="w-4 h-4 text-slate-500" />
                      {p.label}
                    </span>
                    <span className="font-mono font-bold text-slate-900">
                      ₹{p.amount.toFixed(2)} ({pct.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${p.color} transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Selling Dishes Leaderboard (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-500" />
              <span>{lang === 'hi' ? 'सर्वाधिक बिकने वाली डिशेस' : 'Top Selling Dishes'}</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">By Quantity</span>
          </div>

          <div className="divide-y divide-slate-100">
            {topDishes.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                {lang === 'hi' ? 'अभी कोई बिक्री दर्ज नहीं हुई है।' : 'No dish sales recorded yet.'}
              </p>
            ) : (
              topDishes.map((dish, idx) => (
                <div key={dish.name} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-xs font-black flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{dish.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{dish.qty} orders sold</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-black text-[#174a70] font-mono">
                      ₹{dish.revenue.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Invoices Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            {lang === 'hi' ? 'हालिया जारी किए गए इनवॉइस' : 'Recently Issued Invoices'}
          </span>
          <button
            onClick={() => onNavigateTab('invoices')}
            className="text-xs font-bold text-[#174a70] hover:text-amber-600 flex items-center gap-1 transition"
          >
            <span>{lang === 'hi' ? 'सभी देखें' : 'View All Records'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50/50 border-b border-slate-200 font-bold text-slate-900 uppercase text-[10px]">
              <tr>
                <th className="px-5 py-3">Invoice #</th>
                <th className="px-5 py-3">{lang === 'hi' ? 'दिनांक' : 'Date & Time'}</th>
                <th className="px-5 py-3">{lang === 'hi' ? 'ग्राहक' : 'Customer'}</th>
                <th className="px-5 py-3">{lang === 'hi' ? 'प्रकार' : 'Type'}</th>
                <th className="px-5 py-3">{lang === 'hi' ? 'भुगतान' : 'Mode'}</th>
                <th className="px-5 py-3 text-right">{lang === 'hi' ? 'कुल राशि' : 'Total (₹)'}</th>
                <th className="px-5 py-3 text-right">{lang === 'hi' ? 'रसीद' : 'Receipt'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {invoices.slice(0, 5).map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50 transition">
                  <td className="px-5 py-3 font-mono font-bold text-[#174a70]">
                    {inv.invoice_number}
                  </td>
                  <td className="px-5 py-3 text-slate-500 font-mono text-[11px]">{inv.bill_date}</td>
                  <td className="px-5 py-3 font-semibold text-slate-900">
                    {inv.customer_name}
                  </td>
                  <td className="px-5 py-3 text-slate-600">{inv.order_type}</td>
                  <td className="px-5 py-3 font-semibold text-slate-800">{inv.payment_method}</td>
                  <td className="px-5 py-3 text-right font-mono font-black text-slate-900">
                    ₹{inv.grand_total.toFixed(2)}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => onViewInvoice(inv)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-[#174a70] hover:text-white rounded-lg text-xs font-bold text-slate-700 transition inline-flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      <span>{lang === 'hi' ? 'देखें' : 'View'}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
