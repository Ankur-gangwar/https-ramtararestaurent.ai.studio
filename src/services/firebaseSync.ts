import { collection, doc, setDoc, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  Ingredient, MenuItem, RecipeBOM, BillingStatement, WastageLog,
  SystemSettings, RestaurantSpace, StaffMember, AttendanceRecord,
  RuleBookEntry, PermanentCustomer
} from '../types';

// Generic save function that replaces the collection with the current array
// In a real production app we would diff or sync individual docs, 
// but for seamless migration of this localStorage-based app, we'll write the whole array as a document or sub-documents.
// Since arrays can grow large, let's store each item as a separate document.

export async function syncToFirestore(collectionName: string, items: any[], idField: string = 'id') {
  if (!items) return;
  // This is a naive implementation: it just overwrites the documents that exist in the array.
  // It doesn't delete items that were removed. We will manage full syncs.
  try {
    for (const item of items) {
      const docId = String(item[idField] || item.item_id || item.dish_id || item.recipe_id || item.space_id || item.staff_id || item.record_id || item.rule_id || item.customer_id || Date.now());
      await setDoc(doc(db, collectionName, docId), item);
    }
  } catch (err) {
    console.error(`Firebase Sync Error for ${collectionName}:`, err);
  }
}

export async function fetchFromFirestore(collectionName: string): Promise<any[]> {
  try {
    const snap = await getDocs(collection(db, collectionName));
    return snap.docs.map(d => d.data());
  } catch (err) {
    console.error(`Firebase Fetch Error for ${collectionName}:`, err);
    return [];
  }
}

export async function fetchAllDataFromFirestore() {
  const [
    ingredients, menuItems, recipeBOMs, invoices, wastageLogs,
    settings, spaces, staff, attendance, rules, customers
  ] = await Promise.all([
    fetchFromFirestore('ingredients'),
    fetchFromFirestore('menuItems'),
    fetchFromFirestore('recipeBOMs'),
    fetchFromFirestore('invoices'),
    fetchFromFirestore('wastageLogs'),
    fetchFromFirestore('settings'),
    fetchFromFirestore('spaces'),
    fetchFromFirestore('staff'),
    fetchFromFirestore('attendance'),
    fetchFromFirestore('rules'),
    fetchFromFirestore('customers')
  ]);

  return {
    ingredients,
    menuItems,
    recipeBOMs,
    invoices,
    wastageLogs,
    settings: settings.length > 0 ? settings[0] : null,
    spaces,
    staff,
    attendance,
    rules,
    customers
  };
}
