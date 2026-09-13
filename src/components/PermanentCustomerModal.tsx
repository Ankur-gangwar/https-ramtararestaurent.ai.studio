import React, { useState } from 'react';
import {
  X,
  Star,
  Search,
  UserPlus,
  Phone,
  Mail,
  Calendar,
  ShoppingBag,
  Award,
  Check,
} from 'lucide-react';
import { PermanentCustomer } from '../types';

interface PermanentCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: PermanentCustomer[];
  onSaveCustomer: (customer: PermanentCustomer) => void;
  onSelectCustomer?: (customer: PermanentCustomer) => void;
  lang: 'en' | 'hi';
  initialMobile?: string;
  initialName?: string;
}

export const PermanentCustomerModal: React.FC<PermanentCustomerModalProps> = ({
  isOpen,
  onClose,
  customers,
  onSaveCustomer,
  onSelectCustomer,
  lang,
  initialMobile = '',
  initialName = '',
}) => {
  const [activeTab, setActiveTab] = useState<'browse' | 'add'>(initialMobile || initialName ? 'add' : 'browse');
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [name, setName] = useState(initialName);
  const [mobile, setMobile] = useState(initialMobile);
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('Frequent dining guest, prefers window table');
  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredCustomers = customers.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.mobile.includes(q) ||
      (c.email && c.email.toLowerCase().includes(q))
    );
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedName = name.trim();
    const trimmedMobile = mobile.trim();

    if (!trimmedName || !trimmedMobile) {
      setFormError(
        lang === 'hi'
          ? 'कृपया ग्राहक का नाम और मोबाइल नंबर दर्ज करें।'
          : 'Please provide both customer name and mobile number.'
      );
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const newCustomer: PermanentCustomer = {
      customer_id: Date.now(),
      name: trimmedName,
      mobile: trimmedMobile,
      email: email.trim() || undefined,
      address: address.trim() || undefined,
      discount_rate: 0.05,
      discount_percentage: 5, // 5% Extra permanent discount
      joined_date: todayStr,
      total_orders_count: 0,
      total_spend: 0,
      total_spent: 0,
      notes: notes.trim() || undefined,
    };

    onSaveCustomer(newCustomer);
    if (onSelectCustomer) {
      onSelectCustomer(newCustomer);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 bg-gradient-to-r from-[#174a70] to-[#123956] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow">
              <Star className="w-4 h-4 fill-slate-950" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base flex items-center gap-1.5">
                <span>{lang === 'hi' ? 'स्थायी ग्राहक डायरेक्टरी' : 'Permanent Customer Directory'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-extrabold border border-amber-400/30">
                  +5% Extra Discount
                </span>
              </h3>
              <p className="text-[11px] text-slate-300">
                {lang === 'hi'
                  ? 'स्थायी (VIP) ग्राहकों को प्रत्येक बिल पर 5% की अतिरिक्त छूट प्रदान की जाती है।'
                  : 'Permanent patrons receive an exclusive 5% extra discount automatically calculated on every bill.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2">
          <button
            onClick={() => setActiveTab('browse')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'browse'
                ? 'border-[#174a70] text-[#174a70]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>{lang === 'hi' ? 'ग्राहक सूची' : 'Browse Permanent Patrons'} ({customers.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'add'
                ? 'border-[#174a70] text-[#174a70]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{lang === 'hi' ? '+ नया स्थायी ग्राहक जोड़ें' : '+ Register New Permanent Customer'}</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 overflow-y-auto flex-1">
          {activeTab === 'browse' ? (
            <div className="space-y-3">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    lang === 'hi'
                      ? 'नाम, मोबाइल या ईमेल से खोजें...'
                      : 'Search by patron name, phone number, or email...'
                  }
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#174a70] text-slate-900"
                />
              </div>

              {/* Customer Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {filteredCustomers.length === 0 ? (
                  <div className="col-span-2 text-center py-8 text-slate-400 text-xs">
                    <Star className="w-8 h-8 mx-auto text-amber-300 stroke-[1.5] mb-1" />
                    <p>{lang === 'hi' ? 'कोई स्थायी ग्राहक नहीं मिला।' : 'No permanent customers found.'}</p>
                    <button
                      onClick={() => setActiveTab('add')}
                      className="mt-2 inline-flex items-center gap-1 text-xs text-[#174a70] font-bold hover:underline"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>{lang === 'hi' ? 'नया स्थायी ग्राहक जोड़ें' : 'Add new permanent customer'}</span>
                    </button>
                  </div>
                ) : (
                  filteredCustomers.map((cust) => (
                    <div
                      key={cust.customer_id}
                      className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs hover:border-amber-400 hover:shadow-md transition relative flex flex-col justify-between group"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div className="font-bold text-slate-900 text-xs flex items-center gap-1">
                            <span>{cust.name}</span>
                            <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                              ⭐ 5% Extra
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400 font-semibold">
                            {cust.customer_id}
                          </span>
                        </div>

                        <div className="mt-1.5 space-y-1 text-[11px] text-slate-600">
                          <div className="flex items-center gap-1.5 font-mono">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{cust.mobile}</span>
                          </div>
                          {cust.email && (
                            <div className="flex items-center gap-1.5">
                              <Mail className="w-3 h-3 text-slate-400" />
                              <span className="truncate">{cust.email}</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100 mt-2">
                            <span className="flex items-center gap-1">
                              <ShoppingBag className="w-3 h-3 text-slate-400" />
                              {cust.total_orders_count} orders
                            </span>
                            <span className="font-bold text-emerald-700">
                              ₹{(cust.total_spent ?? cust.total_spend ?? 0).toLocaleString()} spent
                            </span>
                          </div>
                        </div>
                      </div>

                      {onSelectCustomer && (
                        <button
                          onClick={() => {
                            onSelectCustomer(cust);
                            onClose();
                          }}
                          className="mt-3 w-full py-1.5 px-2 bg-amber-50 hover:bg-amber-500 hover:text-slate-950 text-amber-900 border border-amber-300 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{lang === 'hi' ? 'बिलिंग में चुनें (5% छूट लागू)' : 'Select for Bill (+5% Disc)'}</span>
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handleAddSubmit} className="space-y-3.5">
              {formError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
                  {formError}
                </div>
              )}

              <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                <Star className="w-4 h-4 fill-amber-500 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Rule 17 Privilege:</span> Registered Permanent Customers receive an automatic{' '}
                  <strong className="text-amber-950 font-black">5% extra discount</strong> on their bill (stackable on standard subtotal discount).
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === 'hi' ? 'ग्राहक का नाम *' : 'Customer Full Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Vikramaditya Rao"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#174a70]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === 'hi' ? 'मोबाइल नंबर *' : 'Mobile Number *'}
                  </label>
                  <input
                    type="tel"
                    required
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#174a70] font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === 'hi' ? 'ईमेल (वैकल्पिक)' : 'Email (Optional)'}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="guest@example.com"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#174a70]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === 'hi' ? 'छूट दर' : 'Discount Rate'}
                  </label>
                  <input
                    type="text"
                    disabled
                    value="5% Permanent Customer Extra Discount"
                    className="w-full px-3 py-2 text-xs bg-amber-50 border border-amber-300 rounded-xl text-amber-900 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'hi' ? 'पता / इलाका (वैकल्पिक)' : 'Address / Residence (Optional)'}
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Civil Lines, Bareilly"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#174a70]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'hi' ? 'विशेष टिप्पणियां / प्राथमिकताएं' : 'VIP Preferences / Notes'}
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. VIP guest, likes less spicy curry"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#174a70]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('browse')}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  {lang === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-[#174a70] hover:bg-[#123956] text-white rounded-xl shadow flex items-center gap-1.5"
                >
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{lang === 'hi' ? 'स्थायी ग्राहक सहेजें' : 'Save Permanent Customer'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
