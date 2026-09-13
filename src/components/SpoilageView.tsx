import React, { useState } from 'react';
import {
  AlertTriangle,
  Trash2,
  Calendar,
  User,
  Plus,
  FileText,
  Clock,
  ArrowDownCircle,
  TrendingDown,
  X,
} from 'lucide-react';
import { WastageLog, Ingredient, User as UserType } from '../types';

interface SpoilageViewProps {
  wastageLogs: WastageLog[];
  ingredients: Ingredient[];
  currentUser: UserType;
  onLogWastage: (
    ingredientName: string,
    quantity: number,
    unit: string,
    reason: WastageLog['reason'],
    notes?: string
  ) => void;
  lang: 'en' | 'hi';
}

export const SpoilageView: React.FC<SpoilageViewProps> = ({
  wastageLogs,
  ingredients,
  currentUser,
  onLogWastage,
  lang,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIngredientName, setSelectedIngredientName] = useState(
    ingredients[0]?.name || ''
  );
  const [qty, setQty] = useState('');
  const [reason, setReason] = useState<WastageLog['reason']>('Spoiled');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const selectedIng = ingredients.find((i) => i.name === selectedIngredientName);
  const unit = selectedIng ? selectedIng.unit : 'kg';

  // Metrics
  const totalIncidents = wastageLogs.length;
  const totalWeightLost = wastageLogs.reduce((sum, w) => sum + w.quantity_wasted, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const parsedQty = parseFloat(qty);
    if (isNaN(parsedQty) || parsedQty <= 0) {
      setErrorMsg(lang === 'hi' ? 'कृपया एक मान्य मात्रा दर्ज करें।' : 'Please enter a valid positive quantity.');
      return;
    }

    if (selectedIng && selectedIng.current_stock < parsedQty) {
      setErrorMsg(
        lang === 'hi'
          ? `❌ दर्ज की गई अपव्यय मात्रा (${parsedQty} ${unit}) वर्तमान उपलब्ध स्टॉक (${selectedIng.current_stock} ${unit}) से अधिक है!`
          : `❌ Wasted quantity (${parsedQty} ${unit}) exceeds current available stock (${selectedIng.current_stock} ${unit})!`
      );
      return;
    }

    onLogWastage(selectedIngredientName, parsedQty, unit, reason, notes);
    setIsModalOpen(false);
    setQty('');
    setNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-rose-600" />
            <span>{lang === 'hi' ? 'सामग्री अपव्यय व खराबी ट्रैकर' : 'Waste & Out Ingredient Tracking'}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {lang === 'hi'
              ? 'रसोई में खराब, समाप्त या गिराए गए कच्चे माल को दर्ज करें। इन्वेंटरी से स्वतः कटौती होगी।'
              : 'Log kitchen waste, expired goods, or cooking errors with instant inventory deduction.'}
          </p>
        </div>

        <button
          id="open-log-wastage-btn"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow transition"
        >
          <Plus className="w-4 h-4" />
          <span>{lang === 'hi' ? '+ अपव्यय दर्ज करें' : '+ Record Wastage'}</span>
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-semibold uppercase">
              {lang === 'hi' ? 'कुल अपव्यय घटनाएं' : 'Total Waste Logs'}
            </div>
            <div className="text-xl font-black text-slate-900">{totalIncidents} logs</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <ArrowDownCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-semibold uppercase">
              {lang === 'hi' ? 'कुल संचित बर्बादी' : 'Cumulative Waste Weight'}
            </div>
            <div className="text-xl font-black text-slate-900 font-mono">
              {totalWeightLost.toFixed(2)} units
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <User className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-semibold uppercase">
              {lang === 'hi' ? 'लॉग करने वाला स्टाफ' : 'Active Auditor'}
            </div>
            <div className="text-xl font-black text-slate-900 capitalize font-mono">
              {currentUser.username} ({currentUser.role})
            </div>
          </div>
        </div>
      </div>

      {/* Wastage Logs Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            {lang === 'hi' ? 'हालिया अपव्यय इतिहास' : 'Recent Wastage Audit Records'}
          </span>
          <span className="text-xs text-slate-500 font-mono">{wastageLogs.length} entries</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50/50 border-b border-slate-200 font-bold text-slate-900 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-5 py-3">Log ID</th>
                <th className="px-5 py-3">{lang === 'hi' ? 'सामग्री' : 'Ingredient'}</th>
                <th className="px-5 py-3">{lang === 'hi' ? 'बर्बाद मात्रा' : 'Quantity Wasted'}</th>
                <th className="px-5 py-3">{lang === 'hi' ? 'कारण' : 'Reason'}</th>
                <th className="px-5 py-3">{lang === 'hi' ? 'दिनांक व समय' : 'Date & Time'}</th>
                <th className="px-5 py-3">{lang === 'hi' ? 'दर्जकर्ता' : 'Logged By'}</th>
                <th className="px-5 py-3">{lang === 'hi' ? 'टिप्पणी' : 'Notes'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {wastageLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    <Trash2 className="w-8 h-8 mx-auto mb-1 text-slate-300" />
                    <p>{lang === 'hi' ? 'कोई अपव्यय लॉग उपलब्ध नहीं है।' : 'No wastage records logged yet.'}</p>
                  </td>
                </tr>
              ) : (
                wastageLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition">
                    <td className="px-5 py-3 font-mono text-slate-400">#{log.id}</td>
                    <td className="px-5 py-3 font-bold text-slate-900">{log.ingredient_name}</td>
                    <td className="px-5 py-3 font-mono font-bold text-rose-600">
                      -{log.quantity_wasted.toFixed(2)} {log.unit}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        log.reason === 'Spoiled'
                          ? 'bg-rose-100 text-rose-800'
                          : log.reason === 'Expired'
                          ? 'bg-amber-100 text-amber-900'
                          : log.reason === 'Spilled'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-800'
                      }`}>
                        {log.reason}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-500 font-mono text-[11px]">
                      {log.log_date}
                    </td>
                    <td className="px-5 py-3 capitalize text-slate-700 font-semibold">
                      {log.logged_by}
                    </td>
                    <td className="px-5 py-3 text-slate-500 italic max-w-xs truncate">
                      {log.notes || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Wastage Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-rose-700 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-300" />
                <h3 className="text-base font-bold">
                  {lang === 'hi' ? 'सामग्री अपव्यय (Wastage) दर्ज करें' : 'Record Waste/Out Ingredient'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-white/80 hover:text-white rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'hi' ? 'कच्चा माल चुनें' : 'Select Raw Material'}
                </label>
                <select
                  value={selectedIngredientName}
                  onChange={(e) => setSelectedIngredientName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-600 font-semibold text-slate-900"
                >
                  {ingredients.map((ing) => (
                    <option key={ing.item_id} value={ing.name}>
                      {ing.name} (Stock: {ing.current_stock.toFixed(2)} {ing.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === 'hi' ? `बर्बाद मात्रा (${unit})` : `Wasted Quantity (${unit})`}
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                    placeholder="0.5"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-600 font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === 'hi' ? 'कारण' : 'Reason'}
                  </label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-600"
                  >
                    <option value="Spoiled">Spoiled / Rotten</option>
                    <option value="Expired">Expired</option>
                    <option value="Spilled">Spilled / Dropped</option>
                    <option value="Cooking Error">Cooking Error / Burned</option>
                    <option value="Prep Trim">Excess Prep Trim</option>
                    <option value="Other">Other Reason</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'hi' ? 'कारण का विवरण / टिप्पणी' : 'Audit Notes / Incident Details'}
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Milk turned sour; burned during lunch rush..."
                  rows={2}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-600"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  {lang === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow"
                >
                  {lang === 'hi' ? 'दर्ज करें और स्टॉक घटाएं' : 'Confirm & Deduct Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
