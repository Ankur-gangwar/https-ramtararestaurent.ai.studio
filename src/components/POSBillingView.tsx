import React, { useState, useMemo } from 'react';
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  User as UserIcon,
  Phone,
  CreditCard,
  QrCode,
  Banknote,
  RotateCcw,
  Sparkles,
  Utensils,
  Layers,
  ChefHat,
  XCircle,
  MapPin,
  Star,
  Award,
  UserPlus,
  Eye,
  Maximize2,
  X,
  ChevronDown,
  ChevronUp,
  Users,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import posStaffTeamBg from '../assets/images/pos_staff_team_bg_1788891670528.jpg';
import {
  MenuItem,
  CartItem,
  Ingredient,
  RecipeBOM,
  BillingStatement,
  User,
  FlashAlert,
  RestaurantSpace,
  SystemSettings,
  PermanentCustomer, StaffMember,
} from '../types';
import {
  calculateBill,
  checkOrderStock,
  deductStock,
  calculatePortionYield,
  generateV2OrderNumber,
} from '../services/storage';
import { PermanentCustomerModal } from './PermanentCustomerModal';

interface POSBillingViewProps {
  menuItems: MenuItem[];
  ingredients: Ingredient[];
  recipeBOMs: RecipeBOM[];
  spaces: RestaurantSpace[];
  staff: StaffMember[];
  settings: SystemSettings;
  customers: PermanentCustomer[];
  onSaveCustomer: (customer: PermanentCustomer) => void;
  selectedInitialSpace?: string;
  currentUser: User;
  onOrderCompleted: (
    newInvoice: BillingStatement,
    updatedIngredients: Ingredient[],
    alerts: FlashAlert[]
  ) => void;
  lang: 'en' | 'hi';
}

export const POSBillingView: React.FC<POSBillingViewProps> = ({
  menuItems,
  ingredients,
  recipeBOMs,
  spaces,
  staff,
  settings,
  customers,
  onSaveCustomer,
  selectedInitialSpace,
  currentUser,
  onOrderCompleted,
  lang,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [cart, setCart] = useState<CartItem[]>([]);

  // Order & Customer Details
  const [customerName, setCustomerName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [isPermanentCustomer, setIsPermanentCustomer] = useState(false);
  const [matchedCustomer, setMatchedCustomer] = useState<PermanentCustomer | null>(null);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

  const [orderType, setOrderType] = useState<'Dine-In' | 'Takeaway' | 'Delivery'>('Dine-In');
  const [assignedWaiter, setAssignedWaiter] = useState<string>('');
  const [assignedSpace, setAssignedSpace] = useState<string>(
    selectedInitialSpace || spaces[0]?.space_label || 'Table 1'
  );
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI' | 'Card'>('Cash');
  const [amountPaidInput, setAmountPaidInput] = useState<string>('');
  const [stockError, setStockError] = useState<string | null>(null);

  // Generate unique invoice number sequence using V2 format
  const [invoiceNumber, setInvoiceNumber] = useState(() => generateV2OrderNumber(settings));
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [isBannerCollapsed, setIsBannerCollapsed] = useState(false);

  const categories = [
    'All',
    'South Indian',
    'Meals & Biryani',
    'North Indian',
    'Snacks & Starters',
    'Beverages',
    'Desserts',
  ];

  // Auto look-up permanent customer on phone entry
  const handleMobileChange = (val: string) => {
    setMobileNumber(val);
    const digits = val.replace(/\D/g, '');
    if (digits.length >= 6) {
      const match = customers.find((c) => c.mobile.replace(/\D/g, '').includes(digits));
      if (match) {
        setMatchedCustomer(match);
        setIsPermanentCustomer(true);
        if (!customerName) setCustomerName(match.name);
        return;
      }
    }
    if (matchedCustomer && !customers.some((c) => c.customer_id === matchedCustomer.customer_id && c.mobile.includes(val))) {
      setMatchedCustomer(null);
    }
  };

  // Auto look-up permanent customer on name entry
  const handleNameChange = (val: string) => {
    setCustomerName(val);
    if (val.trim().length >= 3) {
      const match = customers.find((c) => c.name.toLowerCase() === val.trim().toLowerCase());
      if (match) {
        setMatchedCustomer(match);
        setIsPermanentCustomer(true);
        if (!mobileNumber && match.mobile) setMobileNumber(match.mobile);
      }
    }
  };

  // Select a permanent customer from modal
  const handleSelectPermanentCustomer = (cust: PermanentCustomer) => {
    setCustomerName(cust.name);
    setMobileNumber(cust.mobile);
    setIsPermanentCustomer(true);
    setMatchedCustomer(cust);
  };

  // Filtered menu list
  const filteredMenuItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesSearch = item.dish_name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [menuItems, selectedCategory, searchQuery]);

  // Cart financial calculations using custom rates from system settings & permanent customer status
  const billCalc = useMemo(
    () => calculateBill(cart, settings.default_gst, settings.default_service_charge, isPermanentCustomer),
    [cart, settings.default_gst, settings.default_service_charge, isPermanentCustomer]
  );

  // Auto-calculated change
  const parsedPaid = parseFloat(amountPaidInput) || 0;
  const changeAmount = Math.max(0, Math.round((parsedPaid - billCalc.grand_total) * 100) / 100);
  const isShortPaid = paymentMethod === 'Cash' && parsedPaid > 0 && parsedPaid < billCalc.grand_total;

  // Cart operations
  const addToCart = (dish: MenuItem) => {
    setStockError(null);
    setCart((prev) => {
      const existing = prev.find((item) => item.dish.dish_id === dish.dish_id);
      if (existing) {
        return prev.map((item) =>
          item.dish.dish_id === dish.dish_id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { dish, quantity: 1 }];
    });
  };

  const updateQuantity = (dishId: number, delta: number) => {
    setStockError(null);
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.dish.dish_id === dishId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (dishId: number) => {
    setCart((prev) => prev.filter((item) => item.dish.dish_id !== dishId));
  };

  const clearCart = () => {
    setCart([]);
    setAmountPaidInput('');
    setStockError(null);
  };

  // Quick cash tender helper
  const handleQuickTender = (val: number | 'exact') => {
    if (val === 'exact') {
      setAmountPaidInput(billCalc.grand_total.toString());
    } else {
      setAmountPaidInput(val.toString());
    }
  };

  // Submit Order & Execute Recipe BOM stock deduction
  const handleCheckout = () => {
    if (cart.length === 0) return;

    // 1. Stock Check via BOM
    const stockCheck = checkOrderStock(cart, recipeBOMs, ingredients);

    if (!stockCheck.canFulfill) {
      const firstDeficit = stockCheck.deficits[0];
      const errorMsg =
        lang === 'hi'
          ? `❌ स्टॉक कम है! ${firstDeficit.ingredient_name} की जरूरत: ${firstDeficit.needed} ${firstDeficit.unit}, स्टॉक में सिर्फ ${firstDeficit.current_stock} ${firstDeficit.unit} है (${firstDeficit.dish_name} के लिए)।`
          : `❌ Insufficient Stock! ${firstDeficit.ingredient_name} needed: ${firstDeficit.needed} ${firstDeficit.unit}, but only ${firstDeficit.current_stock} ${firstDeficit.unit} in stock for ${firstDeficit.dish_name}.`;
      setStockError(errorMsg);
      return;
    }

    // 2. Sufficient Stock -> Deduct from Inventory
    const { updatedIngredients, lowStockAlerts } = deductStock(cart, recipeBOMs, ingredients);

    // Create Invoice Statement
    const finalPaid = paymentMethod === 'Cash' ? (parsedPaid || billCalc.grand_total) : billCalc.grand_total;
    const finalChange = paymentMethod === 'Cash' ? Math.max(0, finalPaid - billCalc.grand_total) : 0;

    const newInvoice: BillingStatement = {
      id: Date.now(),
      invoice_number: invoiceNumber,
      customer_name: customerName.trim() || (isPermanentCustomer ? 'VIP Permanent Customer' : 'Walk-in Guest'),
      mobile_number: mobileNumber.trim(),
      order_type: orderType,
      table_number: orderType === 'Dine-In' ? assignedSpace : undefined,
      waiter_name: orderType === 'Dine-In' ? assignedWaiter : undefined,
      bill_date: new Date().toISOString().replace('T', ' ').substring(0, 19),
      subtotal: billCalc.subtotal,
      discount: billCalc.total_discount,
      service_charge: billCalc.service_charge,
      goods_and_services_tax: billCalc.goods_and_services_tax,
      grand_total: billCalc.grand_total,
      payment_method: paymentMethod,
      amount_paid: finalPaid,
      change_amount: finalChange,
      cashier: currentUser.username,
      is_permanent_customer: isPermanentCustomer,
      permanent_customer_discount: billCalc.permanent_discount,
      items: cart.map((c) => ({
        invoice_number: invoiceNumber,
        item_name: c.dish.dish_name,
        quantity: c.quantity,
        price: c.dish.price,
        amount: Math.round(c.dish.price * c.quantity * 100) / 100,
      })),
    };

    // Prepare notifications matching Flask alerts
    const alertsToFire: FlashAlert[] = [
      {
        id: `succ-${Date.now()}`,
        type: 'success',
        message: `Order #${invoiceNumber} placed successfully! Inventory updated.`,
        messageHi: `🎉 आर्डर #${invoiceNumber} सफल रहा! इन्वेंटरी अपडेट हो गई है।`,
        timestamp: Date.now(),
      },
    ];

    if (isPermanentCustomer && billCalc.permanent_discount > 0) {
      alertsToFire.push({
        id: `vip-${Date.now()}`,
        type: 'info',
        message: `⭐ Permanent Customer 5% Extra Discount (-₹${billCalc.permanent_discount.toFixed(2)}) applied!`,
        messageHi: `⭐ स्थायी ग्राहक को 5% अतिरिक्त छूट (-₹${billCalc.permanent_discount.toFixed(2)}) लागू की गई!`,
        timestamp: Date.now() + 5,
      });
    }

    if (lowStockAlerts.length > 0) {
      const names = lowStockAlerts.map((l) => `${l.name} (${l.remaining} ${l.unit})`).join(', ');
      alertsToFire.push({
        id: `warn-${Date.now()}`,
        type: 'warning',
        message: `Warning! Low stock alert for: ${names}`,
        messageHi: `⚠️ चेतावनी! इन सामग्रियों का स्टॉक बहुत कम है: ${names}`,
        timestamp: Date.now() + 10,
      });
    }

    // Trigger celebration
    try {
      confetti({ particleCount: 60, spread: 50, origin: { y: 0.7 } });
    } catch {}

    // Complete transaction
    onOrderCompleted(newInvoice, updatedIngredients, alertsToFire);
    clearCart();
    setCustomerName('');
    setMobileNumber('');
    setIsPermanentCustomer(false);
    setMatchedCustomer(null);
    // Refresh with fresh sequence order number
    setInvoiceNumber(generateV2OrderNumber(settings));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* LEFT: Menu Selection Catalog (7 cols on lg) */}
      <div className="lg:col-span-7 space-y-4">
        {/* Professional High-Energy Staff Team Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800 text-white shadow-md">
          {/* Background Image with Dark Gradient & Vignette Overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src={posStaffTeamBg}
              alt="High-Energy Restaurant Staff Team"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center filter brightness-[0.42] contrast-110"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-900/85 to-[#174a70]/70" />
          </div>

          {/* Banner Body */}
          <div className="relative z-10 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1 max-w-md">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-[11px] font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{lang === 'hi' ? 'राम तारा सर्विस ब्रिगेड' : 'Ram Tara High-Energy Service Brigade'}</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-2 drop-shadow-sm">
                <ChefHat className="w-5 h-5 text-amber-400" />
                <span>{lang === 'hi' ? 'लाइव पीओएस ऑर्डर काउंटर' : 'Active POS Order & Kitchen Terminal'}</span>
              </h2>
              {!isBannerCollapsed && (
                <p className="text-xs text-slate-300 line-clamp-1 drop-shadow-sm">
                  {lang === 'hi'
                    ? 'कुशल शेफ एवं एक्टिव फ्लोर स्टाफ के साथ त्वरित व सटीक बिलिंग।'
                    : 'High-speed billing synchronized with culinary brigade & raw stock BOMs.'}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <button
                type="button"
                id="btn-view-pos-team-pic"
                onClick={() => setShowTeamModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/90 text-white text-xs font-semibold border border-white/20 backdrop-blur-sm transition"
                title="View Team Portrait in High Resolution"
              >
                <Eye className="w-3.5 h-3.5 text-amber-400" />
                <span>{lang === 'hi' ? 'टीम फोटो' : 'Staff Team'}</span>
                <Maximize2 className="w-3 h-3 text-slate-400" />
              </button>

              <button
                type="button"
                id="btn-collapse-pos-banner"
                onClick={() => setIsBannerCollapsed(!isBannerCollapsed)}
                className="p-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-slate-300 border border-white/10 transition"
                title={isBannerCollapsed ? 'Expand banner' : 'Minimize banner'}
              >
                {isBannerCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Quick Context Strip */}
          <div className="relative z-10 px-4 py-2 bg-slate-950/60 border-t border-white/10 flex items-center justify-between gap-2 flex-wrap text-[11px] text-slate-300">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-amber-300 font-semibold">
                <MapPin className="w-3 h-3 text-amber-400" />
                <span>{assignedSpace}</span>
              </span>
              <span className="text-slate-500">•</span>
              <span className="flex items-center gap-1 font-medium">
                <UserIcon className="w-3 h-3 text-slate-400" />
                <span>{currentUser.name} ({currentUser.role})</span>
              </span>
            </div>
            <div className="font-mono text-slate-400 text-[10px]">
              INV: <span className="text-white font-bold">{invoiceNumber}</span>
            </div>
          </div>
        </div>

        {/* Controls: Search & Category Pills */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80 space-y-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="menu-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'hi' ? 'डिश या सामग्री खोजें (उदा: Dosa, Biryani, Tea)...' : 'Search menu items (e.g. Masala Dosa, Biryani, Tea)...'}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white text-slate-900 transition"
            />
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-[#174a70] text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {filteredMenuItems.map((dish) => {
            const inCart = cart.find((item) => item.dish.dish_id === dish.dish_id);
            const portionYield = calculatePortionYield(dish.dish_name, recipeBOMs, ingredients);
            const isOutOfStock = portionYield.maxPortions === 0;

            return (
              <div
                key={dish.dish_id}
                className={`bg-white rounded-2xl p-3.5 border transition-all flex flex-col justify-between relative group ${
                  isOutOfStock
                    ? 'border-rose-200 bg-rose-50/20 opacity-80'
                    : inCart
                    ? 'border-amber-500 shadow-md ring-1 ring-amber-500'
                    : 'border-slate-200/80 hover:border-amber-400 hover:shadow-sm'
                }`}
              >
                <div>
                  {/* Top Veg Indicator & Category */}
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-2.5 h-2.5 rounded-full border-2 ${
                          dish.is_veg
                            ? 'border-emerald-600 bg-emerald-500'
                            : 'border-rose-600 bg-rose-500'
                        }`}
                        title={dish.is_veg ? 'Vegetarian' : 'Non-Vegetarian'}
                      />
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-600">
                        {dish.category.split(' ')[0]}
                      </span>
                    </div>

                    {/* BOM Recipe / Yield badge */}
                    {portionYield.maxPortions < 999 && (
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-medium ${
                          isOutOfStock
                            ? 'bg-rose-100 text-rose-800'
                            : portionYield.maxPortions <= 5
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-emerald-50 text-emerald-800'
                        }`}
                        title={
                          portionYield.limitingIngredient
                            ? `Limited by ${portionYield.limitingIngredient}`
                            : 'Raw stock available'
                        }
                      >
                        {isOutOfStock
                          ? 'Out of Stock'
                          : `Left: ~${portionYield.maxPortions}`}
                      </span>
                    )}
                  </div>

                  {/* Dish Title */}
                  <h3 className="text-sm font-bold text-slate-900 line-clamp-1 leading-snug">
                    {dish.dish_name}
                  </h3>

                  {/* Price */}
                  <div className="mt-1 text-base font-extrabold text-[#174a70]">
                    ₹{dish.price.toFixed(2)}
                  </div>
                </div>

                {/* Add / Stepper Button */}
                <div className="mt-3">
                  {inCart ? (
                    <div className="flex items-center justify-between bg-amber-50 rounded-xl p-1 border border-amber-300">
                      <button
                        onClick={() => updateQuantity(dish.dish_id, -1)}
                        className="w-7 h-7 rounded-lg bg-white hover:bg-amber-200 text-slate-800 flex items-center justify-center font-bold shadow-xs transition"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-black text-slate-900 px-2 font-mono">
                        {inCart.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(dish.dish_id, 1)}
                        disabled={isOutOfStock}
                        className="w-7 h-7 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-xs transition disabled:opacity-50"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      id={`add-btn-${dish.dish_id}`}
                      onClick={() => addToCart(dish)}
                      disabled={isOutOfStock}
                      className={`w-full py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        isOutOfStock
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : 'bg-slate-100 hover:bg-amber-500 hover:text-slate-950 text-slate-800 group-hover:bg-amber-500 group-hover:text-slate-950'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{lang === 'hi' ? 'जोड़ें' : 'Add'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT: Live Billing Counter & Cart (5 cols on lg) */}
      <div className="lg:col-span-5 bg-white rounded-2xl shadow-lg border border-slate-200/90 overflow-hidden sticky top-20">
        {/* Bill Counter Header */}
        <div className="bg-[#174a70] text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-amber-400" />
              <span className="font-bold text-sm tracking-wide">
                {lang === 'hi' ? 'बिलिंग व ऑर्डर काउंटर' : 'POS Billing Counter'}
              </span>
            </div>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-white/10 text-amber-300 font-semibold">
              {invoiceNumber}
            </span>
          </div>

          {/* Order Type & Table Selection */}
          <div className="grid grid-cols-3 gap-1.5 mt-3 pt-3 border-t border-white/10">
            {(['Dine-In', 'Takeaway', 'Delivery'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setOrderType(type)}
                className={`py-1 text-xs font-semibold rounded-lg transition ${
                  orderType === type
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'bg-white/10 hover:bg-white/20 text-slate-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Table / Customer quick inputs */}
          <div className="grid grid-cols-12 gap-2 mt-3 text-slate-900">
            {orderType === 'Dine-In' && (
              <>
              <div className="col-span-3">
                <select
                  value={assignedSpace}
                  onChange={(e) => setAssignedSpace(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold"
                >
                  {spaces.map((s) => (
                    <option key={s.space_id} value={s.space_label}>
                      {s.space_label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-3">
                <select
                  value={assignedWaiter}
                  onChange={(e) => setAssignedWaiter(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                >
                  <option value="">{lang === 'hi' ? 'वेटर' : 'Waiter'}</option>
                  {staff.filter(s => s.designation === 'Waiter').map((s) => (
                    <option key={s.staff_id} value={s.full_name}>
                      {s.full_name}
                    </option>
                  ))}
                </select>
              </div>
              </>
            )}
            <div className={orderType === 'Dine-In' ? 'col-span-3' : 'col-span-6'}>
              <div className="relative">
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder={lang === 'hi' ? 'ग्राहक नाम' : 'Customer Name'}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                />
              </div>
            </div>
            <div className={orderType === 'Dine-In' ? 'col-span-3' : 'col-span-6'}>
              <div className="relative">
                <input
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => handleMobileChange(e.target.value)}
                  placeholder={lang === 'hi' ? 'मोबाइल' : 'Mobile Number'}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Permanent Customer VIP Toggle & Directory Trigger */}
          <div className="mt-2.5 pt-2 border-t border-slate-700/60 flex items-center justify-between gap-2 flex-wrap text-xs">
            <label className="flex items-center gap-2 cursor-pointer select-none bg-slate-800/80 hover:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-amber-500/40 text-amber-200 transition">
              <input
                type="checkbox"
                id="chk-permanent-customer"
                checked={isPermanentCustomer}
                onChange={(e) => {
                  setIsPermanentCustomer(e.target.checked);
                  if (!e.target.checked) setMatchedCustomer(null);
                }}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 accent-amber-500 cursor-pointer"
              />
              <div className="flex items-center gap-1.5 font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{lang === 'hi' ? 'स्थायी ग्राहक (5% अतिरिक्त छूट)' : 'Permanent Customer (+5% Extra Disc)'}</span>
              </div>
            </label>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsCustomerModalOpen(true)}
                className="px-2 py-1 text-[11px] font-bold rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 transition flex items-center gap-1"
                title="Browse registered permanent customers"
              >
                <Award className="w-3 h-3" />
                <span>VIPs ({customers.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setIsCustomerModalOpen(true)}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 transition"
                title="Register new permanent customer"
              >
                <UserPlus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Recognized Permanent Customer Active Banner */}
          {isPermanentCustomer && (
            <div className="mt-2 px-2.5 py-1.5 bg-amber-950/60 border border-amber-400/40 rounded-lg text-[11px] text-amber-200 flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-semibold truncate">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                <span>
                  {matchedCustomer ? (
                    <>
                      <strong>{matchedCustomer.name}</strong> • {matchedCustomer.total_orders_count} past visits • 5% Extra VIP Discount
                    </>
                  ) : (
                    <span>{customerName || 'Permanent Patron'} • 5% Extra VIP Discount Applied</span>
                  )}
                </span>
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 font-black shrink-0">
                +5% OFF
              </span>
            </div>
          )}
        </div>

        {/* Stock Alert Warning Banner */}
        {stockError && (
          <div className="p-3 bg-rose-50 border-b border-rose-200 text-rose-800 text-xs flex items-start gap-2 animate-shake">
            <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="font-semibold">{stockError}</div>
          </div>
        )}

        {/* Cart Items List */}
        <div className="p-4 max-h-56 overflow-y-auto divide-y divide-slate-100">
          {cart.length === 0 ? (
            <div className="py-8 text-center text-slate-400 space-y-1">
              <Utensils className="w-8 h-8 mx-auto text-slate-300 stroke-[1.5]" />
              <p className="text-xs font-semibold text-slate-600">
                {lang === 'hi' ? 'कार्ट खाली है' : 'Cart is currently empty'}
              </p>
              <p className="text-[11px] text-slate-500">
                {lang === 'hi' ? 'मेन्यू से डिश चुनने के लिए + दबाएं' : 'Click items on the left to add to bill'}
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.dish.dish_id} className="py-2.5 flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">
                    {item.dish.dish_name}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    ₹{item.dish.price.toFixed(2)} × {item.quantity} = ₹{(item.dish.price * item.quantity).toFixed(2)}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => updateQuantity(item.dish.dish_id, -1)}
                    className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-6 text-center text-xs font-bold font-mono">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.dish.dish_id, 1)}
                    className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => removeFromCart(item.dish.dish_id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded"
                    title="Remove"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bill Summary Calculations */}
        <div className="p-4 bg-slate-50/80 border-t border-slate-200 space-y-1.5 text-xs text-slate-700 font-medium">
          <div className="flex justify-between">
            <span>{lang === 'hi' ? 'उपयोग कुल (Subtotal):' : 'Subtotal:'}</span>
            <span className="font-mono">₹{billCalc.subtotal.toFixed(2)}</span>
          </div>

          {billCalc.is_discount_applied && (
            <div className="flex justify-between items-center text-emerald-700">
              <span className="flex items-center gap-1">
                <span>{lang === 'hi' ? 'ऑर्डर छूट (5% on ≥₹500):' : 'Order Discount (5% on ≥₹500):'}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 font-bold">
                  APPLIED
                </span>
              </span>
              <span className="font-mono font-bold">- ₹{billCalc.discount.toFixed(2)}</span>
            </div>
          )}

          {billCalc.is_permanent_applied && (
            <div className="flex justify-between items-center text-amber-900 bg-amber-100/70 px-2 py-1 rounded-lg border border-amber-300">
              <span className="flex items-center gap-1 font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>{lang === 'hi' ? 'स्थायी ग्राहक अतिरिक्त छूट (5%):' : 'Permanent Patron Extra Disc (5%):'}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-300 text-slate-950 font-black">
                  VIP 5%
                </span>
              </span>
              <span className="font-mono font-black text-amber-950">- ₹{billCalc.permanent_discount.toFixed(2)}</span>
            </div>
          )}

          {billCalc.total_discount > 0 && (
            <div className="flex justify-between text-emerald-800 font-bold text-[11px] pt-0.5">
              <span>{lang === 'hi' ? 'कुल छूट बचत:' : 'Total Savings:'}</span>
              <span className="font-mono">- ₹{billCalc.total_discount.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between text-slate-600">
            <span>{lang === 'hi' ? 'सर्विस चार्ज (1%):' : 'Service Charge (1%):'}</span>
            <span className="font-mono">₹{billCalc.service_charge.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-slate-600">
            <span>{lang === 'hi' ? 'जीएसटी (5% GST):' : 'GST (5% Tax):'}</span>
            <span className="font-mono">₹{billCalc.goods_and_services_tax.toFixed(2)}</span>
          </div>

          <div className="pt-2 border-t border-slate-300 flex justify-between items-baseline text-slate-950">
            <span className="text-sm font-black">{lang === 'hi' ? 'कुल देय राशि:' : 'GRAND TOTAL:'}</span>
            <span className="text-xl font-black text-[#174a70] font-mono">
              ₹{billCalc.grand_total.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Payment Methods & Tender Change */}
        <div className="p-4 border-t border-slate-200 bg-white space-y-3">
          {/* Payment Method Selector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              {lang === 'hi' ? 'भुगतान विधि (Payment Method)' : 'Payment Method'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'Cash', label: 'Cash', icon: Banknote },
                { id: 'UPI', label: 'UPI / QR', icon: QrCode },
                { id: 'Card', label: 'Card', icon: CreditCard },
              ].map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      setPaymentMethod(m.id as any);
                      if (m.id !== 'Cash') {
                        setAmountPaidInput(billCalc.grand_total.toString());
                      }
                    }}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                      paymentMethod === m.id
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cash Amount Paid & Change Calculator */}
          {paymentMethod === 'Cash' && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">
                  {lang === 'hi' ? 'प्राप्त नकद (Amount Paid):' : 'Amount Tendered:'}
                </span>
                <div className="relative w-32">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    ₹
                  </span>
                  <input
                    id="amount-paid-input"
                    type="number"
                    step="any"
                    value={amountPaidInput}
                    onChange={(e) => setAmountPaidInput(e.target.value)}
                    placeholder={billCalc.grand_total.toString()}
                    className="w-full pl-6 pr-2 py-1 text-right text-xs font-mono font-bold bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Quick Cash Tender Pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleQuickTender('exact')}
                  className="px-2 py-1 rounded bg-white border border-slate-300 text-[10px] font-bold hover:bg-amber-50 text-slate-700"
                >
                  Exact
                </button>
                {[100, 200, 500, 2000].map((note) => (
                  <button
                    key={note}
                    type="button"
                    onClick={() => handleQuickTender(note)}
                    className="px-2 py-1 rounded bg-white border border-slate-300 text-[10px] font-bold hover:bg-amber-50 text-slate-700"
                  >
                    ₹{note}
                  </button>
                ))}
              </div>

              {/* Change calculation display */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-xs font-bold">
                <span className="text-slate-600">
                  {lang === 'hi' ? 'वापसी राशि (Change Due):' : 'Change Due:'}
                </span>
                <span className={`font-mono text-sm ${isShortPaid ? 'text-rose-600' : 'text-emerald-700'}`}>
                  {isShortPaid
                    ? `Short by ₹${(billCalc.grand_total - parsedPaid).toFixed(2)}`
                    : `₹${changeAmount.toFixed(2)}`}
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons: Clear & Checkout */}
          <div className="grid grid-cols-12 gap-2 pt-1">
            <button
              onClick={clearCart}
              disabled={cart.length === 0}
              className="col-span-3 py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center gap-1 transition disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{lang === 'hi' ? 'खाली करें' : 'Clear'}</span>
            </button>

            <button
              id="btn-complete-order"
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className="col-span-9 py-2.5 px-4 rounded-xl bg-[#174a70] hover:bg-[#123956] text-white font-bold text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Receipt className="w-4 h-4 text-amber-400" />
              <span>
                {lang === 'hi'
                  ? `ऑर्डर पूरा करें • ₹${billCalc.grand_total.toFixed(2)}`
                  : `Complete Order & Print • ₹${billCalc.grand_total.toFixed(2)}`}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Permanent Customer VIP Directory & Registration Modal */}
      <PermanentCustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        customers={customers}
        onSaveCustomer={onSaveCustomer}
        onSelectCustomer={handleSelectPermanentCustomer}
        lang={lang}
        initialMobile={mobileNumber}
        initialName={customerName}
      />

      {/* POS High-Energy Staff Team Portrait Modal */}
      {showTeamModal && (
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
                    <span>{lang === 'hi' ? 'राम तारा - हाई-एनर्जी सर्विस टीम' : 'Ram Tara • High-Energy Culinary & Service Brigade'}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black">
                      AI Studio
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    {lang === 'hi'
                      ? 'रसोई, डाइनिंग व बिलिंग टर्मिनल पर एक साथ काम करती समर्पित टीम'
                      : 'Culinary chefs, service captains & cashier team in high-energy restaurant flow'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowTeamModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body - High Res Image */}
            <div className="relative bg-slate-950 flex items-center justify-center overflow-hidden max-h-[70vh]">
              <img
                src={posStaffTeamBg}
                alt="High-Energy Restaurant Staff Team"
                referrerPolicy="no-referrer"
                className="w-full h-auto max-h-[70vh] object-contain"
              />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-transparent p-4 flex items-center justify-between text-xs text-slate-300">
                <span className="flex items-center gap-1.5 font-medium">
                  <Users className="w-4 h-4 text-amber-400" />
                  <span>{lang === 'hi' ? 'उत्कृष्ट स्वाद और त्वरित सेवा' : 'Culinary passion, rapid billing, and guest hospitality'}</span>
                </span>
                <span className="text-[11px] text-slate-400 font-mono">16:9 HD Display</span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">
                {lang === 'hi' ? 'पीओएस टर्मिनल डैशबोर्ड बैकग्राउंड' : 'Active in POS Dashboard & Order Terminal'}
              </span>
              <button
                type="button"
                onClick={() => setShowTeamModal(false)}
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
