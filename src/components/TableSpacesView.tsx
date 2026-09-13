import React, { useState } from 'react';
import {
  LayoutGrid,
  Plus,
  Users,
  CheckCircle2,
  Clock,
  Receipt,
  Sparkles,
  Search,
  Filter,
  ArrowRight,
  X,
  Trash2,
} from 'lucide-react';
import { RestaurantSpace, SpaceStatus } from '../types';

interface TableSpacesViewProps {
  spaces: RestaurantSpace[];
  onUpdateSpaceStatus: (spaceId: number, status: SpaceStatus) => void;
  onAddSpace: (label: string, capacity: number) => void;
  onDeleteSpace: (spaceId: number) => void;
  onSelectSpaceForBilling: (spaceLabel: string) => void;
  lang: 'en' | 'hi';
}

export const TableSpacesView: React.FC<TableSpacesViewProps> = ({
  spaces,
  onUpdateSpaceStatus,
  onAddSpace,
  onDeleteSpace,
  onSelectSpaceForBilling,
  lang,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'tables' | 'rooms'>('all');
  const [statusFilter, setStatusFilter] = useState<'All' | SpaceStatus>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newCapacity, setNewCapacity] = useState('4');
  const [modalError, setModalError] = useState<string | null>(null);

  // Filter logic
  const filtered = spaces.filter((s) => {
    const isTable = s.space_label.toLowerCase().startsWith('table');
    const isRoom = s.space_label.toLowerCase().startsWith('room');

    if (filterType === 'tables' && !isTable) return false;
    if (filterType === 'rooms' && !isRoom) return false;

    if (statusFilter !== 'All' && s.current_status !== statusFilter) return false;

    if (searchQuery.trim() && !s.space_label.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    return true;
  });

  // Metrics
  const totalCount = spaces.length;
  const availableCount = spaces.filter((s) => s.current_status === 'Available').length;
  const occupiedCount = spaces.filter((s) => s.current_status === 'Occupied').length;
  const billedCount = spaces.filter((s) => s.current_status === 'Billed').length;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    const label = newLabel.trim();
    const cap = parseInt(newCapacity, 10);

    if (!label) {
      setModalError(lang === 'hi' ? 'कृपया टेबल/रूम का नाम दर्ज करें।' : 'Please enter space label.');
      return;
    }

    if (isNaN(cap) || cap <= 0) {
      setModalError(lang === 'hi' ? 'मान्य क्षमता दर्ज करें।' : 'Please enter valid capacity.');
      return;
    }

    if (spaces.some((s) => s.space_label.toLowerCase() === label.toLowerCase())) {
      setModalError(
        lang === 'hi'
          ? `❌ "${label}" पहले से मौजूद है।`
          : `❌ Space "${label}" already exists.`
      );
      return;
    }

    onAddSpace(label, cap);
    setIsAddModalOpen(false);
    setNewLabel('');
    setNewCapacity('4');
  };

  const getStatusBadge = (status: SpaceStatus) => {
    switch (status) {
      case 'Available':
        return {
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          dot: 'bg-emerald-500',
          label: lang === 'hi' ? 'उपलब्ध (Available)' : 'Available',
        };
      case 'Occupied':
        return {
          bg: 'bg-amber-100 text-amber-900 border-amber-300',
          dot: 'bg-amber-500',
          label: lang === 'hi' ? 'व्यस्त (Occupied)' : 'Occupied',
        };
      case 'Billed':
        return {
          bg: 'bg-blue-100 text-blue-900 border-blue-300',
          dot: 'bg-blue-500',
          label: lang === 'hi' ? 'बिल जारी (Billed)' : 'Billed',
        };
      case 'Cleaning':
        return {
          bg: 'bg-purple-100 text-purple-900 border-purple-300',
          dot: 'bg-purple-500',
          label: lang === 'hi' ? 'सफाई कार्य (Cleaning)' : 'Cleaning',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <LayoutGrid className="w-6 h-6 text-[#174a70]" />
            <span>{lang === 'hi' ? 'टेबल व कक्ष प्रबंधन (Floor Plan)' : 'Table & Room Spaces (Floor Plan)'}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {lang === 'hi'
              ? 'रेस्तरां की 12 टेबल्स एवं 6 वीआईपी कक्षों की वास्तविक स्थिति व बिलिंग आवंटन।'
              : 'Live tracking of Tables 1-12 and Rooms 101-106 with status occupancy and fast billing dispatch.'}
          </p>
        </div>

        <button
          id="open-add-space-btn"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#174a70] hover:bg-[#123956] text-white text-xs font-bold rounded-xl shadow transition"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>{lang === 'hi' ? '+ नया स्थान जोड़ें' : '+ Add Table/Room'}</span>
        </button>
      </div>

      {/* Overview Stat Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-500 font-bold uppercase">{lang === 'hi' ? 'कुल स्थान' : 'Total Spaces'}</div>
            <div className="text-xl font-black text-slate-900 font-mono mt-0.5">{totalCount}</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
            <LayoutGrid className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] text-emerald-800 font-bold uppercase">{lang === 'hi' ? 'उपलब्ध' : 'Available'}</div>
            <div className="text-xl font-black text-emerald-800 font-mono mt-0.5">{availableCount}</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] text-amber-900 font-bold uppercase">{lang === 'hi' ? 'व्यस्त' : 'Occupied'}</div>
            <div className="text-xl font-black text-amber-900 font-mono mt-0.5">{occupiedCount}</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] text-blue-800 font-bold uppercase">{lang === 'hi' ? 'बिल प्रिंटेड' : 'Billed'}</div>
            <div className="text-xl font-black text-blue-800 font-mono mt-0.5">{billedCount}</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <Receipt className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === 'hi' ? 'टेबल या रूम खोजें...' : 'Search Table 1, Room 102...'}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#174a70] text-slate-900"
          />
        </div>

        {/* Space Category Tabs */}
        <div className="flex items-center gap-1.5">
          {[
            { id: 'all', label: lang === 'hi' ? 'सभी' : 'All Spaces' },
            { id: 'tables', label: lang === 'hi' ? 'टेबल्स (Tables)' : 'Tables (1-12)' },
            { id: 'rooms', label: lang === 'hi' ? 'कक्ष (Rooms)' : 'Rooms (101-106)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                filterType === tab.id
                  ? 'bg-[#174a70] text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {['All', 'Available', 'Occupied', 'Billed', 'Cleaning'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st as any)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Spaces Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((space) => {
          const badge = getStatusBadge(space.current_status);
          const isOccupied = space.current_status === 'Occupied';
          const isBilled = space.current_status === 'Billed';

          return (
            <div
              key={space.space_id}
              className={`bg-white rounded-2xl p-4 border transition flex flex-col justify-between shadow-xs ${
                isOccupied
                  ? 'border-amber-300 bg-amber-50/10'
                  : isBilled
                  ? 'border-blue-300 bg-blue-50/10'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                {/* Top Label & Capacity */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      {space.space_label.startsWith('Room') ? 'VIP Dining Room' : 'Floor Table'}
                    </span>
                    <h3 className="text-base font-black text-slate-900 mt-0.5">{space.space_label}</h3>
                  </div>

                  <div className="flex items-center gap-1 text-slate-500 text-xs font-semibold bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
                    <Users className="w-3.5 h-3.5" />
                    <span>{space.seating_capacity} pax</span>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="mt-3 flex items-center justify-between">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${badge.bg}`}
                  >
                    <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
                    <span>{badge.label}</span>
                  </span>

                  <button
                    onClick={() => onDeleteSpace(space.space_id)}
                    className="text-slate-300 hover:text-rose-500 p-1 transition"
                    title="Remove space"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Quick Status Select */}
                <div className="mt-3">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    {lang === 'hi' ? 'स्थिति बदलें:' : 'Quick Status:'}
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(['Available', 'Occupied', 'Billed', 'Cleaning'] as SpaceStatus[]).map((st) => (
                      <button
                        key={st}
                        onClick={() => onUpdateSpaceStatus(space.space_id, st)}
                        className={`px-2 py-1 rounded text-[11px] font-bold transition text-center ${
                          space.current_status === st
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Action: Assign to Billing */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <button
                  onClick={() => {
                    onUpdateSpaceStatus(space.space_id, 'Occupied');
                    onSelectSpaceForBilling(space.space_label);
                  }}
                  className="w-full py-2 bg-[#174a70] hover:bg-[#123956] text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Receipt className="w-3.5 h-3.5 text-amber-400" />
                  <span>{lang === 'hi' ? 'बिलिंग शुरू करें' : 'Start Order / Bill'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Space Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-[#174a70] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold">
                  {lang === 'hi' ? 'नया टेबल या कक्ष जोड़ें' : 'Add New Restaurant Space'}
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
              {modalError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
                  {modalError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'hi' ? 'स्थान का नाम (Space Label)' : 'Space Label (e.g. Table 13, Room 107)'}
                </label>
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="e.g. Table 13 or Room 107"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#174a70] font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'hi' ? 'बैठने की क्षमता (Seating Capacity)' : 'Seating Capacity'}
                </label>
                <select
                  value={newCapacity}
                  onChange={(e) => setNewCapacity(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#174a70] font-bold"
                >
                  <option value="2">2 Persons (Couple Table)</option>
                  <option value="4">4 Persons (Standard Table)</option>
                  <option value="6">6 Persons (Large Family / Room)</option>
                  <option value="8">8 Persons (Executive Dining)</option>
                  <option value="12">12 Persons (Banquet Board)</option>
                </select>
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
                  {lang === 'hi' ? 'स्थान सहेजें' : 'Save Space'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
