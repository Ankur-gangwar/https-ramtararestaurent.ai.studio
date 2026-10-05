import React, { useState, useEffect } from 'react';
import { ChefHat, 
  Home,
  UtensilsCrossed,
  LayoutDashboard,
  ShoppingCart,
  Boxes,
  AlertTriangle,
  ScrollText,
  FileSpreadsheet,
  BookOpen,
  UserCheck,
  LogOut,
  Languages,
  ShieldCheck,
  RotateCcw,
  LayoutGrid,
  Users,
  BookMarked,
  Settings,
  Star,
} from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  user: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  onSwitchUserClick: () => void;
  lowStockCount: number;
  lang: 'en' | 'hi';
  setLang: (lang: 'en' | 'hi') => void;
  onResetData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  setActiveTab,
  onLogout,
  onSwitchUserClick,
  lowStockCount,
  lang,
  setLang,
  onResetData,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', {
          weekday: 'short',
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, [lang]);

  
  const getTabsForRole = () => {
    const allTabs = [
      { id: 'home', label: lang === 'hi' ? 'होम' : 'Home', icon: Home, roles: ['Admin', 'Manager', 'Cashier', 'Waiter', 'Kitchen', 'Staff'] },
      { id: 'catalog', label: lang === 'hi' ? 'ग्राहक मेन्यू' : 'Customer Menu', icon: UtensilsCrossed, roles: ['Admin', 'Manager', 'Cashier', 'Waiter', 'Kitchen', 'Staff'] },
      { id: 'dashboard', label: lang === 'hi' ? 'डैशबोर्ड' : 'Dashboard', icon: LayoutDashboard, roles: ['Admin', 'Manager'] },
      { id: 'pos', label: lang === 'hi' ? 'बिलिंग POS' : 'Billing & POS', icon: ShoppingCart, roles: ['Admin', 'Manager', 'Cashier', 'Waiter', 'Staff'] },
      { id: 'customers', label: lang === 'hi' ? 'ग्राहक खाते' : 'Customers', icon: Users, roles: ['Admin', 'Manager', 'Staff'] },
      { id: 'kds', label: lang === 'hi' ? 'किचन डिस्प्ले' : 'Kitchen KDS', icon: ChefHat, roles: ['Admin', 'Manager', 'Kitchen'] },
      { id: 'spaces', label: lang === 'hi' ? 'टेबल व कक्ष' : 'Floor Plan', icon: LayoutGrid, roles: ['Admin', 'Manager', 'Waiter', 'Cashier', 'Staff'] },
      {
        id: 'inventory',
        label: lang === 'hi' ? 'इन्वेंटरी' : 'Inventory',
        icon: Boxes,
        badge: lowStockCount > 0 ? lowStockCount : undefined,
        roles: ['Admin', 'Manager', 'Kitchen']
      },
      { id: 'staff', label: lang === 'hi' ? 'स्टाफ व हाजिरी' : 'Staff & Roster', icon: Users, roles: ['Admin', 'Manager', 'Staff'] },
      { id: 'recipes', label: lang === 'hi' ? 'रेसिपी BOM' : 'Recipe BOM', icon: ScrollText, roles: ['Admin', 'Manager', 'Kitchen'] },
      { id: 'spoilage', label: lang === 'hi' ? 'वेस्ट/आउट सामग्री' : 'Waste/Out Stock', icon: AlertTriangle, roles: ['Admin', 'Manager', 'Kitchen'] },
      { id: 'invoices', label: lang === 'hi' ? 'बिल्स' : 'Invoices', icon: FileSpreadsheet, roles: ['Admin', 'Manager', 'Cashier', 'Staff'] },
      { id: 'menu', label: lang === 'hi' ? 'मेन्यू' : 'Menu', icon: BookOpen, roles: ['Admin', 'Manager', 'Staff'] },
      { id: 'rules', label: lang === 'hi' ? 'नियमावली' : 'Rule Book', icon: BookMarked, roles: ['Admin', 'Manager', 'Cashier', 'Waiter', 'Kitchen', 'Staff'] },
      { id: 'settings', label: lang === 'hi' ? 'सेटिंग्स' : 'Settings', icon: Settings, roles: ['Admin', 'Manager'] },
    ];
    return allTabs.filter(tab => tab.roles.includes(user.role));
  };
  const tabs = getTabsForRole();


  return (
    <header className="sticky top-0 z-40 bg-slate-900 text-white shadow-md border-b border-slate-800">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <button
            type="button"
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-3 text-left focus:outline-none group cursor-pointer"
            title="Go to Home"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner group-hover:scale-105 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all">
              <UtensilsCrossed className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-white group-hover:text-amber-400 transition-colors">
                  Ram Tara
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-black border border-amber-500/30">
                  ERP & POS V2.0
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium group-hover:text-slate-300 transition-colors">
                {lang === 'hi' ? 'रेस्टोरेंट प्रबंधन और इन्वेंटरी सिस्टम' : 'Restaurant Management & Inventory System'}
              </p>
            </div>
          </button>

          {/* Clock & Language & Role Info */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Live Clock */}
            <div className="hidden md:flex flex-col text-right pr-3 border-r border-slate-800">
              <span className="text-xs font-mono font-medium text-slate-300">{currentTime}</span>
              <span className="text-[10px] text-emerald-400 font-medium flex items-center justify-end gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                System Online
              </span>
            </div>

            {/* Language Switcher */}
            <button
              id="lang-toggle-btn"
              onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition"
              title="Toggle English / हिंदी"
            >
              <Languages className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'en' ? 'हिंदी' : 'English'}</span>
            </button>

            {/* User Badge */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/80">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                  user.role === 'Admin' ? 'bg-amber-500 text-slate-950' : 'bg-blue-600 text-white'
                }`}>
                  {user.role === 'Admin' ? <ShieldCheck className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                </div>
                <div className="text-left hidden sm:block leading-tight">
                  <div className="text-xs font-semibold text-white capitalize">{user.name || user.username}</div>
                  <div className="text-[10px] text-amber-300/90 font-medium tracking-wide">
                    {user.role} {lang === 'hi' ? (user.role === 'Admin' ? 'प्रबंधक' : 'स्टाफ') : ''}
                  </div>
                </div>
              </div>

              {/* Switch Role / Switch User */}
              <button
                id="switch-user-btn"
                onClick={onSwitchUserClick}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                title={lang === 'hi' ? 'उपयोगकर्ता बदलें' : 'Switch User'}
              >
                <UserCheck className="w-4 h-4" />
              </button>

              {/* Logout */}
              <button
                id="logout-btn"
                onClick={onLogout}
                className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition"
                title={lang === 'hi' ? 'लॉगआउट' : 'Logout'}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <nav className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-none border-t border-slate-800/60">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm shadow-amber-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-rose-600 text-white' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Reset Demo Data button (Admin only) */}
          {user.role === 'Admin' && (
            <button
              onClick={onResetData}
              className="ml-auto flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium text-slate-400 hover:text-amber-300 hover:bg-slate-800/60 rounded-md transition"
              title="Reset to default initial database"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden lg:inline">{lang === 'hi' ? 'डेटा रीसेट' : 'Reset Demo'}</span>
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};
