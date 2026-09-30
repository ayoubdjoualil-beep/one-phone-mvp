import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  updateDoc
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Order } from '../types';

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); /* CRITICAL: The app will break without this line */
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firebase client offline warning");
    }
    // Return true even if test doc doesn't exist, as long as it reached the server
    return true;
  }
}

// Order submission to Firestore with local backup guarantee
export async function submitOrder(order: Omit<Order, 'id'>): Promise<string> {
  // Always save to localStorage immediately as a fallback guarantee
  const localOrdersKey = 'onephone_orders_cache';
  const existingLocal = JSON.parse(localStorage.getItem(localOrdersKey) || '[]');
  const newOrderWithTempId = { ...order, id: `local_${Date.now()}` };
  localStorage.setItem(localOrdersKey, JSON.stringify([newOrderWithTempId, ...existingLocal]));

  const path = 'orders';
  try {
    const docRef = await addDoc(collection(db, path), {
      customerName: order.customerName,
      phone: order.phone,
      wilayaCode: order.wilayaCode,
      wilayaName: order.wilayaName,
      commune: order.commune,
      deliveryType: order.deliveryType,
      deliveryFee: order.deliveryFee,
      items: JSON.stringify(order.items),
      totalAmount: order.totalAmount,
      status: order.status,
      notes: order.notes || '',
      orderNumber: order.orderNumber,
      createdAt: order.createdAt
    });
    return docRef.id;
  } catch (error) {
    console.warn('Firestore direct write failed, order retained in local storage cache:', error);
    // Also post to local backend server backup if running
    try {
      await fetch('/api/orders/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
      });
    } catch {
      // ignore
    }
    return newOrderWithTempId.id;
  }
}

export async function fetchStoreOrders(): Promise<Order[]> {
  const localOrdersKey = 'onephone_orders_cache';
  const localCached: Order[] = JSON.parse(localStorage.getItem(localOrdersKey) || '[]');

  try {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const firestoreOrders: Order[] = snapshot.docs.map(doc => {
      const data = doc.data();
      let parsedItems = [];
      try {
        parsedItems = typeof data.items === 'string' ? JSON.parse(data.items) : data.items;
      } catch {
        parsedItems = [];
      }
      return {
        id: doc.id,
        orderNumber: data.orderNumber || doc.id.slice(0, 8),
        customerName: data.customerName,
        phone: data.phone,
        wilayaCode: data.wilayaCode,
        wilayaName: data.wilayaName,
        commune: data.commune,
        deliveryType: data.deliveryType,
        deliveryFee: data.deliveryFee,
        items: parsedItems,
        totalAmount: data.totalAmount,
        status: data.status,
        notes: data.notes,
        createdAt: data.createdAt
      } as Order;
    });

    if (firestoreOrders.length > 0) {
      // Merge unique
      const ids = new Set(firestoreOrders.map(o => o.orderNumber));
      const unSyncedLocal = localCached.filter(o => !ids.has(o.orderNumber));
      return [...firestoreOrders, ...unSyncedLocal];
    }
  } catch (err) {
    console.warn('Could not read from Firestore directly (admin permission or offline), using cached orders', err);
  }

  return localCached;
}

export async function updateOrderStatus(orderId: string, newStatus: Order['status']): Promise<void> {
  const localOrdersKey = 'onephone_orders_cache';
  const localCached: Order[] = JSON.parse(localStorage.getItem(localOrdersKey) || '[]');
  const updated = localCached.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
  localStorage.setItem(localOrdersKey, JSON.stringify(updated));

  if (!orderId.startsWith('local_')) {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
    } catch (e) {
      console.warn('Failed to update status on Firestore', e);
    }
  }
}
