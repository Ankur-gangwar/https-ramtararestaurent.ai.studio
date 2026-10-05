import { Users, UserPlus } from 'lucide-react';
import { KitchenDisplayView } from './components/KitchenDisplayView';
import { fetchAllDataFromFirestore } from './services/firebaseSync';
import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LoginModal } from './components/LoginModal';
import { HomeView } from './components/HomeView';
import { POSBillingView } from './components/POSBillingView';
import { DashboardView } from './components/DashboardView';
import { CustomerDashboardView } from './components/CustomerDashboardView';
import { InventoryView } from './components/InventoryView';
import { SpoilageView } from './components/SpoilageView';
import { RecipeBOMView } from './components/RecipeBOMView';
import { InvoicesHistoryView } from './components/InvoicesHistoryView';
import { MenuManagerView } from './components/MenuManagerView';
import { TableSpacesView } from './components/TableSpacesView';
import { StaffManagementView } from './components/StaffManagementView';
import { RuleBookView } from './components/RuleBookView';
import { SettingsView } from './components/SettingsView';
import { PermanentCustomerModal } from './components/PermanentCustomerModal';
import { RestaurantProfileView } from './components/RestaurantProfileView';
import { ReceiptModal } from './components/ReceiptModal';
import { AlertsBanner } from './components/AlertsBanner';
import {
  loadStoredData,
  saveIngredients,
  saveMenuItems,
  saveRecipeBOMs,
  saveInvoices,
  saveWastageLogs,
  saveActiveUser,
  saveLanguage,
  saveSettings,
  saveSpaces,
  saveStaff,
  saveAttendance,
  saveRules,
  savePermanentCustomers,
  resetAllStorage,
} from './services/storage';
import {
  User,
  Ingredient,
  MenuItem,
  RecipeBOM,
  BillingStatement,
  WastageLog,
  FlashAlert,
  SystemSettings,
  RestaurantSpace,
  StaffMember,
  AttendanceRecord,
  RuleBookEntry,
  SpaceStatus,
  AttendanceStatus,
  PermanentCustomer,
} from './types';

export default function App() {
  const initialData = loadStoredData();

  const [currentUser, setCurrentUser] = useState<User>(initialData.user);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  // Firebase Sync Effect
  useEffect(() => {
    fetchAllDataFromFirestore().then(data => {
      if (data.ingredients && data.ingredients.length > 0) setIngredients(data.ingredients);
      if (data.menuItems && data.menuItems.length > 0) setMenuItems(data.menuItems);
      if (data.recipeBOMs && data.recipeBOMs.length > 0) setRecipeBOMs(data.recipeBOMs);
      if (data.invoices && data.invoices.length > 0) setInvoices(data.invoices);
      if (data.wastageLogs && data.wastageLogs.length > 0) setWastageLogs(data.wastageLogs);
      if (data.settings) setSettings(data.settings);
      if (data.spaces && data.spaces.length > 0) setSpaces(data.spaces);
      if (data.staff && data.staff.length > 0) setStaff(data.staff);
      if (data.attendance && data.attendance.length > 0) setAttendance(data.attendance);
      if (data.rules && data.rules.length > 0) setRules(data.rules);
      if (data.customers && data.customers.length > 0) setCustomers(data.customers);
    });
  }, []);

  const [activeTab, setActiveTab] = useState<string>('home');
  const [lang, setLang] = useState<'en' | 'hi'>(initialData.lang);

  // Core Database Collections
  const [ingredients, setIngredients] = useState<Ingredient[]>(initialData.ingredients);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialData.menuItems);
  const [recipeBOMs, setRecipeBOMs] = useState<RecipeBOM[]>(initialData.recipeBOMs);
  const [invoices, setInvoices] = useState<BillingStatement[]>(initialData.invoices);
  const [wastageLogs, setWastageLogs] = useState<WastageLog[]>(initialData.wastageLogs);

  // V2 Suite Collections
  const [settings, setSettings] = useState<SystemSettings>(initialData.settings);
  const [spaces, setSpaces] = useState<RestaurantSpace[]>(initialData.spaces);
  const [staff, setStaff] = useState<StaffMember[]>(initialData.staff);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(initialData.attendance);
  const [rules, setRules] = useState<RuleBookEntry[]>(initialData.rules);
  const [customers, setCustomers] = useState<PermanentCustomer[]>(initialData.customers);
  const [selectedInitialSpace, setSelectedInitialSpace] = useState<string | undefined>(undefined);

  // Modal / Receipt States
  const [activeReceiptInvoice, setActiveReceiptInvoice] = useState<BillingStatement | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isCustomerModalOpenFromApp, setIsCustomerModalOpenFromApp] = useState(false);

  // Flash Alerts
  const [alerts, setAlerts] = useState<FlashAlert[]>([]);

  // Persistent storage synchronizers
  useEffect(() => {
    saveIngredients(ingredients);
  }, [ingredients]);

  useEffect(() => {
    saveMenuItems(menuItems);
  }, [menuItems]);

  useEffect(() => {
    saveRecipeBOMs(recipeBOMs);
  }, [recipeBOMs]);

  useEffect(() => {
    saveInvoices(invoices);
  }, [invoices]);

  useEffect(() => {
    saveWastageLogs(wastageLogs);
  }, [wastageLogs]);

  useEffect(() => {
    saveActiveUser(currentUser);
  }, [currentUser]);

  useEffect(() => {
    saveLanguage(lang);
  }, [lang]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    saveSpaces(spaces);
  }, [spaces]);

  useEffect(() => {
    saveStaff(staff);
  }, [staff]);

  useEffect(() => {
    saveAttendance(attendance);
  }, [attendance]);

  useEffect(() => {
    saveRules(rules);
  }, [rules]);

  useEffect(() => {
    savePermanentCustomers(customers);
  }, [customers]);

  
  // Auto Logout Logic
  useEffect(() => {
    let idleTimeout;
    const resetIdleTimer = () => {
      clearTimeout(idleTimeout);
      // 15 minutes = 900000 ms
      idleTimeout = setTimeout(() => {
        setIsLoginModalOpen(true);
        // We do not unset currentUser here to allow them to re-login, or we could.
        // Let's force them to the login screen.
      }, 900000);
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(e => document.addEventListener(e, resetIdleTimer));
    resetIdleTimer();

    return () => {
      clearTimeout(idleTimeout);
      events.forEach(e => document.removeEventListener(e, resetIdleTimer));
    };
  }, []);

  // Alert Auto-dismiss timer
  useEffect(() => {
    if (alerts.length === 0) return;
    const timer = setTimeout(() => {
      setAlerts((prev) => prev.slice(1));
    }, 6500);
    return () => clearTimeout(timer);
  }, [alerts]);

  const addAlert = (alert: FlashAlert) => {
    setAlerts((prev) => [...prev, alert]);
  };

  const removeAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  // Login handler
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setIsLoginModalOpen(false);
    setActiveTab('home');
    addAlert({
      id: `login-${Date.now()}`,
      type: 'info',
      message: `Welcome ${user.username}! Signed in as ${user.role}.`,
      messageHi: `स्वागत है ${user.username}! ${user.role} के रूप में सफलतापूर्वक लॉगिन किया गया।`,
      timestamp: Date.now(),
    });
  };

  // Logout handler
  const handleLogout = () => {
    setIsLoginModalOpen(true);
  };

  // Switch User handler
  const handleSwitchUserClick = () => {
    setIsLoginModalOpen(true);
  };

  // Reset entire database to default seeds
  const handleResetData = () => {
    if (
      confirm(
        lang === 'hi'
          ? 'क्या आप संपूर्ण डेटाबेस को डिफ़ॉल्ट स्थिति में रीसेट करना चाहते हैं?'
          : 'Are you sure you want to reset the restaurant database to default demo state?'
      )
    ) {
      resetAllStorage();
      window.location.reload();
    }
  };

  // Order checkout completed
  const handleOrderCompleted = (
    newInvoice: BillingStatement,
    updatedIngredients: Ingredient[],
    newAlerts: FlashAlert[]
  ) => {
    setInvoices((prev) => [newInvoice, ...prev]);
    setIngredients(updatedIngredients);
    setActiveReceiptInvoice(newInvoice);
    setIsReceiptOpen(true);

    // Update space status to 'Billed' if Dine-In
    if (newInvoice.table_number) {
      setSpaces((prev) =>
        prev.map((s) =>
          s.space_label === newInvoice.table_number ? { ...s, current_status: 'Billed' } : s
        )
      );
    }

    // Update Permanent Customer statistics if VIP discount applied
    if (newInvoice.is_permanent_customer) {
      setCustomers((prev) =>
        prev.map((c) => {
          if (
            (newInvoice.mobile_number && c.mobile === newInvoice.mobile_number) ||
            c.name.toLowerCase() === newInvoice.customer_name.toLowerCase()
          ) {
            return {
              ...c,
              total_orders_count: c.total_orders_count + 1,
              total_spent: Math.round((c.total_spent + newInvoice.grand_total) * 100) / 100,
            };
          }
          return c;
        })
      );
    }

    newAlerts.forEach((a) => addAlert(a));
  };

  // Permanent Customer handler
  const handleSaveCustomer = (newCustomer: PermanentCustomer) => {
    setCustomers((prev) => {
      const existingIndex = prev.findIndex((c) => c.customer_id === newCustomer.customer_id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = newCustomer;
        return updated;
      }
      return [newCustomer, ...prev];
    });
    addAlert({
      id: `cust-${Date.now()}`,
      type: 'success',
      message: `Permanent patron ${newCustomer.name} registered with 5% Extra Discount privilege!`,
      messageHi: `स्थायी ग्राहक ${newCustomer.name} (5% अतिरिक्त छूट के साथ) पंजीकृत किया गया!`,
      timestamp: Date.now(),
    });
  };

  // Spaces Management Handlers
  const handleUpdateSpaceStatus = (spaceId: number, status: SpaceStatus) => {
    setSpaces((prev) =>
      prev.map((s) => (s.space_id === spaceId ? { ...s, current_status: status } : s))
    );
  };

  const handleAddSpace = (label: string, capacity: number) => {
    const nextId = spaces.length > 0 ? Math.max(...spaces.map((s) => s.space_id)) + 1 : 1;
    const newSpace: RestaurantSpace = {
      space_id: nextId,
      space_label: label,
      seating_capacity: capacity,
      current_status: 'Available',
    };
    setSpaces((prev) => [...prev, newSpace]);
    addAlert({
      id: `space-${Date.now()}`,
      type: 'success',
      message: `Space "${label}" (${capacity} pax) added to floor plan.`,
      messageHi: `स्थान "${label}" सफलता पूर्वक फ्लोर प्लान में जोड़ा गया।`,
      timestamp: Date.now(),
    });
  };

  const handleDeleteSpace = (spaceId: number) => {
    setSpaces((prev) => prev.filter((s) => s.space_id !== spaceId));
  };

  const handleSelectSpaceForBilling = (spaceLabel: string) => {
    setSelectedInitialSpace(spaceLabel);
    setActiveTab('pos');
  };

  // Staff & Attendance Handlers
  const handleAddStaff = (newStaff: StaffMember) => {
    setStaff((prev) => [...prev, newStaff]);
    addAlert({
      id: `stf-${Date.now()}`,
      type: 'success',
      message: `Staff member ${newStaff.full_name} (${newStaff.designation}) registered successfully!`,
      messageHi: `कर्मचारी ${newStaff.full_name} (${newStaff.designation}) पंजीकृत हो गया।`,
      timestamp: Date.now(),
    });
  };

  const handleUpdateAttendance = (
    staffId: string,
    status: AttendanceStatus,
    method: 'Face Recognition' | 'Fingerprint Biometric' | 'Manual' = 'Manual',
    notes?: string,
    actionType?: 'IN' | 'OUT' | 'MANUAL'
  ) => {
    const todayStr = new Date().toISOString().substring(0, 10);
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setAttendance((prev) => {
      const existing = prev.find((a) => a.staff_id === staffId && a.log_date === todayStr);

      if (existing) {
        return prev.map((a) =>
          a.staff_id === staffId && a.log_date === todayStr
            ? {
                ...a,
                attendance_status: status,
                verification_method: method,
                check_in_time: actionType === 'IN' ? timeStr : a.check_in_time,
                check_out_time: actionType === 'OUT' ? timeStr : a.check_out_time,
                notes: notes || a.notes,
              }
            : a
        );
      } else {
        const nextId = prev.length > 0 ? Math.max(...prev.map((p) => p.record_id || 0)) + 1 : 1;
        return [
          ...prev,
          {
            record_id: nextId,
            attendance_id: `ATT-${Date.now().toString().slice(-4)}`,
            staff_id: staffId,
            log_date: todayStr,
            check_in_time: actionType === 'IN' || !actionType ? timeStr : undefined,
            check_out_time: actionType === 'OUT' ? timeStr : undefined,
            attendance_status: status,
            verification_method: method,
            notes: notes,
          },
        ];
      }
    });
  };

  const handleEnrollFace = (staffId: string, photoDataUrl: string, descriptor?: number[]) => {
    if (staffId === 'OWNER') {
      setSettings((prev) => ({
        ...prev,
        admin_face_enrolled: true,
        admin_face_photo: photoDataUrl,
        admin_face_descriptor: descriptor,
      }));
      addAlert({
        id: `face-owner-${Date.now()}`,
        type: 'success',
        message: `Owner / Admin biometric facial profile updated!`,
        messageHi: `ओनर / एडमिन का बायोमेट्रिक चेहरा सफलतापूर्वक अपडेट हुआ!`,
        timestamp: Date.now(),
      });
      return;
    }

    setStaff((prev) =>
      prev.map((s) =>
        s.staff_id === staffId
          ? { ...s, face_enrolled: true, face_photo: photoDataUrl, face_descriptor: descriptor }
          : s
      )
    );
    addAlert({
      id: `face-${Date.now()}`,
      type: 'success',
      message: `Biometric facial profile enrolled for staff ${staffId}!`,
      messageHi: `कर्मचारी ${staffId} का चेहरा और बायोमेट्रिक फीचर्स सफलतापूर्वक पंजीकृत हुए!`,
      timestamp: Date.now(),
    });
  };

  const handleToggleStaffLogin = (staffId: string) => {
    setStaff((prev) =>
      prev.map((s) => {
        if (s.staff_id === staffId) {
          const nextState = s.login_enabled === false ? true : false;
          addAlert({
            id: `login-toggle-${Date.now()}`,
            type: nextState ? 'success' : 'warning',
            message: `${s.full_name} (${s.designation}) login access ${nextState ? 'ENABLED' : 'REVOKED'}.`,
            messageHi: `${s.full_name} (${s.designation}) का लॉगिन अधिकार ${nextState ? 'सक्रिय (चालू ✓)' : 'निष्क्रिय (बंद ❌)'} कर दिया गया।`,
            timestamp: Date.now(),
          });
          return { ...s, login_enabled: nextState };
        }
        return s;
      })
    );
  };

  const handleUpdateStaffLoginCredentials = (staffId: string, updates: Partial<StaffMember>) => {
    setStaff((prev) =>
      prev.map((s) => (s.staff_id === staffId ? { ...s, ...updates } : s))
    );
    addAlert({
      id: `staff-cred-${Date.now()}`,
      type: 'success',
      message: `Staff credentials and login role updated successfully.`,
      messageHi: `कर्मचारी लॉगिन विवरण व भूमिका सफलतापूर्वक सहेज ली गई।`,
      timestamp: Date.now(),
    });
  };

  const handleEnrollFingerprint = (staffId: string, templateHash: string) => {
    setStaff((prev) =>
      prev.map((s) =>
        s.staff_id === staffId
          ? { ...s, fingerprint_enrolled: true, fingerprint_template: templateHash }
          : s
      )
    );
    addAlert({
      id: `fp-${Date.now()}`,
      type: 'success',
      message: `Biometric fingerprint template registered for staff ${staffId}!`,
      messageHi: `कर्मचारी ${staffId} का फिंगरप्रिंट टेम्पलेट सफलतापूर्वक पंजीकृत हुआ!`,
      timestamp: Date.now(),
    });
  };

  const handleDeleteStaff = (staffId: string) => {
    setStaff((prev) => prev.filter((s) => s.staff_id !== staffId));
  };

  // SOP Rule Book Handlers
  const handleAddRule = (rule: Omit<RuleBookEntry, 'rule_id'>) => {
    const nextId = rules.length > 0 ? Math.max(...rules.map((r) => r.rule_id)) + 1 : 1;
    const newEntry: RuleBookEntry = { ...rule, rule_id: nextId };
    setRules((prev) => [...prev, newEntry]);
    addAlert({
      id: `rule-${Date.now()}`,
      type: 'success',
      message: `Rule "${rule.topic_header}" created in ${rule.rule_category}.`,
      messageHi: `नियम "${rule.topic_header}" सहेज लिया गया।`,
      timestamp: Date.now(),
    });
  };

  const handleDeleteRule = (ruleId: number) => {
    setRules((prev) => prev.filter((r) => r.rule_id !== ruleId));
  };

  // Settings Handlers
  const handleSaveSettings = (newSettings: SystemSettings) => {
    setSettings(newSettings);
    addAlert({
      id: `set-${Date.now()}`,
      type: 'success',
      message: `System settings and tax rates updated.`,
      messageHi: `सिस्टम सेटिंग्स और टैक्स दरें अपडेट कर दी गईं।`,
      timestamp: Date.now(),
    });
  };

  // Add new Ingredient
  const handleAddIngredient = (newIng: Omit<Ingredient, 'item_id'>) => {
    const nextId =
      ingredients.length > 0 ? Math.max(...ingredients.map((i) => i.item_id)) + 1 : 1;
    const created: Ingredient = { ...newIng, item_id: nextId };
    setIngredients((prev) => [...prev, created]);

    addAlert({
      id: `add-ing-${Date.now()}`,
      type: 'success',
      message: `Ingredient "${newIng.name}" added successfully to inventory!`,
      messageHi: `✔️ ${newIng.name} इन्वेंटरी में सफलतापूर्वक जोड़ दिया गया!`,
      timestamp: Date.now(),
    });
  };

  // Restock Existing Ingredient
  const handleUpdateStock = (itemId: number, addedQty: number, notes?: string) => {
    const target = ingredients.find((i) => i.item_id === itemId);
    if (!target) return;

    setIngredients((prev) =>
      prev.map((ing) =>
        ing.item_id === itemId
          ? {
              ...ing,
              current_stock: Math.round((ing.current_stock + addedQty) * 1000) / 1000,
            }
          : ing
      )
    );

    addAlert({
      id: `restock-${Date.now()}`,
      type: 'success',
      message: `Restocked ${addedQty} ${target.unit} of ${target.name}.`,
      messageHi: `✔️ ${target.name} में +${addedQty} ${target.unit} स्टॉक सफलतापूर्वक जोड़ा गया!`,
      timestamp: Date.now(),
    });
  };

  // Delete Ingredient
  const handleDeleteIngredient = (itemId: number) => {
    setIngredients((prev) => prev.filter((i) => i.item_id !== itemId));
  };

  // Edit Min Alert Threshold
  const handleEditThreshold = (itemId: number, newMinAlert: number) => {
    setIngredients((prev) =>
      prev.map((i) => (i.item_id === itemId ? { ...i, min_stock_alert: newMinAlert } : i))
    );
  };

  // Log Spoilage / Wastage
  const handleLogWastage = (
    ingredientName: string,
    quantity: number,
    unit: string,
    reason: WastageLog['reason'],
    notes?: string
  ) => {
    const nextId =
      wastageLogs.length > 0 ? Math.max(...wastageLogs.map((w) => w.id)) + 1 : 1;

    const newLog: WastageLog = {
      id: nextId,
      ingredient_name: ingredientName,
      quantity_wasted: quantity,
      unit,
      reason,
      log_date: new Date().toISOString().replace('T', ' ').substring(0, 19),
      logged_by: currentUser.username,
      notes,
    };

    setWastageLogs((prev) => [newLog, ...prev]);

    // Automatically deduct from current stock
    setIngredients((prev) =>
      prev.map((ing) => {
        if (ing.name.toLowerCase() === ingredientName.toLowerCase()) {
          return {
            ...ing,
            current_stock: Math.max(0, Math.round((ing.current_stock - quantity) * 1000) / 1000),
          };
        }
        return ing;
      })
    );

    addAlert({
      id: `waste-${Date.now()}`,
      type: 'warning',
      message: `Logged ${quantity} ${unit} wastage of ${ingredientName}. Inventory deducted.`,
      messageHi: `⚠️ ${ingredientName} का ${quantity} ${unit} अपव्यय दर्ज किया गया। स्टॉक से कटौती हो गई।`,
      timestamp: Date.now(),
    });
  };

  // Add Recipe BOM Mapping
  const handleAddBOM = (bom: Omit<RecipeBOM, 'recipe_id'>) => {
    const nextId =
      recipeBOMs.length > 0 ? Math.max(...recipeBOMs.map((b) => b.recipe_id)) + 1 : 1;
    const created: RecipeBOM = { ...bom, recipe_id: nextId };
    setRecipeBOMs((prev) => [...prev, created]);

    addAlert({
      id: `bom-${Date.now()}`,
      type: 'success',
      message: `Recipe updated: ${bom.quantity_used} ${bom.unit || 'units'} of ${bom.ingredient_name} attached to ${bom.dish_name}.`,
      messageHi: `✔️ ${bom.dish_name} के लिए ${bom.ingredient_name} सफलतापूर्वक जोड़ा गया!`,
      timestamp: Date.now(),
    });
  };

  // Delete Recipe BOM Mapping
  const handleDeleteBOM = (recipeId: number) => {
    setRecipeBOMs((prev) => prev.filter((b) => b.recipe_id !== recipeId));
  };

  // Add Menu Item
  const handleAddMenuItem = (item: Omit<MenuItem, 'dish_id'>) => {
    const nextId =
      menuItems.length > 0 ? Math.max(...menuItems.map((m) => m.dish_id)) + 1 : 1;
    const created: MenuItem = { ...item, dish_id: nextId };
    setMenuItems((prev) => [...prev, created]);

    addAlert({
      id: `dish-${Date.now()}`,
      type: 'success',
      message: `Added new dish "${item.dish_name}" (₹${item.price.toFixed(2)}) to menu!`,
      messageHi: `✔️ नई डिश "${item.dish_name}" (₹${item.price.toFixed(2)}) मेन्यू में जोड़ी गई!`,
      timestamp: Date.now(),
    });
  };

  // Update Menu Item Price
  const handleUpdatePrice = (dishId: number, newPrice: number) => {
    setMenuItems((prev) =>
      prev.map((m) => (m.dish_id === dishId ? { ...m, price: newPrice } : m))
    );
  };

  // Delete Menu Item
  const handleDeleteMenuItem = (dishId: number) => {
    setMenuItems((prev) => prev.filter((m) => m.dish_id !== dishId));
  };

  // View Past Invoice Slip
  const handleViewInvoice = (inv: BillingStatement) => {
    setActiveReceiptInvoice(inv);
    setIsReceiptOpen(true);
  };

  const lowStockCount = ingredients.filter((i) => i.current_stock <= i.min_stock_alert).length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/70 text-slate-900">
      {/* Flash Alerts Toast */}
      <AlertsBanner alerts={alerts} onDismiss={removeAlert} lang={lang} />

      {/* Top Application Navbar */}
      <Navbar
        user={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        onSwitchUserClick={handleSwitchUserClick}
        lowStockCount={lowStockCount}
        lang={lang}
        setLang={setLang}
        onResetData={handleResetData}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'home' && (
          <HomeView
            user={currentUser}
            settings={settings}
            invoices={invoices}
            ingredients={ingredients}
            spaces={spaces}
            staff={staff}
            attendance={attendance}
            rules={rules}
            customers={customers}
            menuItems={menuItems}
            onNavigateTab={setActiveTab}
            onSelectSpaceForBilling={handleSelectSpaceForBilling}
            lang={lang}
          />
        )}
        {activeTab === 'catalog' && (
          <CustomerDashboardView
            user={currentUser}
            settings={settings}
            menuItems={menuItems}
            onNavigateTab={setActiveTab}
            lang={lang}
          />
        )}

        {activeTab === 'dashboard' && ['Admin', 'Manager'].includes(currentUser.role) && (
          <DashboardView
            invoices={invoices}
            ingredients={ingredients}
            wastageLogs={wastageLogs}
            menuItems={menuItems}
            onViewInvoice={handleViewInvoice}
            onNavigateTab={setActiveTab}
            lang={lang}
          />
        )}

        {activeTab === 'kds' && (
          <KitchenDisplayView
            invoices={invoices}
            onUpdateInvoice={(updated) => {
              setInvoices(prev => prev.map(i => i.id === updated.id ? updated : i));
            }}
          />
        )}
        
        {activeTab === 'pos' && (
          <POSBillingView
            menuItems={menuItems}
            ingredients={ingredients}
            recipeBOMs={recipeBOMs}
            spaces={spaces}
            settings={settings}
            customers={customers}
            onSaveCustomer={handleSaveCustomer}
            selectedInitialSpace={selectedInitialSpace}
            currentUser={currentUser}
            onOrderCompleted={handleOrderCompleted}
            lang={lang}
          />
        )}

        {activeTab === 'spaces' && (
          <TableSpacesView
            spaces={spaces}
            onUpdateSpaceStatus={handleUpdateSpaceStatus}
            onAddSpace={handleAddSpace}
            onDeleteSpace={handleDeleteSpace}
            onSelectSpaceForBilling={handleSelectSpaceForBilling}
            lang={lang}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryView
            ingredients={ingredients}
            onAddIngredient={handleAddIngredient}
            onUpdateStock={handleUpdateStock}
            onDeleteIngredient={handleDeleteIngredient}
            onEditThreshold={handleEditThreshold}
            lang={lang}
          />
        )}

        {activeTab === 'staff' && ['Admin', 'Manager', 'Staff'].includes(currentUser.role) && (
          <StaffManagementView
            staff={staff}
            attendance={attendance}
            onAddStaff={handleAddStaff}
            onUpdateAttendance={handleUpdateAttendance}
            onEnrollFace={handleEnrollFace}
            onEnrollFingerprint={handleEnrollFingerprint}
            onDeleteStaff={handleDeleteStaff}
            onToggleStaffLogin={handleToggleStaffLogin}
            onUpdateStaffLoginCredentials={handleUpdateStaffLoginCredentials}
            onToggleRequireFaceLogin={(required) => {
              setSettings((prev) => ({ ...prev, require_face_login: required }));
              addAlert({
                id: `face-req-${Date.now()}`,
                type: 'info',
                message: `Face verification requirement on login ${required ? 'ENABLED' : 'DISABLED'}.`,
                messageHi: `लॉगिन पर फ़ेस सत्यापन की अनिवार्यता ${required ? 'चालू' : 'बंद'} कर दी गई।`,
                timestamp: Date.now(),
              });
            }}
            requireFaceLogin={settings.require_face_login}
            ownerFacePhoto={settings.admin_face_photo}
            lang={lang}
            userRole={currentUser.role}
          />
        )}

        {activeTab === 'spoilage' && ['Admin', 'Manager', 'Kitchen'].includes(currentUser.role) && (
          <SpoilageView
            wastageLogs={wastageLogs}
            ingredients={ingredients}
            currentUser={currentUser}
            onLogWastage={handleLogWastage}
            lang={lang}
          />
        )}

        {activeTab === 'recipes' && ['Admin', 'Manager', 'Kitchen'].includes(currentUser.role) && (
          <RecipeBOMView
            recipeBOMs={recipeBOMs}
            menuItems={menuItems}
            ingredients={ingredients}
            onAddBOM={handleAddBOM}
            onDeleteBOM={handleDeleteBOM}
            lang={lang}
          />
        )}

        {activeTab === 'invoices' && (
          <InvoicesHistoryView
            invoices={invoices}
            onViewInvoice={handleViewInvoice}
            lang={lang}
          />
        )}

        {activeTab === 'menu' && ['Admin', 'Manager', 'Staff'].includes(currentUser.role) && (
          <MenuManagerView
            menuItems={menuItems}
            onAddMenuItem={handleAddMenuItem}
            onUpdatePrice={handleUpdatePrice}
            onDeleteMenuItem={handleDeleteMenuItem}
            lang={lang}
            userRole={currentUser.role}
          />
        )}

        {activeTab === 'rules' && (
          <RuleBookView
            rules={rules}
            onAddRule={handleAddRule}
            onDeleteRule={handleDeleteRule}
            lang={lang}
          />
        )}

        {activeTab === 'customers' && ['Admin', 'Manager', 'Staff'].includes(currentUser.role) && (
          <div className="bg-slate-50 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                      <Users className="w-5 h-5 text-amber-700" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">{lang === 'hi' ? 'स्थायी ग्राहक खाते' : 'Customer Accounts'}</h2>
                      <p className="text-sm text-slate-500 mt-0.5">{lang === 'hi' ? 'ग्राहकों का विवरण और क्रेडिट/बाकी खाते प्रबंधित करें' : 'Manage customer details and credit dues'}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsCustomerModalOpenFromApp(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#b14c33] hover:bg-[#8a3824] text-white text-sm font-bold rounded-xl transition shadow-md"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span className="hidden sm:inline">{lang === 'hi' ? 'नया ग्राहक जोड़ें' : 'Add New Customer'}</span>
                  </button>
                </div>
                
                <div className="p-0 overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100/50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
                        <th className="p-4 pl-6">{lang === 'hi' ? 'नाम' : 'Name'}</th>
                        <th className="p-4">{lang === 'hi' ? 'फ़ोन नंबर' : 'Phone'}</th>
                        <th className="p-4">{lang === 'hi' ? 'कुल ख़रीद' : 'Total Spent'}</th>
                        <th className="p-4">{lang === 'hi' ? 'बाकी/क्रेडिट' : 'Credit Due'}</th>
                        <th className="p-4 text-center">{lang === 'hi' ? 'एक्शन' : 'Actions'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {customers.map(c => (
                        <tr key={c.customer_id} className="hover:bg-slate-50 transition">
                          <td className="p-4 pl-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 text-xs">
                                {c.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900">{c.name}</div>
                                {(c as any).is_vip || (c.discount_rate || 0) > 0 && <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold uppercase mt-0.5 inline-block border border-amber-200">VIP</span>}
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-sm text-slate-600 font-mono font-medium">{c.mobile}</td>
                          <td className="p-4 text-sm font-bold text-emerald-600">₹{(c.total_spend || c.total_spent || 0).toFixed(2)}</td>
                          <td className="p-4">
                            {((c as any).credit_balance || 0) > 0 ? (
                              <span className="text-rose-600 font-bold bg-rose-50 px-2 py-1 rounded-lg border border-rose-100">
                                ₹{((c as any).credit_balance || 0).toFixed(2)}
                              </span>
                            ) : (
                              <span className="text-slate-400 font-medium px-2 py-1">₹0.00</span>
                            )}
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => setIsCustomerModalOpenFromApp(true)}
                              className="text-xs font-semibold text-[#b14c33] hover:text-[#8a3824] bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg transition"
                            >
                              {lang === 'hi' ? 'विवरण' : 'Details'}
                            </button>
                          </td>
                        </tr>
                      ))}
                      {customers.length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-12 text-center text-slate-400 text-sm">
                            <Users className="w-8 h-8 mx-auto mb-3 opacity-20" />
                            {lang === 'hi' ? 'कोई ग्राहक नहीं मिला।' : 'No customers found.'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            <PermanentCustomerModal
              isOpen={isCustomerModalOpenFromApp}
              onClose={() => setIsCustomerModalOpenFromApp(false)}
              customers={customers}
              onSaveCustomer={handleSaveCustomer}
              lang={lang}
            />
          </div>
        )}
        
        {activeTab === 'profile' && (
          <RestaurantProfileView
            settings={settings}
            lang={lang}
          />
        )}
        
        {activeTab === 'settings' && ['Admin', 'Manager'].includes(currentUser.role) && (
          <SettingsView
            settings={settings}
            onSaveSettings={handleSaveSettings}
            onResetData={handleResetData}
            lang={lang}
          />
        )}
      </main>

      {/* Printable Receipt Modal */}
      <ReceiptModal
        invoice={activeReceiptInvoice}
        settings={settings}
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        lang={lang}
      />

      {/* Login / Switch User Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onLoginSuccess={handleLoginSuccess}
        lang={lang}
        staff={staff}
        ownerFacePhoto={settings.admin_face_photo}
        requireFaceLogin={settings.require_face_login}
        onSaveOwnerFacePhoto={(photoUrl, descriptor) => {
          handleEnrollFace('OWNER', photoUrl, descriptor);
        }}
        onEnrollStaffFace={(staffId, photoUrl, descriptor) => {
          handleEnrollFace(staffId, photoUrl, descriptor);
        }}
      />
    </div>
  );
}

