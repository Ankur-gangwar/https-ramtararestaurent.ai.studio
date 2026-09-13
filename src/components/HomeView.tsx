import React, { useState } from 'react';
import {
  ShoppingCart,
  LayoutGrid,
  Boxes,
  Users,
  ScrollText,
  FileSpreadsheet,
  BookMarked,
  Sparkles,
  ChefHat,
  TrendingUp,
  Clock,
  MapPin,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Award,
  Heart,
  Utensils,
  BadgePercent,
  Calendar,
  X,
  Maximize2,
  Phone,
  DollarSign,
  Coffee,
  Activity,
  Layers,
} from 'lucide-react';
import {
  User,
  SystemSettings,
  BillingStatement,
  Ingredient,
  RestaurantSpace,
  StaffMember,
  AttendanceRecord,
  RuleBookEntry,
  PermanentCustomer,
  MenuItem,
} from '../types';
import ramTaraBg from '../assets/images/indian_thali_hero_1789136486046.jpg';

interface HomeViewProps {
  user: User;
  settings: SystemSettings;
  invoices: BillingStatement[];
  ingredients: Ingredient[];
  spaces: RestaurantSpace[];
  staff: StaffMember[];
  attendance: AttendanceRecord[];
  rules: RuleBookEntry[];
  customers: PermanentCustomer[];
  menuItems: MenuItem[];
  onNavigateTab: (tabId: string) => void;
  onSelectSpaceForBilling: (spaceLabel: string) => void;
  lang: 'en' | 'hi';
}

export const HomeView: React.FC<HomeViewProps> = ({
  user,
  settings,
  invoices,
  ingredients,
  spaces,
  staff,
  attendance,
  rules,
  customers,
  menuItems,
  onNavigateTab,
  onSelectSpaceForBilling,
  lang,
}) => {
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [lightboxTitle, setLightboxTitle] = useState<string>('');

  const todayStr = new Date().toISOString().substring(0, 10);
  const todayInvoices = invoices.filter(
    (inv) => inv.invoice_date && inv.invoice_date.startsWith(todayStr)
  );
  const todayRevenue = todayInvoices.reduce((sum, inv) => sum + (inv.grand_total || 0), 0);
  const todayOrdersCount = todayInvoices.length;

  const availableSpaces = spaces.filter((s) => s.current_status === 'Available');
  const occupiedSpaces = spaces.filter((s) => s.current_status === 'Occupied');
  const billedSpaces = spaces.filter((s) => s.current_status === 'Billed');

  const lowStockItems = ingredients.filter(
    (i) => i.current_stock_quantity <= i.reorder_level_threshold
  );

  const todayPresentStaff = attendance.filter(
    (a) => a.log_date === todayStr && a.attendance_status === 'Present'
  );

  // Time-based greeting
  const currentHour = new Date().getHours();
  let timeGreeting =
    currentHour < 12
      ? lang === 'hi'
        ? 'शुभ प्रभात'
        : 'Good morning'
      : currentHour < 17
      ? lang === 'hi'
        ? 'शुभ दोपहर'
        : 'Good afternoon'
      : lang === 'hi'
      ? 'शुभ संध्या'
      : 'Good evening';

  // Key signature dishes for quick glance
  const featuredDishes = menuItems.slice(0, 4);

  // Featured rule (Rule 17: Permanent Customer 5% Extra Privilege)
  const featuredRule = rules.find((r) => r.rule_id === 17) || rules[0];

  return (
    <div className="space-y-8 pb-10">
      {/* HERO SECTION with High-Energy AI Staff Team Background */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 text-white shadow-xl min-h-[300px] flex flex-col justify-between">
        {/* Background Image with Dark Atmospheric & Amber Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={ramTaraBg}
            alt="Ram Tara Restaurant Hero"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/50 to-transparent" />
        </div>

        {/* Hero Top Content */}
        <div className="relative z-10 p-6 sm:p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{settings.restaurant_name || 'RAM TARA RESTAURANT'}</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {lang === 'hi' ? 'टर्मिनल लाइव' : 'POS & Kitchen Live'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white drop-shadow-md">
              {timeGreeting},{' '}
              <span className="text-amber-400 capitalize">
                {user.name || user.username}
              </span>
              !
            </h1>

            <p className="text-sm sm:text-base text-slate-200 leading-relaxed drop-shadow-sm">
              {lang === 'hi'
                ? 'राम तारा रेस्टोरेंट प्रबंधन प्रणाली में आपका स्वागत है। यहां से सीधे बिलिंग, टेबल आरक्षण, इन्वेंटरी, एवं स्टाफ हाजिरी संचालित करें।'
                : 'Welcome to Ram Tara Hospitality Command Center. Fast-track order ticketing, live floor allocations, raw ingredient BOMs, and team attendance in real-time.'}
            </p>

            <div className="flex items-center gap-4 text-xs text-slate-300 pt-1 flex-wrap">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>{settings.address || 'Bareilly, UP, India'}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span>{settings.mobile || '9999999999'}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>GST: {settings.gstein || '09AAAAA0000A1Z5'}</span>
              </span>
            </div>
          </div>

          {/* Quick Primary Actions in Hero */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 w-full sm:w-auto shrink-0">
            <button
              id="hero-start-billing-btn"
              onClick={() => onNavigateTab('pos')}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 transition group"
            >
              <ShoppingCart className="w-4 h-4 text-slate-950 group-hover:scale-110 transition-transform" />
              <span>{lang === 'hi' ? 'नई बिलिंग काउंटर शुरू करें' : 'Start POS Billing'}</span>
              <ArrowRight className="w-4 h-4 text-slate-950 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              id="hero-view-tables-btn"
              onClick={() => onNavigateTab('spaces')}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700/90 text-white font-bold text-xs border border-white/20 backdrop-blur-md transition"
            >
              <LayoutGrid className="w-4 h-4 text-amber-400" />
              <span>{lang === 'hi' ? 'लाइव टेबल स्थिति देखें' : 'View Floor Plan'}</span>
            </button>

            <button
              id="hero-view-family-photo-btn"
              onClick={() => {
                setLightboxImage(ramTaraBg);
                setLightboxTitle(
                  lang === 'hi'
                    ? 'राम तारा - हमारा स्टाफ परिवार'
                    : 'Ram Tara Restaurant • Staff Family'
                );
              }}
              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900/60 hover:bg-slate-800/70 text-slate-300 hover:text-white font-medium text-xs border border-white/10 transition"
            >
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'hi' ? 'स्टाफ फैमिली फोटो' : 'Staff Family Photo'}</span>
            </button>
          </div>
        </div>

        {/* Hero Bottom Mini Bar */}
        <div className="relative z-10 px-6 sm:px-8 py-3 bg-slate-950/70 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-300">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 text-amber-300 font-semibold">
              <BadgePercent className="w-4 h-4 text-amber-400" />
              <span>{lang === 'hi' ? '5% अतिरिक्त स्थायी ग्राहक छूट सक्रिय' : '5% Extra VIP Patron Privilege Active'}</span>
            </span>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="flex items-center gap-1 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{new Date().toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-mono text-slate-400 text-[11px]">
              Active User: <span className="text-white font-bold">{user.name || user.username}</span> ({user.role})
            </span>
          </div>
        </div>
      </div>

      {/* LIVE PULSE METRICS */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black tracking-tight text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#174a70]" />
            <span>{lang === 'hi' ? 'दैनिक परिचालन स्थिति (Live Pulse)' : 'Live Operational Snapshot'}</span>
          </h2>
          <span className="text-xs text-slate-500">
            {lang === 'hi' ? 'स्वचालित रीयल-टाइम डेटा' : 'Real-time database sync'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {/* Metric 1: Today Revenue */}
          <div
            onClick={() => onNavigateTab('invoices')}
            className="cursor-pointer bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:border-amber-400 hover:shadow-md transition group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">
                {lang === 'hi' ? 'आज की कुल बिक्री' : "Today's Sales"}
              </span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-black text-slate-900 font-mono">
              ₹{Math.round(todayRevenue).toLocaleString()}
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>{todayOrdersCount} {lang === 'hi' ? 'ऑर्डर्स पूरे हुए' : 'orders closed'}</span>
            </div>
          </div>

          {/* Metric 2: Floor Spaces */}
          <div
            onClick={() => onNavigateTab('spaces')}
            className="cursor-pointer bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:border-amber-400 hover:shadow-md transition group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">
                {lang === 'hi' ? 'टेबल उपलब्धता' : 'Floor Tables'}
              </span>
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <LayoutGrid className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-black text-slate-900 font-mono">
              {availableSpaces.length} <span className="text-xs font-normal text-slate-500">/ {spaces.length} Free</span>
            </div>
            <div className="text-[11px] text-amber-600 font-semibold mt-1">
              {occupiedSpaces.length} {lang === 'hi' ? 'पर डाइनिंग चालू' : 'active tables'}
            </div>
          </div>

          {/* Metric 3: Low Stock Alerts */}
          <div
            onClick={() => onNavigateTab('inventory')}
            className="cursor-pointer bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:border-amber-400 hover:shadow-md transition group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">
                {lang === 'hi' ? 'कम स्टॉक अलर्ट' : 'Stock Alerts'}
              </span>
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform ${
                  lowStockItems.length > 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                }`}
              >
                <Boxes className="w-4 h-4" />
              </div>
            </div>
            <div
              className={`text-xl font-black font-mono ${
                lowStockItems.length > 0 ? 'text-rose-600' : 'text-slate-900'
              }`}
            >
              {lowStockItems.length}
            </div>
            <div className="text-[11px] text-slate-500 font-medium mt-1">
              {lowStockItems.length > 0
                ? lang === 'hi'
                  ? 'पुनः ऑर्डर करने योग्य'
                  : 'Needs reordering'
                : lang === 'hi'
                ? 'सभी सामग्री पर्याप्त'
                : 'All ingredients safe'}
            </div>
          </div>

          {/* Metric 4: Staff On Duty */}
          <div
            onClick={() => onNavigateTab('staff')}
            className="cursor-pointer bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:border-amber-400 hover:shadow-md transition group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">
                {lang === 'hi' ? 'स्टाफ ड्यूटी पर' : 'Staff On Duty'}
              </span>
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-black text-slate-900 font-mono">
              {todayPresentStaff.length} <span className="text-xs font-normal text-slate-500">/ {staff.length}</span>
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-1">
              {lang === 'hi' ? 'बायोमेट्रिक से दर्ज' : 'Biometric logged'}
            </div>
          </div>

          {/* Metric 5: Permanent Patrons */}
          <div
            onClick={() => onNavigateTab('pos')}
            className="cursor-pointer bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:border-amber-400 hover:shadow-md transition group col-span-2 sm:col-span-1"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">
                {lang === 'hi' ? 'स्थायी वीआईपी ग्राहक' : 'VIP Patrons'}
              </span>
              <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-black text-slate-900 font-mono">
              {customers.length}
            </div>
            <div className="text-[11px] text-purple-700 font-semibold mt-1">
              5% Extra Privilege
            </div>
          </div>
        </div>
      </div>

      {/* QUICK OPERATIONS LAUNCHPAD (Primary Navigation Modules) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black tracking-tight text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#174a70]" />
            <span>{lang === 'hi' ? 'कार्यक्षेत्र एवं मुख्य मॉड्यूल (Core Modules)' : 'Operations Launchpad'}</span>
          </h2>
          <span className="text-xs text-slate-500">
            {lang === 'hi' ? 'सीधे किसी भी मॉड्यूल में जाएं' : 'Single-click access'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Launchpad Card 1: POS Billing */}
          <div
            onClick={() => onNavigateTab('pos')}
            className="cursor-pointer bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:border-amber-400 hover:shadow-md transition group relative overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
                  {lang === 'hi' ? 'अति आवश्यक' : 'Primary POS'}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-600 transition-colors flex items-center gap-1.5">
                <span>{lang === 'hi' ? 'पीओएस बिलिंग व काउंटर' : 'POS Billing & Checkout'}</span>
                <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-amber-500" />
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                {lang === 'hi'
                  ? 'त्वरित टच स्क्रीन ऑर्डरिंग, 5% स्थायी ग्राहक छूट, टेबल मैपिंग, जीएसटी बिलिंग और थर्मल प्रिंट पर्ची।'
                  : 'Fast touch ordering, automated 5% VIP patron discount, table mapping, GST computation and thermal receipt slips.'}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-amber-600 font-bold">
              <span>{lang === 'hi' ? 'टर्मिनल खोलें' : 'Open POS Terminal'}</span>
              <span>→</span>
            </div>
          </div>

          {/* Launchpad Card 2: Tables & Floor Spaces */}
          <div
            onClick={() => onNavigateTab('spaces')}
            className="cursor-pointer bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:border-blue-400 hover:shadow-md transition group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <LayoutGrid className="w-5 h-5" />
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">
                  {availableSpaces.length} {lang === 'hi' ? 'रिक्त' : 'Free'}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                <span>{lang === 'hi' ? 'टेबल व प्राइवेट डाइनिंग रूम' : 'Floor Plan & Spaces'}</span>
                <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-blue-500" />
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                {lang === 'hi'
                  ? 'लाइव टेबल स्थिति (खाली, व्यस्त, बिल किया गया), क्षमता, और सीधे टेबल से बिलिंग शुरू करने की सुविधा।'
                  : 'Live visual dining space occupancy, table reservation tracking, and single-click table-to-bill allocation.'}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-blue-600 font-bold">
              <span>{lang === 'hi' ? 'फ्लोर प्लान देखें' : 'Manage Floor Plan'}</span>
              <span>→</span>
            </div>
          </div>

          {/* Launchpad Card 3: Inventory & BOM */}
          <div
            onClick={() => onNavigateTab('inventory')}
            className="cursor-pointer bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:border-emerald-400 hover:shadow-md transition group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <Boxes className="w-5 h-5" />
                </div>
                {lowStockItems.length > 0 ? (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {lowStockItems.length} {lang === 'hi' ? 'कम स्टॉक' : 'Low'}
                  </span>
                ) : (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                    {ingredients.length} {lang === 'hi' ? 'आइटम्स' : 'Items'}
                  </span>
                )}
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-600 transition-colors flex items-center gap-1.5">
                <span>{lang === 'hi' ? 'कच्चा माल व इन्वेंटरी' : 'Inventory & Raw Stock'}</span>
                <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-emerald-500" />
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                {lang === 'hi'
                  ? 'रेसिपी बीओएम से सामग्री की स्वचालित कटौती, रीऑर्डर अलर्ट, और स्टॉक जोड़ने का प्रबंधन।'
                  : 'Real-time BOM-linked stock depletion per dish sold, reorder threshold alerts, and procurement logs.'}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-emerald-600 font-bold">
              <span>{lang === 'hi' ? 'इन्वेंटरी जांचें' : 'View Stock Records'}</span>
              <span>→</span>
            </div>
          </div>

          {/* Launchpad Card 4: Staff & Attendance */}
          <div
            onClick={() => onNavigateTab('staff')}
            className="cursor-pointer bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:border-purple-400 hover:shadow-md transition group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold">
                  {lang === 'hi' ? 'चेहरा पहचान' : 'Face Biometrics'}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-purple-600 transition-colors flex items-center gap-1.5">
                <span>{lang === 'hi' ? 'स्टाफ एवं बायोमेट्रिक हाजिरी' : 'Staff & Biometric Attendance'}</span>
                <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-purple-500" />
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                {lang === 'hi'
                  ? 'शेफ, वेटर और प्रबंधकों का विवरण, दैनिक हाजिरी रजिस्टर, एवं कैमरा-आधारित चेहरा पहचान पंच।'
                  : 'Staff directory with salary rosters, daily attendance records, and AI face recognition punch-in.'}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-purple-600 font-bold">
              <span>{lang === 'hi' ? 'स्टाफ रजिस्टर देखें' : 'View Staff Roster'}</span>
              <span>→</span>
            </div>
          </div>

          {/* Launchpad Card 5: Invoices History */}
          <div
            onClick={() => onNavigateTab('invoices')}
            className="cursor-pointer bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:border-indigo-400 hover:shadow-md transition group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-bold">
                  {invoices.length} {lang === 'hi' ? 'बिल्स' : 'Records'}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                <span>{lang === 'hi' ? 'बिल इतिहास व ऑडिट रजिस्टर' : 'Invoice History & Auditing'}</span>
                <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-indigo-500" />
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                {lang === 'hi'
                  ? 'सभी पुराने ऑर्डर्स, भुगतान माध्यम (कैश/यूपीआई/कार्ड), जीएसटी रिपोर्ट और पुनः पर्ची प्रिंट।'
                  : 'Historical sales register, payment method breakdowns, GST audit reports, and thermal slip reprints.'}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-indigo-600 font-bold">
              <span>{lang === 'hi' ? 'बिलिंग इतिहास खोलें' : 'Browse Invoices'}</span>
              <span>→</span>
            </div>
          </div>

          {/* Launchpad Card 6: Rule Book & SOP */}
          <div
            onClick={() => onNavigateTab('rules')}
            className="cursor-pointer bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:border-amber-400 hover:shadow-md transition group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
                  <BookMarked className="w-5 h-5" />
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold">
                  {rules.length} {lang === 'hi' ? 'नियम' : 'Rules'}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-700 transition-colors flex items-center gap-1.5">
                <span>{lang === 'hi' ? 'रेस्टोरेंट नियमावली (SOP)' : 'Rule Book & Restaurant SOP'}</span>
                <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-amber-500" />
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                {lang === 'hi'
                  ? 'नियम 17 (स्थायी ग्राहक छूट), रसोई स्वच्छता मानक, भोजन अपव्यय नियंत्रण व स्टाफ आचरण संहिता।'
                  : 'Official restaurant guidelines, hygiene SOPs, Rule 17 (Permanent Customer 5% Off), and kitchen standards.'}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-amber-700 font-bold">
              <span>{lang === 'hi' ? 'नियमावली पढ़ें' : 'Read Rules'}</span>
              <span>→</span>
            </div>
          </div>
        </div>
      </div>

      {/* DUAL SECTION: Live Table Preview & Signature Dishes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT: Live Floor Spaces Quick Strip (7 cols on lg) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-blue-600" />
                <span>{lang === 'hi' ? 'लाइव टेबल स्थिति (Quick Table Allocator)' : 'Live Dining Spaces Snapshot'}</span>
              </h3>
              <p className="text-xs text-slate-500">
                {lang === 'hi'
                  ? 'किसी भी खाली टेबल पर क्लिक करके तुरंत ऑर्डर बिलिंग प्रारंभ करें।'
                  : 'Click any available table to immediately assign space & start POS order.'}
              </p>
            </div>

            <button
              onClick={() => onNavigateTab('spaces')}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition"
            >
              <span>{lang === 'hi' ? 'पूरा फ्लोर प्लान' : 'Full Floor'}</span>
              <span>→</span>
            </button>
          </div>

          {/* Quick Space Badges Mini Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
            {spaces.slice(0, 12).map((space) => {
              const isFree = space.current_status === 'Available';
              const isOccupied = space.current_status === 'Occupied';
              const isBilled = space.current_status === 'Billed';

              return (
                <button
                  key={space.space_id}
                  onClick={() => {
                    onSelectSpaceForBilling(space.space_label);
                  }}
                  className={`p-2.5 rounded-xl border text-left transition relative group flex flex-col justify-between ${
                    isFree
                      ? 'bg-emerald-50/70 border-emerald-200 hover:bg-emerald-100/80 hover:border-emerald-400'
                      : isOccupied
                      ? 'bg-amber-50/70 border-amber-200 hover:bg-amber-100/80 hover:border-amber-400'
                      : isBilled
                      ? 'bg-blue-50/70 border-blue-200 hover:bg-blue-100/80 hover:border-blue-400'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                  title={`${space.space_label} (${space.current_status}) - Click to open in POS`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900">
                      {space.space_label}
                    </span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isFree
                          ? 'bg-emerald-500'
                          : isOccupied
                          ? 'bg-amber-500 animate-pulse'
                          : isBilled
                          ? 'bg-blue-500'
                          : 'bg-slate-400'
                      }`}
                    />
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium mt-1">
                    {space.seating_capacity} pax
                  </div>
                  <div
                    className={`text-[9px] font-bold mt-1 uppercase tracking-wider ${
                      isFree
                        ? 'text-emerald-700'
                        : isOccupied
                        ? 'text-amber-700'
                        : isBilled
                        ? 'text-blue-700'
                        : 'text-slate-500'
                    }`}
                  >
                    {isFree ? 'Free' : isOccupied ? 'Busy' : space.current_status}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 flex-wrap gap-2">
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>{lang === 'hi' ? 'खाली (उपलब्ध)' : 'Available'}</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>{lang === 'hi' ? 'डाइनिंग जारी' : 'Occupied'}</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span>{lang === 'hi' ? 'बिलिंग' : 'Billed'}</span>
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              {spaces.length} {lang === 'hi' ? 'कुल टेबल व निजी कक्ष' : 'total spaces configured'}
            </span>
          </div>
        </div>

        {/* RIGHT: Chef's Signature Menu Highlights (5 cols on lg) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-amber-500" />
                <span>{lang === 'hi' ? 'रसोई की प्रमुख डिशेज' : "Chef's Signature Dishes"}</span>
              </h3>
              <p className="text-xs text-slate-500">
                {lang === 'hi' ? 'लोकप्रिय एवं सर्वाधिक मांग वाले व्यंजन' : 'Top demanding culinary favorites'}
              </p>
            </div>

            <button
              onClick={() => onNavigateTab('menu')}
              className="text-xs font-bold text-amber-600 hover:text-amber-800 flex items-center gap-1 transition"
            >
              <span>{lang === 'hi' ? 'पूरा मेन्यू' : 'Menu'}</span>
              <span>→</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {featuredDishes.map((item) => (
              <div
                key={item.dish_id}
                onClick={() => onNavigateTab('pos')}
                className="cursor-pointer p-3 rounded-xl border border-slate-100 hover:border-amber-300 hover:bg-amber-50/30 transition flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-100/70 text-amber-700 flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                    <Utensils className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                      {item.dish_name}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {item.category} • {item.is_veg ? '🟢 Pure Veg' : '🔴 Non-Veg'}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-sm font-black text-slate-900 font-mono">
                    ₹{item.price}
                  </div>
                  <div className="text-[10px] text-emerald-600 font-semibold">
                    {lang === 'hi' ? 'ऑर्डर करें' : 'Order →'}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <button
              onClick={() => onNavigateTab('pos')}
              className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>{lang === 'hi' ? 'पीओएस में सभी मेन्यू आइटम देखें' : 'View Full Catalog in POS'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* FEATURED RESTAURANT SOP / RULE 17 HIGHLIGHT */}
      {featuredRule && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-white p-5 rounded-2xl border border-amber-300/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3 max-w-3xl">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-sm shrink-0 shadow-md">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-900 uppercase">
                  {featuredRule.rule_category}
                </span>
                <span className="text-xs text-amber-700 font-semibold">Rule #{featuredRule.rule_id}</span>
              </div>
              <h4 className="text-sm font-black text-slate-900 mt-1">
                {featuredRule.topic_header}
              </h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {featuredRule.rule_description_text}
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('rules')}
            className="shrink-0 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow transition flex items-center gap-1.5"
          >
            <BookMarked className="w-3.5 h-3.5" />
            <span>{lang === 'hi' ? 'संपूर्ण नियमावली' : 'View Rule Book'}</span>
          </button>
        </div>
      )}

      {/* STAFF FAMILY CULTURE SHOWCASE BANNER */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div
            onClick={() => {
              setLightboxImage(ramTaraBg);
              setLightboxTitle(
                lang === 'hi'
                  ? 'राम तारा - हमारा स्टाफ परिवार'
                  : 'Ram Tara Restaurant • Staff Family'
              );
            }}
            className="cursor-pointer relative rounded-xl overflow-hidden w-28 h-20 shrink-0 border border-slate-300 shadow group"
            title="Click to expand"
          >
            <img
              src={ramTaraBg}
              alt="Staff Family"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
            <div className="absolute inset-0 bg-slate-950/30 group-hover:bg-slate-950/10 flex items-center justify-center transition-colors">
              <Eye className="w-4 h-4 text-white drop-shadow" />
            </div>
          </div>

          <div>
            <div className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 mb-1">
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              <span>{lang === 'hi' ? 'राम तारा परिवार और संस्कृति' : 'Our Hospitality & Culinary Culture'}</span>
            </div>
            <h4 className="text-base font-bold text-slate-900">
              {lang === 'hi' ? 'समर्पित रसोई शेफ व सर्विस टीम' : 'Dedicated Culinary Brigade & Service Captains'}
            </h4>
            <p className="text-xs text-slate-500 mt-0.5 max-w-xl leading-relaxed">
              {lang === 'hi'
                ? 'गुणवत्तापूर्ण भोजन, समय पर सेवा और स्वच्छ वातावरण प्रदान करने के लिए हमारा पूरा स्टाफ परिवार एक साथ काम करता है।'
                : 'United with a shared passion for authentic taste, hospitality warmth, and disciplined food safety protocols.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0 justify-end">
          <button
            onClick={() => {
              setLightboxImage(ramTaraBg);
              setLightboxTitle(
                lang === 'hi'
                  ? 'राम तारा - हमारा स्टाफ परिवार'
                  : 'Ram Tara Restaurant • Staff Family'
              );
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5 text-amber-600" />
            <span>{lang === 'hi' ? 'फोटो देखें' : 'View Portrait'}</span>
          </button>
          <button
            onClick={() => onNavigateTab('staff')}
            className="px-4 py-2 rounded-xl bg-[#174a70] hover:bg-[#123956] text-white text-xs font-bold shadow transition flex items-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span>{lang === 'hi' ? 'स्टाफ रोस्टर प्रबंधित करें' : 'Manage Staff'}</span>
          </button>
        </div>
      </div>

      {/* LIGHTBOX MODAL */}
      {lightboxImage && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>{lightboxTitle}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black">
                      AI Generated
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    {lang === 'hi'
                      ? 'राम तारा रेस्टोरेंट टीम'
                      : 'Culinary brigade and hospitality service family'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setLightboxImage(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Image */}
            <div className="relative bg-slate-950 flex items-center justify-center overflow-hidden max-h-[70vh]">
              <img
                src={lightboxImage}
                alt="Portrait"
                referrerPolicy="no-referrer"
                className="w-full h-auto max-h-[70vh] object-contain"
              />
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">
                {lang === 'hi' ? 'राम तारा रेस्टोरेंट प्रबंधन प्रणाली' : 'Ram Tara Restaurant Management Suite'}
              </span>
              <button
                type="button"
                onClick={() => setLightboxImage(null)}
                className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition"
              >
                {lang === 'hi' ? 'बंद करें' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
