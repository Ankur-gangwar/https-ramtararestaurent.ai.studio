export type UserRole = 'Admin' | 'Manager' | 'Cashier' | 'Waiter' | 'Kitchen';

export interface User {
  id: number;
  username: string;
  name?: string;
  role: UserRole;
  email?: string;
  mobile?: string;
}

export interface Ingredient {
  item_id: number;
  name: string;
  current_stock: number;
  unit: string; // 'kg' | 'L' | 'pcs' | 'packets' | 'grams'
  min_stock_alert: number;
}

export interface MenuItem {
  dish_id: number;
  dish_name: string;
  price: number;
  category: 'South Indian' | 'North Indian' | 'Snacks & Starters' | 'Beverages' | 'Desserts' | 'Meals & Biryani';
  is_veg: boolean;
}

export interface RecipeBOM {
  recipe_id: number;
  dish_name: string;
  ingredient_name: string;
  quantity_used: number; // e.g. 0.10 kg
  unit?: string;
}

export interface CartItem {
  dish: MenuItem;
  quantity: number;
}

export interface BillingItem {
  id?: number;
  invoice_number: string;
  item_name: string;
  quantity: number;
  price: number;
  amount: number;
}

export interface BillingStatement {
  id: number;
  invoice_number: string;
  customer_name: string;
  mobile_number: string;
  order_type: 'Dine-In' | 'Takeaway' | 'Delivery';
  table_number?: string;
  waiter_name?: string;
  bill_date: string;
  subtotal: number;
  discount: number;
  is_permanent_customer?: boolean;
  permanent_customer_discount?: number;
  service_charge: number;
  goods_and_services_tax: number;
  grand_total: number;
  payment_method: 'Cash' | 'UPI' | 'Card';
  amount_paid: number;
  change_amount: number;
  items: BillingItem[];
  cashier: string;
  kot_status?: 'Pending' | 'Cooking' | 'Ready' | 'Served';
}

export interface WastageLog {
  id: number;
  ingredient_name: string;
  quantity_wasted: number;
  unit: string;
  reason: 'Spoiled' | 'Expired' | 'Spilled' | 'Cooking Error' | 'Prep Trim' | 'Other';
  log_date: string;
  logged_by: string;
  notes?: string;
}

export interface FlashAlert {
  id: string;
  type: 'success' | 'warning' | 'danger' | 'info';
  title?: string;
  message: string;
  messageHi?: string;
  timestamp: number;
}

export interface SystemSettings {
  id: number;
  restaurant_name: string;
  address: string;
  mobile: string;
  gstein: string;
  currency: string;
  default_gst: number;
  default_service_charge: number;
  invoice_footer: string;
  admin_password?: string;
  current_lang: string;
  prefix: string;
  sequence_format: 'DAILY_RESET' | 'GLOBAL';
  admin_face_enrolled?: boolean;
  admin_face_photo?: string;
  admin_face_descriptor?: number[];
  require_face_login?: boolean;
}

export type SpaceStatus = 'Available' | 'Occupied' | 'Billed' | 'Cleaning';

export interface RestaurantSpace {
  space_id: number;
  space_label: string;
  seating_capacity: number;
  current_status: SpaceStatus;
  active_invoice_number?: string;
}

export interface StaffMember {
  staff_id: string;
  full_name: string;
  mobile_number: string;
  email?: string;
  home_address: string;
  designation: 'Chef' | 'Waiter' | 'Manager' | 'Cashier' | 'Cleaner' | 'Kitchen Helper' | 'Cab Driver' | 'Driver';
  monthly_salary: number;
  joining_date: string;
  employment_status: 'Active' | 'On Leave' | 'Terminated';
  face_enrolled?: boolean;
  face_photo?: string;
  face_descriptor?: number[];
  fingerprint_enrolled?: boolean;
  fingerprint_template?: string;
  login_enabled?: boolean;
  login_role?: UserRole;
  login_pin?: string;
}

export type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Half Day' | 'On Leave';

export interface AttendanceRecord {
  record_id: number;
  attendance_id?: string;
  staff_id: string;
  log_date: string;
  attendance_status: AttendanceStatus;
  verification_method?: 'Face' | 'Fingerprint' | 'Manual' | 'Face Recognition' | 'Fingerprint Biometric';
  punch_in_time?: string;
  punch_out_time?: string;
  check_in_time?: string;
  check_out_time?: string;
  notes?: string;
}

export interface RuleBookEntry {
  rule_id: number;
  rule_category: 'Staff Rules' | 'Restaurant Rules' | 'Inventory & Kitchen' | 'General';
  topic_header: string;
  rule_description_text: string;
}

export interface PermanentCustomer {
  customer_id: number | string;
  name: string;
  mobile: string;
  email?: string;
  address?: string;
  discount_rate?: number; // default 0.05 (5%)
  discount_percentage?: number; // 5%
  total_orders_count: number;
  total_spend: number;
  total_spent?: number;
  joined_date: string;
  notes?: string;
}

