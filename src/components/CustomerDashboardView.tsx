import React, { useMemo, useState } from "react";
import { MenuItem, SystemSettings, User } from "../types";
import {
  MapPin, Search, Phone, Plus, Utensils, Soup, Wheat, IceCreamCone,
  Flame, Croissant, CupSoda, UtensilsCrossed
} from "lucide-react";

const CAT_ICONS: Record<string, React.ElementType> = {
  thali: Utensils,
  curri: Soup,
  biryani: Wheat,
  rice: Wheat,
  dessert: IceCreamCone,
  starter: Flame,
  bread: Croissant,
  naan: Croissant,
  beverage: CupSoda,
  meal: Utensils,
  snack: Flame,
};

const catIcon = (name: string) => {
  const k = (name || "").toLowerCase();
  const key = Object.keys(CAT_ICONS).find((c) => k.includes(c));
  return key ? CAT_ICONS[key] : UtensilsCrossed;
};

interface CustomerDashboardProps {
  user: User;
  settings: SystemSettings;
  menuItems: MenuItem[];
  onNavigateTab: (tabId: string) => void;
  lang: 'en' | 'hi';
}

export const CustomerDashboardView: React.FC<CustomerDashboardProps> = ({
  user,
  settings,
  menuItems,
  onNavigateTab,
  lang
}) => {
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState<string | null>(null);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(menuItems.map(m => m.category))).filter(Boolean);
    return cats.map(c => ({ id: c, name: c }));
  }, [menuItems]);

  const name = settings?.restaurant_name || "RAM TARA RESTAURANT";
  const helpline = settings?.mobile || "9759902961";

  // Simulate specials by taking top 3 items
  const specials = useMemo(() => menuItems.slice(0, 3), [menuItems]);
  const results = useMemo(() => {
    return menuItems.filter((m) => {
      const matchCat = !activeCat || m.category === activeCat;
      const matchSearch = !search || m.dish_name.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [menuItems, activeCat, search]);
  const showResults = !!search || !!activeCat;

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <MapPin className="w-5 h-5 shrink-0 text-amber-600" />
        <h1 className="font-black uppercase tracking-wide text-amber-800 text-center flex-1 text-lg sm:text-2xl leading-tight">
          {name}
        </h1>
        <div className="w-10 h-10 rounded-full bg-amber-500 text-slate-900 flex items-center justify-center font-bold text-sm shrink-0 border-2 border-amber-200">
          {(user?.name || user?.username || "U").split(" ").map((w) => w[0]).slice(0, 2).join("")}
        </div>
      </div>

      {/* Hero banner */}
      <div className="relative rounded-3xl overflow-hidden shadow-md group">
        <div className="w-full aspect-[16/9] sm:aspect-[21/9] bg-slate-900 flex items-center justify-center relative">
          <img src="https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&q=80&w=2000" alt="Restaurant Special" className="w-full h-full object-cover opacity-60 group-hover:opacity-70 transition-opacity duration-500" referrerPolicy="no-referrer" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <p className="absolute inset-0 flex items-center justify-center text-center px-4 text-white font-black text-2xl sm:text-4xl drop-shadow-xl tracking-tight">
            {lang === 'hi' ? 'प्रामाणिक स्वाद, राम तारा के साथ' : `Welcome to ${name.split(" ")[0]} — Authentic Flavors.`}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={lang === 'hi' ? "अपनी पसंदीदा डिश खोजें..." : "Search for your favorite dishes..."}
          className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-sm transition-all"
        />
      </div>

      {/* Category circles */}
      <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
        {categories.slice(0, 8).map((c) => {
          const Icon = catIcon(c.name);
          const active = activeCat === c.id;
          return (
            <button key={c.id} onClick={() => setActiveCat(active ? null : c.id)} className="flex flex-col items-center gap-2 group">
              <span className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-105 shadow-sm ${
                active ? "bg-amber-500 text-slate-900 ring-4 ring-amber-500/30" : "bg-white border border-slate-200 text-slate-600 hover:border-amber-300 hover:text-amber-600"
              }`}>
                <Icon className="w-6 h-6" />
              </span>
              <span className={`text-[11px] font-bold text-center leading-tight line-clamp-1 px-1 ${active ? 'text-amber-700' : 'text-slate-600'}`}>{c.name}</span>
            </button>
          );
        })}
      </div>

      {/* Today's specials */}
      {!showResults && (
        <section>
          <h2 className="font-black text-lg mb-4 text-slate-900 flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500" />
            {lang === 'hi' ? "आज की विशेष डिश" : "Today's Specials"}
          </h2>
          <div className="grid sm:grid-cols-3 gap-5">
            {specials.map((item) => (
              <div key={item.dish_id} className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm flex flex-col group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="relative h-36 bg-slate-100 flex items-center justify-center">
                   <div className="absolute inset-0 bg-slate-200/50 group-hover:bg-slate-200 transition-colors" />
                   <UtensilsCrossed className="w-10 h-10 text-slate-300 relative z-10" />
                  <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-black shadow-md z-10">
                    ₹{item.price.toFixed(2)}
                  </span>
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex items-start gap-2 mb-1">
                    <span className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center shrink-0 mt-0.5 ${item.is_veg ? 'border-emerald-600' : 'border-rose-600'}`}>
                      <span className={`block w-1.5 h-1.5 rounded-full ${item.is_veg ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                    </span>
                    <p className="font-bold text-sm leading-tight text-slate-900">{item.dish_name}</p>
                  </div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mt-1 mb-4 line-clamp-1">{item.category}</p>
                  <button onClick={() => onNavigateTab('pos')} className="mt-auto w-full inline-flex justify-center items-center gap-1.5 px-3 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-500 hover:text-slate-900 text-amber-700 text-xs font-black transition-colors">
                    <Plus className="w-3.5 h-3.5" /> {lang === 'hi' ? 'POS में जोड़ें' : 'Order via POS'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Search / category results */}
      {showResults && (
        <section>
          <h2 className="font-black text-lg mb-4 text-slate-900">
            {results.length} {results.length === 1 ? (lang === 'hi' ? "डिश" : "dish") : (lang === 'hi' ? "डिशेस" : "dishes")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {results.map((item) => (
              <div key={item.dish_id} className="rounded-2xl border border-slate-200 bg-white p-4 flex flex-col shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex items-start justify-between mb-2 gap-2">
                  <div className="flex items-start gap-2">
                    <span className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center shrink-0 mt-0.5 ${item.is_veg ? 'border-emerald-600' : 'border-rose-600'}`}>
                      <span className={`block w-1.5 h-1.5 rounded-full ${item.is_veg ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                    </span>
                    <p className="font-bold text-sm leading-tight text-slate-900">{item.dish_name}</p>
                  </div>
                  <span className="text-slate-900 font-black text-sm bg-slate-100 px-2 py-0.5 rounded-lg shrink-0">₹{item.price.toFixed(2)}</span>
                </div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mt-1 mb-4 flex-1">{item.category}</p>
                <button onClick={() => onNavigateTab('pos')} className="w-full inline-flex justify-center items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition">
                  <Plus className="w-3.5 h-3.5 text-amber-400" /> {lang === 'hi' ? 'ऑर्डर करें' : 'Order Now'}
                </button>
              </div>
            ))}
            {results.length === 0 && (
              <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-slate-200 border-dashed">
                <UtensilsCrossed className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p className="text-slate-500 font-medium text-sm">{lang === 'hi' ? 'कोई डिश नहीं मिली।' : 'No dishes found.'}</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Helpline */}
      <div className="rounded-2xl bg-slate-900 text-white p-5 flex items-center justify-between gap-4 shadow-lg overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-amber-500/30 transition-colors" />
        <div className="flex items-center gap-4 relative z-10">
          <span className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0 backdrop-blur-sm border border-white/10"><Phone className="w-5 h-5 text-amber-400" /></span>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'hi' ? 'सहायता केंद्र' : 'Restaurant Helpline'}</p>
            <p className="font-black text-lg text-white mt-0.5">{helpline}</p>
          </div>
        </div>
        <a href={`tel:${helpline}`} className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 text-sm font-black transition-colors relative z-10 shadow-sm">
          {lang === 'hi' ? 'कॉल करें' : 'Call Now'}
        </a>
      </div>
    </div>
  );
};
