import React, { useState } from 'react';
import {
  Settings,
  Store,
  FileText,
  Percent,
  Hash,
  Save,
  RotateCcw,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { SystemSettings } from '../types';

interface SettingsViewProps {
  settings: SystemSettings;
  onSaveSettings: (newSettings: SystemSettings) => void;
  onResetData: () => void;
  lang: 'en' | 'hi';
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
  onResetData,
  lang,
}) => {
  const [formData, setFormData] = useState<SystemSettings>({ ...settings });
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const todayStr = new Date().toISOString().substring(0, 10).replace(/-/g, '');
  const sampleOrderNumber =
    formData.sequence_format === 'DAILY_RESET'
      ? `${formData.prefix}-${todayStr}-0001`
      : `${formData.prefix}-000001`;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <Settings className="w-6 h-6 text-[#174a70]" />
            <span>{lang === 'hi' ? 'सिस्टम सेटिंग्स व इनवॉइस कॉन्फ़िगरेशन' : 'ERP System Settings & Invoice Config'}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {lang === 'hi'
              ? 'रेस्तरां विवरण, जीएसटी नंबर, टैक्स दरें और ऑटो ऑर्डर अनुक्रम प्रारूप।'
              : 'Configure restaurant brand details, GSTIN, tax percentages, and automated order sequence numbers.'}
          </p>
        </div>

        {saveSuccess && (
          <div className="px-3.5 py-1.5 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{lang === 'hi' ? 'सफलतापूर्वक सहेजा गया!' : 'Settings Saved!'}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Restaurant Identity Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Store className="w-5 h-5 text-[#174a70]" />
            <h3 className="text-sm font-bold text-slate-900">
              {lang === 'hi' ? 'रेस्तरां पहचान एवं संपर्क' : 'Restaurant Identity & Registration'}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'hi' ? 'रेस्तरां का नाम' : 'Restaurant Name'}
              </label>
              <input
                type="text"
                value={formData.restaurant_name}
                onChange={(e) => setFormData({ ...formData, restaurant_name: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#174a70] font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'hi' ? 'जीएसटी पहचान संख्या (GSTIN)' : 'GST Identification Number (GSTIN)'}
              </label>
              <input
                type="text"
                value={formData.gstein}
                onChange={(e) => setFormData({ ...formData, gstein: e.target.value })}
                placeholder="09AAAAA0000A1Z5"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#174a70] font-mono font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'hi' ? 'संपर्क फोन / मोबाइल' : 'Official Phone / Helpline'}
              </label>
              <input
                type="tel"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#174a70] font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'hi' ? 'मुद्रा प्रतीक' : 'Currency'}
              </label>
              <input
                type="text"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#174a70] font-bold"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'hi' ? 'पता (इनवॉइस हेडर)' : 'Address (Printed on receipts)'}
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#174a70]"
                required
              />
            </div>
          </div>
        </div>

        {/* Taxes & Charges Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Percent className="w-5 h-5 text-[#174a70]" />
            <h3 className="text-sm font-bold text-slate-900">
              {lang === 'hi' ? 'टैक्स एवं सेवा शुल्क दरें' : 'Taxes, Service Charges & Invoice Messages'}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'hi' ? 'डिफ़ॉल्ट जीएसटी दर (%)' : 'Default GST Rate (%)'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  value={Math.round(formData.default_gst * 100)}
                  onChange={(e) =>
                    setFormData({ ...formData, default_gst: parseFloat(e.target.value) / 100 || 0 })
                  }
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#174a70] font-mono font-bold"
                  required
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">
                  %
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Standard F&B GST is 5% (2.5% CGST + 2.5% SGST)
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'hi' ? 'सेवा शुल्क दर (%)' : 'Service Charge Rate (%)'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  value={Math.round(formData.default_service_charge * 100)}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      default_service_charge: parseFloat(e.target.value) / 100 || 0,
                    })
                  }
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#174a70] font-mono font-bold"
                  required
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">
                  %
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Default is 1% operational facility charge</p>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'hi' ? 'रसीद पादलेख (Invoice Footer Message)' : 'Receipt Footer Message'}
              </label>
              <input
                type="text"
                value={formData.invoice_footer}
                onChange={(e) => setFormData({ ...formData, invoice_footer: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#174a70] font-semibold"
                required
              />
            </div>
          </div>
        </div>

        {/* Invoice Numbering Sequence */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Hash className="w-5 h-5 text-[#174a70]" />
            <h3 className="text-sm font-bold text-slate-900">
              {lang === 'hi' ? 'स्वचालित बिलिंग अनुक्रम (Sequence Tracker)' : 'Automated Sequence Tracker & Prefix'}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'hi' ? 'इनवॉइस उपसर्ग (Invoice Prefix)' : 'Invoice Number Prefix'}
              </label>
              <input
                type="text"
                value={formData.prefix}
                onChange={(e) => setFormData({ ...formData, prefix: e.target.value.toUpperCase() })}
                placeholder="ORD"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#174a70] font-mono font-black"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'hi' ? 'रीसेट प्रारूप (Sequence Format)' : 'Sequence Reset Format'}
              </label>
              <select
                value={formData.sequence_format}
                onChange={(e) =>
                  setFormData({ ...formData, sequence_format: e.target.value as any })
                }
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#174a70] font-bold"
              >
                <option value="DAILY_RESET">DAILY_RESET (ORD-YYYYMMDD-0001)</option>
                <option value="GLOBAL">GLOBAL (ORD-000001 continuous)</option>
              </select>
            </div>

            <div className="sm:col-span-2 p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                  Live Preview Format:
                </span>
                <div className="text-base font-black text-[#174a70] font-mono mt-0.5">
                  {sampleOrderNumber}
                </div>
              </div>
              <span className="text-xs text-slate-500 font-medium">Thread-safe, daily auto-incremented</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={onResetData}
            className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{lang === 'hi' ? 'फ़ैक्टरी डिफ़ॉल्ट रीसेट' : 'Factory Reset Data'}</span>
          </button>

          <button
            type="submit"
            className="px-6 py-2.5 bg-[#174a70] hover:bg-[#123956] text-white rounded-xl text-xs font-bold shadow flex items-center gap-2 transition"
          >
            <Save className="w-4 h-4 text-amber-400" />
            <span>{lang === 'hi' ? 'सेटिंग्स सहेजें' : 'Save System Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
