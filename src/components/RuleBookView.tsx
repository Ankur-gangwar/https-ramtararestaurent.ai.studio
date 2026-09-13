import React, { useState } from 'react';
import {
  BookMarked,
  Search,
  Plus,
  ShieldAlert,
  HelpCircle,
  FileCheck2,
  Trash2,
  X,
  Sparkles,
  Layers,
} from 'lucide-react';
import { RuleBookEntry } from '../types';

interface RuleBookViewProps {
  rules: RuleBookEntry[];
  onAddRule: (rule: Omit<RuleBookEntry, 'rule_id'>) => void;
  onDeleteRule: (ruleId: number) => void;
  lang: 'en' | 'hi';
}

export const RuleBookView: React.FC<RuleBookViewProps> = ({
  rules,
  onAddRule,
  onDeleteRule,
  lang,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states
  const [category, setCategory] = useState<RuleBookEntry['rule_category']>('Staff Rules');
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const categories = ['All', 'Staff Rules', 'Restaurant Rules', 'Inventory & Kitchen', 'General'];

  const filteredRules = rules.filter((r) => {
    const matchesCat = selectedCategory === 'All' || r.rule_category === selectedCategory;
    const matchesSearch =
      r.topic_header.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.rule_description_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.rule_category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedTopic = topic.trim();
    const trimmedDesc = description.trim();

    if (!trimmedTopic || !trimmedDesc) {
      setFormError(
        lang === 'hi' ? 'कृपया नियम का शीर्षक और विवरण भरें।' : 'Please enter rule topic and description.'
      );
      return;
    }

    if (rules.some((r) => r.topic_header.toLowerCase() === trimmedTopic.toLowerCase())) {
      setFormError(
        lang === 'hi'
          ? `❌ नियम "${trimmedTopic}" पहले से मौजूद है।`
          : `❌ Rule "${trimmedTopic}" already exists.`
      );
      return;
    }

    onAddRule({
      rule_category: category,
      topic_header: trimmedTopic,
      rule_description_text: trimmedDesc,
    });

    setIsAddModalOpen(false);
    setTopic('');
    setDescription('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <BookMarked className="w-6 h-6 text-[#174a70]" />
            <span>{lang === 'hi' ? 'संचालन नियमावली व दिशानिर्देश (Knowledge Base)' : 'Standard Operating Procedures & Rules'}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {lang === 'hi'
              ? 'कर्मचारी कर्तव्य, वर्दी, लेट नियम, बिलिंग एवं रेस्तरां संचालन के 16 आधिकारिक मानक नियम।'
              : 'Official restaurant handbook with Staff Rules, Billing guidelines, Floor policies, and Customer service protocols.'}
          </p>
        </div>

        <button
          id="open-add-rule-btn"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#174a70] hover:bg-[#123956] text-white text-xs font-bold rounded-xl shadow transition"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>{lang === 'hi' ? '+ नया नियम जोड़ें' : '+ Add SOP Rule'}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === 'hi' ? 'नियम या कीवर्ड खोजें (जैसे: Uniform, Refund, Timing)...' : 'Search rule topic or keyword (e.g. Uniform, Timing, Refund)...'}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#174a70] text-slate-900"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[#174a70] text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRules.map((rule) => {
          const isStaffRule = rule.rule_category === 'Staff Rules';

          return (
            <div
              key={rule.rule_id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      isStaffRule
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    {rule.rule_category}
                  </span>

                  <button
                    onClick={() => onDeleteRule(rule.rule_id)}
                    className="text-slate-300 hover:text-rose-600 p-1 transition"
                    title="Delete rule"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5 mt-1">
                  <FileCheck2 className="w-4 h-4 text-[#174a70] shrink-0" />
                  <span>{rule.topic_header}</span>
                </h3>

                <p className="text-xs text-slate-600 mt-2.5 leading-relaxed font-normal">
                  {rule.rule_description_text}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400 font-mono flex items-center justify-between">
                <span>Rule ID: #{rule.rule_id}</span>
                <span className="text-emerald-800 font-bold flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" />
                  <span>Active Policy</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Rule Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-[#174a70] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookMarked className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold">
                  {lang === 'hi' ? 'नया नियम / एसओपी जोड़ें' : 'Create Operating SOP Rule'}
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
                  {lang === 'hi' ? 'श्रेणी (Category)' : 'Policy Category'}
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#174a70] font-bold"
                >
                  <option value="Staff Rules">Staff Rules</option>
                  <option value="Restaurant Rules">Restaurant Rules</option>
                  <option value="Inventory & Kitchen">Inventory & Kitchen</option>
                  <option value="General">General Operations</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'hi' ? 'विषय शीर्षक (Topic Header)' : 'Topic / Policy Title'}
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Hygiene standards, Cleaning schedule..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#174a70] font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'hi' ? 'नियम का विवरण (Description)' : 'Rule Detailed Description'}
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter full operational policy guideline..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#174a70]"
                  required
                />
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
                  {lang === 'hi' ? 'नियम सहेजें' : 'Save Policy Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
