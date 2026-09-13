import { syncToFirestore } from './firebaseSync';
import {
  Ingredient,
  MenuItem,
  RecipeBOM,
  BillingStatement,
  WastageLog,
  User,
  CartItem,
  SystemSettings,
  RestaurantSpace,
  StaffMember,
  AttendanceRecord,
  RuleBookEntry,
  SpaceStatus,
  PermanentCustomer,
} from '../types';
import {
  INITIAL_INGREDIENTS,
  INITIAL_MENU_ITEMS,
  INITIAL_RECIPE_BOMS,
  INITIAL_PAST_INVOICES,
  INITIAL_WASTAGE_LOGS,
  DEFAULT_USERS,
  INITIAL_SETTINGS,
  INITIAL_SPACES,
  INITIAL_STAFF,
  INITIAL_ATTENDANCE,
  INITIAL_RULES,
  INITIAL_PERMANENT_CUSTOMERS,
} from '../data/initialData';

const STORAGE_KEYS = {
  INGREDIENTS: 'rtm_ingredients_v1',
  MENU_ITEMS: 'rtm_menu_items_v1',
  RECIPE_BOMS: 'rtm_recipe_boms_v1',
  INVOICES: 'rtm_invoices_v1',
  WASTAGE: 'rtm_wastage_logs_v1',
  USER: 'rtm_current_user_v1',
  LANG: 'rtm_language_v1',
  SETTINGS: 'rtm_settings_v2',
  SPACES: 'rtm_spaces_v2',
  STAFF: 'rtm_staff_v2',
  ATTENDANCE: 'rtm_attendance_v2',
  RULES: 'rtm_rules_v2',
  SEQ_TRACKER: 'rtm_seq_tracker_v2',
  CUSTOMERS: 'rtm_permanent_customers_v2',
};

// Pricing & Tax Constants matching user specifications
export const TAX_RATES = {
  GST_RATE: 0.05, // 5% Goods and Services Tax
  SERVICE_CHARGE_RATE: 0.01, // 1% Service charge
  DISCOUNT_RATE: 0.05, // 5% Standard Discount
  DISCOUNT_MINIMUM: 500.0, // Minimum subtotal for standard discount
  PERMANENT_CUSTOMER_DISCOUNT_RATE: 0.05, // 5% Extra discount for Permanent / VIP Customers
};

export interface BillCalculation {
  subtotal: number;
  discount: number; // Standard tier discount
  permanent_discount: number; // Extra 5% for permanent customer
  total_discount: number; // Combined discount
  taxable_base: number;
  service_charge: number;
  goods_and_services_tax: number;
  grand_total: number;
  is_discount_applied: boolean;
  is_permanent_applied: boolean;
}

export function calculateBill(
  items: CartItem[],
  customGstRate?: number,
  customServiceChargeRate?: number,
  isPermanentCustomer?: boolean
): BillCalculation {
  const gstRate = customGstRate !== undefined ? customGstRate : TAX_RATES.GST_RATE;
  const serviceChargeRate =
    customServiceChargeRate !== undefined ? customServiceChargeRate : TAX_RATES.SERVICE_CHARGE_RATE;

  const subtotal = items.reduce((sum, item) => sum + item.dish.price * item.quantity, 0);
  const is_discount_applied = subtotal >= TAX_RATES.DISCOUNT_MINIMUM;
  const discount = is_discount_applied ? Math.round(subtotal * TAX_RATES.DISCOUNT_RATE * 100) / 100 : 0.0;

  const is_permanent_applied = Boolean(isPermanentCustomer);
  const permanent_discount = is_permanent_applied
    ? Math.round(subtotal * TAX_RATES.PERMANENT_CUSTOMER_DISCOUNT_RATE * 100) / 100
    : 0.0;

  const total_discount = Math.round((discount + permanent_discount) * 100) / 100;
  const taxable_base = Math.max(0, Math.round((subtotal - total_discount) * 100) / 100);
  const service_charge = Math.round(taxable_base * serviceChargeRate * 100) / 100;
  const goods_and_services_tax = Math.round(taxable_base * gstRate * 100) / 100;
  const grand_total = Math.round((taxable_base + service_charge + goods_and_services_tax) * 100) / 100;

  return {
    subtotal,
    discount,
    permanent_discount,
    total_discount,
    taxable_base,
    service_charge,
    goods_and_services_tax,
    grand_total,
    is_discount_applied,
    is_permanent_applied,
  };
}

export function generateV2OrderNumber(settings: SystemSettings): string {
  try {
    const prefix = settings.prefix || 'ORD';
    const seqFormat = settings.sequence_format || 'DAILY_RESET';
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const currentDateStr = `${yyyy}${mm}${dd}`;

    const trackingKey = seqFormat === 'DAILY_RESET' ? currentDateStr : 'GLOBAL';
    const raw = localStorage.getItem(STORAGE_KEYS.SEQ_TRACKER);
    const tracker: Record<string, number> = raw ? JSON.parse(raw) : {};

    const lastIndex = tracker[trackingKey] || 0;
    const nextIndex = lastIndex + 1;
    tracker[trackingKey] = nextIndex;
    localStorage.setItem(STORAGE_KEYS.SEQ_TRACKER, JSON.stringify(tracker));

    if (seqFormat === 'DAILY_RESET') {
      return `${prefix}-${currentDateStr}-${String(nextIndex).padStart(4, '0')}`;
    } else {
      return `${prefix}-${String(nextIndex).padStart(6, '0')}`;
    }
  } catch {
    const r = Math.floor(1000 + Math.random() * 9000);
    return `${settings.prefix || 'ORD'}-${Date.now().toString().slice(-6)}-${r}`;
  }
}

export function loadStoredData() {
  const safeGet = <T>(key: string, fallback: T): T => {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return fallback;
      return JSON.parse(stored);
    } catch {
      return fallback;
    }
  };

  return {
    ingredients: safeGet<Ingredient[]>(STORAGE_KEYS.INGREDIENTS, INITIAL_INGREDIENTS),
    menuItems: safeGet<MenuItem[]>(STORAGE_KEYS.MENU_ITEMS, INITIAL_MENU_ITEMS),
    recipeBOMs: safeGet<RecipeBOM[]>(STORAGE_KEYS.RECIPE_BOMS, INITIAL_RECIPE_BOMS),
    invoices: safeGet<BillingStatement[]>(STORAGE_KEYS.INVOICES, INITIAL_PAST_INVOICES),
    wastageLogs: safeGet<WastageLog[]>(STORAGE_KEYS.WASTAGE, INITIAL_WASTAGE_LOGS),
    user: safeGet<User>(STORAGE_KEYS.USER, { id: 1, username: 'admin', role: 'Admin' }),
    lang: safeGet<'en' | 'hi'>(STORAGE_KEYS.LANG, 'en'),
    settings: safeGet<SystemSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS),
    spaces: safeGet<RestaurantSpace[]>(STORAGE_KEYS.SPACES, INITIAL_SPACES),
    staff: safeGet<StaffMember[]>(STORAGE_KEYS.STAFF, INITIAL_STAFF),
    attendance: safeGet<AttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE, INITIAL_ATTENDANCE),
    rules: safeGet<RuleBookEntry[]>(STORAGE_KEYS.RULES, INITIAL_RULES),
    customers: safeGet<PermanentCustomer[]>(STORAGE_KEYS.CUSTOMERS, INITIAL_PERMANENT_CUSTOMERS),
  };
}

export function saveIngredients(items: Ingredient[]) {
  localStorage.setItem(STORAGE_KEYS.INGREDIENTS, JSON.stringify(items));
  syncToFirestore('ingredients', items);
}

export function saveMenuItems(items: MenuItem[]) {
  localStorage.setItem(STORAGE_KEYS.MENU_ITEMS, JSON.stringify(items));
  syncToFirestore('menuItems', items);
}

export function saveRecipeBOMs(items: RecipeBOM[]) {
  localStorage.setItem(STORAGE_KEYS.RECIPE_BOMS, JSON.stringify(items));
  syncToFirestore('recipeBOMs', items);
}

export function saveInvoices(items: BillingStatement[]) {
  localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(items));
  syncToFirestore('invoices', items);
}

export function saveWastageLogs(items: WastageLog[]) {
  localStorage.setItem(STORAGE_KEYS.WASTAGE, JSON.stringify(items));
  syncToFirestore('wastageLogs', items);
}

export function saveActiveUser(user: User) {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
}

export function saveLanguage(lang: 'en' | 'hi') {
  localStorage.setItem(STORAGE_KEYS.LANG, JSON.stringify(lang));
}

export function saveSettings(settings: SystemSettings) {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  syncToFirestore('settings', [settings]);
}

export function saveSpaces(spaces: RestaurantSpace[]) {
  localStorage.setItem(STORAGE_KEYS.SPACES, JSON.stringify(spaces));
  syncToFirestore('spaces', spaces);
}

export function saveStaff(staff: StaffMember[]) {
  localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(staff));
  syncToFirestore('staff', staff);
}

export function saveAttendance(records: AttendanceRecord[]) {
  localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(records));
  syncToFirestore('attendance', records);
}

export function saveRules(rules: RuleBookEntry[]) {
  localStorage.setItem(STORAGE_KEYS.RULES, JSON.stringify(rules));
  syncToFirestore('rules', rules);
}

export function savePermanentCustomers(customers: PermanentCustomer[]) {
  localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  syncToFirestore('customers', customers);
}

export function resetAllStorage() {
  localStorage.removeItem(STORAGE_KEYS.INGREDIENTS);
  localStorage.removeItem(STORAGE_KEYS.MENU_ITEMS);
  localStorage.removeItem(STORAGE_KEYS.RECIPE_BOMS);
  localStorage.removeItem(STORAGE_KEYS.INVOICES);
  localStorage.removeItem(STORAGE_KEYS.WASTAGE);
  localStorage.removeItem(STORAGE_KEYS.USER);
  localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  localStorage.removeItem(STORAGE_KEYS.SPACES);
  localStorage.removeItem(STORAGE_KEYS.STAFF);
  localStorage.removeItem(STORAGE_KEYS.ATTENDANCE);
  localStorage.removeItem(STORAGE_KEYS.RULES);
  localStorage.removeItem(STORAGE_KEYS.CUSTOMERS);
  localStorage.removeItem(STORAGE_KEYS.SEQ_TRACKER);
}

export interface StockDeficit {
  ingredient_name: string;
  needed: number;
  current_stock: number;
  unit: string;
  dish_name: string;
}

// Check stock availability based on Recipe BOM (matching Flask & Tkinter logic)
export function checkOrderStock(
  cart: CartItem[],
  recipeBOMs: RecipeBOM[],
  ingredients: Ingredient[]
): { canFulfill: boolean; deficits: StockDeficit[] } {
  // Aggregate total required quantities of each ingredient
  const ingredientRequirements: Record<string, { needed: number; dishes: string[] }> = {};

  for (const item of cart) {
    const dishBoms = recipeBOMs.filter(
      (b) => b.dish_name.toLowerCase() === item.dish.dish_name.toLowerCase()
    );

    for (const bom of dishBoms) {
      const ingName = bom.ingredient_name;
      const totalForDish = bom.quantity_used * item.quantity;

      if (!ingredientRequirements[ingName]) {
        ingredientRequirements[ingName] = { needed: 0, dishes: [] };
      }
      ingredientRequirements[ingName].needed += totalForDish;
      if (!ingredientRequirements[ingName].dishes.includes(item.dish.dish_name)) {
        ingredientRequirements[ingName].dishes.push(item.dish.dish_name);
      }
    }
  }

  const deficits: StockDeficit[] = [];

  for (const [ingName, req] of Object.entries(ingredientRequirements)) {
    const ing = ingredients.find((i) => i.name.toLowerCase() === ingName.toLowerCase());
    const currentStock = ing ? ing.current_stock : 0;
    const unit = ing ? ing.unit : 'unit';

    if (currentStock < req.needed) {
      deficits.push({
        ingredient_name: ingName,
        needed: Math.round(req.needed * 100) / 100,
        current_stock: Math.round(currentStock * 100) / 100,
        unit,
        dish_name: req.dishes.join(', '),
      });
    }
  }

  return {
    canFulfill: deficits.length === 0,
    deficits,
  };
}

// Deduct required ingredients from inventory and detect low stock alerts
export function deductStock(
  cart: CartItem[],
  recipeBOMs: RecipeBOM[],
  ingredients: Ingredient[]
): {
  updatedIngredients: Ingredient[];
  lowStockAlerts: { name: string; remaining: number; min_alert: number; unit: string }[];
} {
  const updatedIngredients = ingredients.map((ing) => ({ ...ing }));
  const lowStockAlerts: { name: string; remaining: number; min_alert: number; unit: string }[] = [];

  for (const item of cart) {
    const dishBoms = recipeBOMs.filter(
      (b) => b.dish_name.toLowerCase() === item.dish.dish_name.toLowerCase()
    );

    for (const bom of dishBoms) {
      const totalNeeded = bom.quantity_used * item.quantity;
      const targetIng = updatedIngredients.find(
        (i) => i.name.toLowerCase() === bom.ingredient_name.toLowerCase()
      );

      if (targetIng) {
        targetIng.current_stock = Math.max(
          0,
          Math.round((targetIng.current_stock - totalNeeded) * 1000) / 1000
        );
      }
    }
  }

  // Check for any ingredient dropping to or below alert threshold
  for (const ing of updatedIngredients) {
    if (ing.current_stock <= ing.min_stock_alert) {
      lowStockAlerts.push({
        name: ing.name,
        remaining: ing.current_stock,
        min_alert: ing.min_stock_alert,
        unit: ing.unit,
      });
    }
  }

  return {
    updatedIngredients,
    lowStockAlerts,
  };
}

// Calculate how many portions of a dish can be made with current stock
export function calculatePortionYield(
  dishName: string,
  recipeBOMs: RecipeBOM[],
  ingredients: Ingredient[]
): { maxPortions: number; limitingIngredient?: string } {
  const boms = recipeBOMs.filter((b) => b.dish_name.toLowerCase() === dishName.toLowerCase());
  if (boms.length === 0) return { maxPortions: 999 }; // unconstrained if no BOM recipe entered yet

  let minPortions = Infinity;
  let bottleneck = '';

  for (const bom of boms) {
    const ing = ingredients.find((i) => i.name.toLowerCase() === bom.ingredient_name.toLowerCase());
    if (!ing || ing.current_stock <= 0) {
      return { maxPortions: 0, limitingIngredient: bom.ingredient_name };
    }
    const possible = Math.floor(ing.current_stock / bom.quantity_used);
    if (possible < minPortions) {
      minPortions = possible;
      bottleneck = bom.ingredient_name;
    }
  }

  return {
    maxPortions: isFinite(minPortions) ? minPortions : 999,
    limitingIngredient: bottleneck,
  };
}
