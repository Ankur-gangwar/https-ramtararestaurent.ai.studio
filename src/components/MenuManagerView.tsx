import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  Utensils,
  X,
  IndianRupee,
} from 'lucide-react';
import { MenuItem } from '../types';

interface MenuManagerViewProps {
  menuItems: MenuItem[];
  onAddMenuItem: (item: Omit<MenuItem, 'dish_id'>) => void;
  onUpdatePrice: (dishId: number, newPrice: number) => void;
  onDeleteMenuItem: (dishId: number) => void;
  lang: 'en' | 'hi';
  userRole?: string;
}

export const MenuManagerView: React.FC<MenuManagerViewProps> = ({
  menuItems,
  onAddMenuItem,
  onUpdatePrice,
  onDeleteMenuItem,
  lang,
  userRole,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<MenuItem['category']>('South Indian');
  const [isVeg, setIsVeg] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  const categories = [
    'All',
    'South Indian',
    'Meals & Biryani',
    'North Indian',
    'Snacks & Starters',
    'Beverages',
    'Desserts',
  ];

  const filtered = menuItems.filter((m) => {
    const matchesCategory = categoryFilter === 'All' || m.category === categoryFilter;
    const matchesSearch = m.dish_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedName = name.trim();
    const parsedPrice = parseFloat(price);

    if (!trimmedName || isNaN(parsedPrice) || parsedPrice <= 0) {
      setFormError(
        lang === 'hi' ? 'कृपया सभी विवरण सही तरीके से भरें।' : 'Please enter valid dish details and price.'
      );
      return;
    }

    if (menuItems.some((m) => m.dish_name.toLowerCase() === trimmedName.toLowerCase())) {
      setFormError(
        lang === 'hi'
          ? `❌ ${trimmedName} पहले से मेन्यू में मौजूद है।`
          : `❌ Dish "${trimmedName}" already exists in menu.`
      );
      return;
    }

    onAddMenuItem({
      dish_name: trimmedName,
      price: parsedPrice,
      category,
      is_veg: isVeg,
    });

    setIsAddModalOpen(false);
    setName('');
    setPrice('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[#174a70]" />
            <span>{lang === 'hi' ? 'मेन्यू डिश एवं मूल्य प्रबंधन' : 'Restaurant Menu & Pricing Master'}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {lang === 'hi'
              ? 'रेस्तरां के सभी व्यंजनों, उनकी श्रेणियों और बिक्री मूल्यों का प्रबंधन।'
              : 'Add dishes, customize selling rates, and organize categories for POS billing.'}
          </p>
        </div>

        <button
          id="open-add-dish-btn"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#174a70] hover:bg-[#123956] text-white text-xs font-bold rounded-xl shadow transition"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>{lang === 'hi' ? '+ नया डिश जोड़ें' : '+ Add Menu Item'}</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === 'hi' ? 'डिश का नाम खोजें...' : 'Search dish name...'}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#174a70] text-slate-900"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                categoryFilter === cat
                  ? 'bg-[#174a70] text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Dishes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filtered.map((item) => (
          <div
            key={item.dish_id}
            className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm hover:shadow transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-1 mb-2">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-2.5 h-2.5 rounded-full border-2 ${
                      item.is_veg
                        ? 'border-emerald-600 bg-emerald-500'
                        : 'border-rose-600 bg-rose-500'
                    }`}
                  />
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    {item.category}
                  </span>
                </div>
                <span className="font-mono text-slate-400 text-[10px]">#{item.dish_id}</span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 leading-snug">{item.dish_name}</h3>
              <div className="text-lg font-black text-[#174a70] mt-1 font-mono">
                ₹{item.price.toFixed(2)}
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => {
                  const newP = prompt(
                    lang === 'hi'
                      ? `${item.dish_name} के लिए नया मूल्य (₹) दर्ज करें:`
                      : `Enter new selling price for ${item.dish_name} (₹):`,
                    item.price.toString()
                  );
                  if (newP) {
                    const parsed = parseFloat(newP);
                    if (!isNaN(parsed) && parsed > 0) {
                      onUpdatePrice(item.dish_id, parsed);
                    }
                  }
                }}
                className="text-xs font-bold text-slate-600 hover:text-[#174a70] flex items-center gap-1 transition"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>{lang === 'hi' ? 'मूल्य बदलें' : 'Edit Rate'}</span>
              </button>

              {['Admin', 'Manager'].includes(userRole || 'Admin') && (
                <button
                  onClick={() => {
                    if (
                      confirm(
                        lang === 'hi'
                          ? `क्या आप वाकई ${item.dish_name} को मेन्यू से हटाना चाहते हैं?`
                          : `Are you sure you want to remove ${item.dish_name} from menu?`
                      )
                    ) {
                      onDeleteMenuItem(item.dish_id);
                    }
                  }}
                  className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                  title="Delete Dish"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Dish Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-[#174a70] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold">
                  {lang === 'hi' ? 'नया व्यंजन जोड़ें' : 'Add New Menu Dish'}
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
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'hi' ? 'व्यंजन का नाम (Dish Name)' : 'Dish Name'}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Butter Roti, Butter Chicken, Filter Coffee..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#174a70]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === 'hi' ? 'विक्रय मूल्य (Price in ₹)' : 'Selling Price (₹)'}
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="80.00"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#174a70] font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === 'hi' ? 'श्रेणी (Category)' : 'Category'}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#174a70]"
                  >
                    <option value="South Indian">South Indian</option>
                    <option value="Meals & Biryani">Meals & Biryani</option>
                    <option value="North Indian">North Indian</option>
                    <option value="Snacks & Starters">Snacks & Starters</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Desserts">Desserts</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'hi' ? 'प्रकार (Dietary Type)' : 'Dietary Classification'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setIsVeg(true)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                      isVeg
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                    <span>Vegetarian (शाकाहारी)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsVeg(false)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                      !isVeg
                        ? 'bg-rose-100 text-rose-900 border border-rose-300'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                    <span>Non-Veg (मांसाहारी)</span>
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  {lang === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#174a70] hover:bg-[#123956] text-white rounded-xl text-xs font-bold shadow"
                >
                  {lang === 'hi' ? 'डिश सहेजें' : 'Save Dish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
