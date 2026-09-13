import React, { useState } from 'react';
import {
  Boxes,
  Plus,
  Search,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  RotateCw,
  PackageCheck,
  Edit2,
  Trash2,
  X,
  ArrowDownRight,
} from 'lucide-react';
import { Ingredient, FlashAlert } from '../types';

interface InventoryViewProps {
  ingredients: Ingredient[];
  onAddIngredient: (ing: Omit<Ingredient, 'item_id'>) => void;
  onUpdateStock: (itemId: number, addedQty: number, notes?: string) => void;
  onDeleteIngredient: (itemId: number) => void;
  onEditThreshold: (itemId: number, newMinAlert: number) => void;
  lang: 'en' | 'hi';
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  ingredients,
  onAddIngredient,
  onUpdateStock,
  onDeleteIngredient,
  onEditThreshold,
  lang,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'low' | 'safe'>('all');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [restockQty, setRestockQty] = useState('');
  const [restockNote, setRestockNote] = useState('');

  // Add form fields (matching Flask /add_ingredient route)
  const [newName, setNewName] = useState('');
  const [newStock, setNewStock] = useState('');
  const [newUnit, setNewUnit] = useState('kg');
  const [newAlert, setNewAlert] = useState('');
  const [addError, setAddError] = useState<string | null>(null);

  const filtered = ingredients.filter((ing) => {
    const matchesSearch = ing.name.toLowerCase().includes(searchQuery.toLowerCase());
    const isLow = ing.current_stock <= ing.min_stock_alert;
    if (filterMode === 'low') return matchesSearch && isLow;
    if (filterMode === 'safe') return matchesSearch && !isLow;
    return matchesSearch;
  });

  const lowStockCount = ingredients.filter((i) => i.current_stock <= i.min_stock_alert).length;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);

    const nameTrimmed = newName.trim();
    const stockVal = parseFloat(newStock);
    const alertVal = parseFloat(newAlert);

    if (!nameTrimmed || isNaN(stockVal) || isNaN(alertVal)) {
      setAddError(
        lang === 'hi'
          ? 'कृपया सभी फ़ील्ड सही तरीके से भरें।'
          : 'Please fill in all fields with valid numbers.'
      );
      return;
    }

    if (ingredients.some((i) => i.name.toLowerCase() === nameTrimmed.toLowerCase())) {
      setAddError(
        lang === 'hi'
          ? `❌ ${nameTrimmed} पहले से ही मौजूद है।`
          : `❌ Ingredient "${nameTrimmed}" already exists in inventory.`
      );
      return;
    }

    onAddIngredient({
      name: nameTrimmed,
      current_stock: stockVal,
      unit: newUnit,
      min_stock_alert: alertVal,
    });

    setIsAddModalOpen(false);
    setNewName('');
    setNewStock('');
    setNewAlert('');
  };

  const handleRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIngredient) return;
    const qty = parseFloat(restockQty);
    if (isNaN(qty) || qty <= 0) return;

    onUpdateStock(selectedIngredient.item_id, qty, restockNote);
    setIsRestockModalOpen(false);
    setRestockQty('');
    setRestockNote('');
    setSelectedIngredient(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <Boxes className="w-6 h-6 text-[#174a70]" />
            <span>{lang === 'hi' ? 'कच्चा माल एवं इन्वेंटरी प्रबंधन' : 'Raw Materials & Inventory Management'}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {lang === 'hi'
              ? 'प्रत्येक डिश बिक्री पर रेसिपी बीओएम (BOM) के अनुसार स्टॉक का वास्तविक समय में स्वतः कटौती होती है।'
              : 'Real-time raw stock tracking with automated deduction on POS dish checkouts.'}
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            id="open-add-ingredient-btn"
            onClick={() => setIsAddModalOpen(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-[#174a70] hover:bg-[#123956] text-white text-xs font-bold rounded-xl shadow transition"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>{lang === 'hi' ? '+ नया कच्चा माल जोड़ें' : '+ Add New Ingredient'}</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="ingredient-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === 'hi' ? 'सामग्री खोजें (उदा: Paneer, Chicken, Rice)...' : 'Search raw material (e.g. Paneer, Chicken, Rice)...'}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white text-slate-900"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filterMode === 'all'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            {lang === 'hi' ? `सभी सामग्री (${ingredients.length})` : `All (${ingredients.length})`}
          </button>
          <button
            onClick={() => setFilterMode('low')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
              filterMode === 'low'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{lang === 'hi' ? `कम स्टॉक चेतावनी (${lowStockCount})` : `Low Stock Alert (${lowStockCount})`}</span>
          </button>
          <button
            onClick={() => setFilterMode('safe')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filterMode === 'safe'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
            }`}
          >
            {lang === 'hi' ? 'सुरक्षित स्टॉक' : 'Sufficient Stock'}
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-900 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-5 py-3.5">ID</th>
                <th className="px-5 py-3.5">{lang === 'hi' ? 'सामग्री का नाम' : 'Raw Material Name'}</th>
                <th className="px-5 py-3.5">{lang === 'hi' ? 'वर्तमान स्टॉक' : 'Current Stock'}</th>
                <th className="px-5 py-3.5">{lang === 'hi' ? 'इकाई' : 'Unit'}</th>
                <th className="px-5 py-3.5">{lang === 'hi' ? 'न्यूनतम चेतावनी सीमा' : 'Min Alert Threshold'}</th>
                <th className="px-5 py-3.5">{lang === 'hi' ? 'स्थिति' : 'Stock Status'}</th>
                <th className="px-5 py-3.5 text-right">{lang === 'hi' ? 'कार्रवाई' : 'Quick Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    <Boxes className="w-8 h-8 mx-auto mb-1 text-slate-300" />
                    <p>{lang === 'hi' ? 'कोई सामग्री नहीं मिली।' : 'No ingredients matching your criteria.'}</p>
                  </td>
                </tr>
              ) : (
                filtered.map((ing) => {
                  const isLow = ing.current_stock <= ing.min_stock_alert;
                  const isDepleted = ing.current_stock <= 0;

                  return (
                    <tr key={ing.item_id} className="hover:bg-slate-50/80 transition">
                      <td className="px-5 py-3.5 font-mono text-slate-400">#{ing.item_id}</td>
                      <td className="px-5 py-3.5 font-bold text-slate-900 text-sm">{ing.name}</td>
                      <td className="px-5 py-3.5">
                        <span className={`text-base font-black font-mono ${
                          isDepleted
                            ? 'text-rose-600'
                            : isLow
                            ? 'text-amber-600'
                            : 'text-slate-900'
                        }`}>
                          {ing.current_stock.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 uppercase font-mono font-semibold">
                        {ing.unit}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-slate-600">
                        {ing.min_stock_alert.toFixed(2)} {ing.unit}
                      </td>
                      <td className="px-5 py-3.5">
                        {isDepleted ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                            <AlertTriangle className="w-3 h-3" />
                            {lang === 'hi' ? 'स्टॉक समाप्त' : 'DEPLETED (0)'}
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                            <AlertTriangle className="w-3 h-3" />
                            {lang === 'hi' ? 'कम स्टॉक' : 'LOW STOCK ALERT'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-3 h-3" />
                            {lang === 'hi' ? 'पर्याप्त स्टॉक' : 'SUFFICIENT'}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            id={`restock-btn-${ing.item_id}`}
                            onClick={() => {
                              setSelectedIngredient(ing);
                              setIsRestockModalOpen(true);
                            }}
                            className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-xs"
                          >
                            <TrendingUp className="w-3 h-3" />
                            <span>{lang === 'hi' ? 'स्टॉक जोड़ें' : 'Restock'}</span>
                          </button>
                          <button
                            onClick={() => {
                              const newThreshold = prompt(
                                lang === 'hi'
                                  ? `${ing.name} के लिए न्यूनतम अलर्ट सीमा (${ing.unit}) दर्ज करें:`
                                  : `Enter new min alert threshold for ${ing.name} (${ing.unit}):`,
                                ing.min_stock_alert.toString()
                              );
                              if (newThreshold) {
                                const parsed = parseFloat(newThreshold);
                                if (!isNaN(parsed) && parsed >= 0) {
                                  onEditThreshold(ing.item_id, parsed);
                                }
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                            title="Edit Alert Threshold"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (
                                confirm(
                                  lang === 'hi'
                                    ? `क्या आप वाकई ${ing.name} को हटाना चाहते हैं?`
                                    : `Are you sure you want to delete ${ing.name} from inventory?`
                                )
                              ) {
                                onDeleteIngredient(ing.item_id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                            title="Delete Ingredient"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Add New Ingredient (Flask route `/add_ingredient`) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-[#174a70] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Boxes className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold">
                  {lang === 'hi' ? '➕ नया कच्चा माल (Ingredient) जोड़ें' : 'Add New Raw Material'}
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-300 hover:text-white rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              {addError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
                  {addError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'hi' ? 'सामग्री का नाम (Name)' : 'Material Name'}
                </label>
                <input
                  id="new-ingredient-name"
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Cheese, Capsicum, Butter..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#174a70]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === 'hi' ? 'प्रारंभिक स्टॉक (Stock)' : 'Initial Stock'}
                  </label>
                  <input
                    id="new-ingredient-stock"
                    type="number"
                    step="any"
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    placeholder="10.0"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#174a70]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === 'hi' ? 'इकाई (Unit)' : 'Unit'}
                  </label>
                  <select
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#174a70]"
                  >
                    <option value="kg">kg (Kilograms)</option>
                    <option value="L">L (Liters)</option>
                    <option value="grams">grams</option>
                    <option value="pcs">pcs (Pieces)</option>
                    <option value="packets">packets</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'hi' ? 'न्यूनतम स्टॉक चेतावनी (Min Alert)' : 'Min Stock Alert Threshold'}
                </label>
                <input
                  id="new-ingredient-alert"
                  type="number"
                  step="any"
                  value={newAlert}
                  onChange={(e) => setNewAlert(e.target.value)}
                  placeholder="2.0"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#174a70]"
                  required
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  {lang === 'hi'
                    ? 'जब स्टॉक इस मात्रा तक या उससे कम पहुंचेगा तो सिस्टम स्वचालित रूप से चेतावनी देगा।'
                    : 'System flags a low stock warning whenever current stock drops to or below this level.'}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  {lang === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  id="submit-add-ingredient"
                  type="submit"
                  className="px-5 py-2 bg-[#174a70] hover:bg-[#123956] text-white rounded-xl text-xs font-bold shadow"
                >
                  {lang === 'hi' ? 'सामग्री जोड़ें' : 'Save Ingredient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Quick Restock Existing Material */}
      {isRestockModalOpen && selectedIngredient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-[#174a70] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold">
                  {lang === 'hi' ? `आवश्यक स्टॉक जोड़ें: ${selectedIngredient.name}` : `Add Required Stock: ${selectedIngredient.name}`}
                </h3>
              </div>
              <button
                onClick={() => setIsRestockModalOpen(false)}
                className="p-1 text-slate-300 hover:text-white rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRestockSubmit} className="p-6 space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Current Stock:</span>
                  <span className="font-bold text-slate-900">
                    {selectedIngredient.current_stock.toFixed(2)} {selectedIngredient.unit}
                  </span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-slate-500">Min Alert Threshold:</span>
                  <span>
                    {selectedIngredient.min_stock_alert.toFixed(2)} {selectedIngredient.unit}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'hi' ? `जोड़ने की मात्रा (${selectedIngredient.unit})` : `Quantity to Add (${selectedIngredient.unit})`}
                </label>
                <input
                  type="number"
                  step="any"
                  value={restockQty}
                  onChange={(e) => setRestockQty(e.target.value)}
                  placeholder="e.g. 10.0"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono font-bold text-slate-900"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'hi' ? 'सप्लायर / इनवॉइस संदर्भ (वैकल्पिक)' : 'Supplier / Invoice Note (Optional)'}
                </label>
                <input
                  type="text"
                  value={restockNote}
                  onChange={(e) => setRestockNote(e.target.value)}
                  placeholder="e.g. Metro Cash & Carry invoice #8892"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRestockModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  {lang === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold shadow"
                >
                  {lang === 'hi' ? 'स्टॉक अपडेट करें' : 'Add Required Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
