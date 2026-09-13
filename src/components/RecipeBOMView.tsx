import React, { useState } from 'react';
import {
  ScrollText,
  Plus,
  Trash2,
  Boxes,
  Utensils,
  Gauge,
  AlertCircle,
  CheckCircle2,
  X,
  Search,
} from 'lucide-react';
import { RecipeBOM, MenuItem, Ingredient } from '../types';
import { calculatePortionYield } from '../services/storage';

interface RecipeBOMViewProps {
  recipeBOMs: RecipeBOM[];
  menuItems: MenuItem[];
  ingredients: Ingredient[];
  onAddBOM: (bom: Omit<RecipeBOM, 'recipe_id'>) => void;
  onDeleteBOM: (recipeId: number) => void;
  lang: 'en' | 'hi';
}

export const RecipeBOMView: React.FC<RecipeBOMViewProps> = ({
  recipeBOMs,
  menuItems,
  ingredients,
  onAddBOM,
  onDeleteBOM,
  lang,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [dishName, setDishName] = useState(menuItems[0]?.dish_name || '');
  const [ingredientName, setIngredientName] = useState(ingredients[0]?.name || '');
  const [quantityUsed, setQuantityUsed] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const selectedIng = ingredients.find((i) => i.name === ingredientName);
  const unit = selectedIng ? selectedIng.unit : 'kg';

  // Group BOMs by Dish Name
  const groupedByDish = menuItems
    .map((dish) => {
      const items = recipeBOMs.filter(
        (b) => b.dish_name.toLowerCase() === dish.dish_name.toLowerCase()
      );
      const portionYield = calculatePortionYield(dish.dish_name, recipeBOMs, ingredients);
      return {
        dish,
        boms: items,
        yield: portionYield,
      };
    })
    .filter((group) => {
      const matchesSearch =
        group.dish.dish_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.boms.some((b) => b.ingredient_name.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesSearch;
    });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const qty = parseFloat(quantityUsed);
    if (isNaN(qty) || qty <= 0) {
      setFormError(
        lang === 'hi' ? 'कृपया एक मान्य मात्रा दर्ज करें।' : 'Please enter a valid positive quantity.'
      );
      return;
    }

    // Check if duplicate mapping already exists
    const exists = recipeBOMs.some(
      (b) =>
        b.dish_name.toLowerCase() === dishName.toLowerCase() &&
        b.ingredient_name.toLowerCase() === ingredientName.toLowerCase()
    );

    if (exists) {
      setFormError(
        lang === 'hi'
          ? `❌ इस डिश के लिए ${ingredientName} पहले से ही जुड़ा हुआ है।`
          : `❌ ${ingredientName} is already linked to ${dishName}.`
      );
      return;
    }

    onAddBOM({
      dish_name: dishName,
      ingredient_name: ingredientName,
      quantity_used: qty,
      unit,
    });

    setIsModalOpen(false);
    setQuantityUsed('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <ScrollText className="w-6 h-6 text-[#174a70]" />
            <span>{lang === 'hi' ? 'रेसिपी व सामग्री अनुपात (Recipe BOM)' : 'Recipe Bill of Materials (BOM)'}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {lang === 'hi'
              ? 'प्रत्येक डिश को बनाने में लगने वाले कच्चे माल का सटीक अनुपात निर्धारित करें। यह वास्तविक समय में स्टॉक उपलब्धता की गणना करता है।'
              : 'Link menu dishes to specific raw ingredients to automate inventory deduction and maximum portion yield.'}
          </p>
        </div>

        <button
          id="open-add-bom-btn"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#174a70] hover:bg-[#123956] text-white text-xs font-bold rounded-xl shadow transition"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>{lang === 'hi' ? '+ नया घटक जोड़ें' : '+ Link Ingredient to Dish'}</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={lang === 'hi' ? 'डिश या कच्चा माल खोजें...' : 'Filter dishes or ingredients...'}
          className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#174a70] text-slate-900 shadow-sm"
        />
      </div>

      {/* Grid of Dish Recipe Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groupedByDish.map(({ dish, boms, yield: portionYield }) => {
          const isConfigured = boms.length > 0;
          const isZeroStock = isConfigured && portionYield.maxPortions === 0;

          return (
            <div
              key={dish.dish_id}
              className={`bg-white rounded-2xl p-4 border transition-all flex flex-col justify-between ${
                isZeroStock
                  ? 'border-rose-300 bg-rose-50/10'
                  : isConfigured
                  ? 'border-slate-200 shadow-sm hover:border-amber-400'
                  : 'border-dashed border-slate-300 bg-slate-50/50'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          dish.is_veg ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}
                      />
                      <h3 className="text-sm font-bold text-slate-900">{dish.dish_name}</h3>
                    </div>
                    <span className="text-[10px] text-slate-600 font-semibold">{dish.category}</span>
                  </div>
                  <span className="text-xs font-mono font-black text-[#174a70]">
                    ₹{dish.price.toFixed(2)}
                  </span>
                </div>

                {/* Portion Yield Meter */}
                <div className="my-3 p-2 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Gauge className="w-4 h-4 text-slate-500" />
                    <span className="text-[11px] font-semibold">
                      {lang === 'hi' ? 'तैयार कर सकने योग्य:' : 'Max Portions Ready:'}
                    </span>
                  </div>
                  <span
                    className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                      !isConfigured
                        ? 'bg-slate-200 text-slate-600'
                        : isZeroStock
                        ? 'bg-rose-100 text-rose-800'
                        : portionYield.maxPortions <= 5
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {!isConfigured
                      ? 'No Recipe'
                      : isZeroStock
                      ? '0 (Stock Empty)'
                      : `~${portionYield.maxPortions} Portions`}
                  </span>
                </div>

                {portionYield.limitingIngredient && portionYield.maxPortions < 999 && (
                  <p className="text-[10px] text-amber-800 font-medium mb-2 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
                    <span>
                      {lang === 'hi'
                        ? `सीमाबद्ध सामग्री: ${portionYield.limitingIngredient}`
                        : `Stock constrained by: ${portionYield.limitingIngredient}`}
                    </span>
                  </p>
                )}

                {/* Ingredients List */}
                <div className="space-y-1.5">
                  <div className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                    {lang === 'hi' ? 'प्रति डिश कच्ची सामग्री (BOM):' : 'BOM Ingredients Per Dish:'}
                  </div>

                  {boms.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-2">
                      {lang === 'hi'
                        ? 'कोई रेसिपी सेट नहीं है। सामग्री जोड़ने के लिए ऊपर बटन दबाएं।'
                        : 'No recipe BOM attached. Click above to define ingredients.'}
                    </p>
                  ) : (
                    boms.map((bom) => {
                      const ing = ingredients.find(
                        (i) => i.name.toLowerCase() === bom.ingredient_name.toLowerCase()
                      );
                      const currentStock = ing ? ing.current_stock : 0;
                      const unitStr = bom.unit || (ing ? ing.unit : 'kg');

                      return (
                        <div
                          key={bom.recipe_id}
                          className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 border border-slate-200/60"
                        >
                          <div>
                            <span className="font-bold text-slate-800">{bom.ingredient_name}</span>
                            <div className="text-[10px] text-slate-500 font-mono">
                              Stock: {currentStock.toFixed(2)} {unitStr}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-900 text-[11px] bg-white px-2 py-0.5 rounded border border-slate-200">
                              {bom.quantity_used} {unitStr}
                            </span>
                            <button
                              onClick={() => onDeleteBOM(bom.recipe_id)}
                              className="text-slate-400 hover:text-rose-600 p-1"
                              title="Delete ingredient from recipe"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-3 mt-3 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => {
                    setDishName(dish.dish_name);
                    setIsModalOpen(true);
                  }}
                  className="text-xs font-bold text-[#174a70] hover:text-amber-600 flex items-center gap-1 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{lang === 'hi' ? 'सामग्री जोड़ें' : 'Add Ingredient'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add BOM Ingredient Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-[#174a70] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ScrollText className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold">
                  {lang === 'hi' ? 'डिश में सामग्री जोड़ें (Recipe BOM)' : 'Attach Ingredient to Dish'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
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
                  {lang === 'hi' ? 'डिश चुनें (Menu Item)' : 'Select Menu Dish'}
                </label>
                <select
                  value={dishName}
                  onChange={(e) => setDishName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#174a70] font-bold text-slate-900"
                >
                  {menuItems.map((m) => (
                    <option key={m.dish_id} value={m.dish_name}>
                      {m.dish_name} (₹{m.price.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'hi' ? 'कच्चा माल (Raw Material)' : 'Required Raw Ingredient'}
                </label>
                <select
                  value={ingredientName}
                  onChange={(e) => setIngredientName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#174a70] font-bold text-slate-900"
                >
                  {ingredients.map((ing) => (
                    <option key={ing.item_id} value={ing.name}>
                      {ing.name} (Unit: {ing.unit}, Stock: {ing.current_stock.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'hi' ? `प्रति डिश उपयोग मात्रा (${unit})` : `Quantity Used Per Portion (${unit})`}
                </label>
                <input
                  type="number"
                  step="any"
                  value={quantityUsed}
                  onChange={(e) => setQuantityUsed(e.target.value)}
                  placeholder="e.g. 0.20"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#174a70] font-mono font-bold"
                  required
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  {lang === 'hi'
                    ? `उदाहरण: 1 प्लेट के लिए 0.25 ${unit} कच्ची सामग्री लगती है।`
                    : `e.g. 0.25 ${unit} will be deducted from inventory per sold plate.`}
                </p>
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
                  className="px-5 py-2 bg-[#174a70] hover:bg-[#123956] text-white rounded-xl text-xs font-bold shadow"
                >
                  {lang === 'hi' ? 'रेसिपी में जोड़ें' : 'Save BOM Mapping'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
