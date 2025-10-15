import Dexie, { type Table } from "dexie";
import { generateSubmissionCode } from "./tracking";

export interface Product {
  id?: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id?: number;
  name: string;
  description: string;
  createdAt: Date;
}

export type SubmissionStatus = "pending" | "approved" | "rejected";

export interface Submission {
  id?: number;
  sellerName: string;
  email: string;
  phone: string;
  sellerCity?: string;
  sellerAddress?: string;
  preferredContact?: "whatsapp" | "email" | "phone";
  productName: string;
  productDescription?: string;
  category: string;
  condition: "excellent" | "good" | "fair";
  askingPrice?: number;
  productPhotos?: string[];
  trackingCode: string;
  status: SubmissionStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface Order {
  id?: number;
  orderNumber: string;
  customerName: string;
  // New fields (optional for backward compatibility)
  customerEmail?: string;
  customerPhone?: string;
  shippingAddress?: string;
  items?: Array<{
    productId: number;
    productName: string;
    price: number;
    quantity: number;
  }>;
  totalAmount?: number;
  paymentMethod?: string;
  notes?: string;
  // Required fields
  status: OrderStatus;
  createdAt: Date;
  updatedAt?: Date;
  // Legacy fields for backward compatibility
  email?: string;
  total?: number;
  itemsDescription?: string;
}

export interface UserProfile {
  id?: number;
  email: string;
  emailLower: string;
  name: string;
  phone: string;
  address: string;
  memberSince?: string;
  role?: "admin" | "user";
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSettings {
  id?: number;
  email: string;
  emailLower: string;
  emailUpdates: boolean;
  smsUpdates: boolean;
  marketingTips: boolean;
  darkMode: "light" | "dark" | "system";
  updatedAt: Date;
}

export class BekasBerkahDB extends Dexie {
  products!: Table<Product>;
  categories!: Table<Category>;
  submissions!: Table<Submission>;
  orders!: Table<Order>;
  profiles!: Table<UserProfile>;
  settings!: Table<UserSettings>;

  constructor() {
    super("BekasBerkahDB");

    this.version(1).stores({
      products: "++id, name, category, status, createdAt, updatedAt",
      categories: "++id, name, createdAt",
    });

    this.version(2).stores({
      products: "++id, name, category, status, createdAt, updatedAt",
      categories: "++id, name, createdAt",
      submissions:
        "++id, status, createdAt, updatedAt, sellerName, productName, category",
      orders: "++id, orderNumber, status, customerName, createdAt, updatedAt",
    });

    this.version(3)
      .stores({
        products: "++id, name, category, status, createdAt, updatedAt",
        categories: "++id, name, createdAt",
        submissions:
          "++id, trackingCode, status, createdAt, updatedAt, sellerName, productName, category",
        orders: "++id, orderNumber, status, customerName, createdAt, updatedAt",
      })
      .upgrade(async (transaction) => {
        await transaction
          .table("submissions")
          .toCollection()
          .modify((submission) => {
            const record = submission as Submission;
            if (!record.trackingCode) {
              record.trackingCode = generateSubmissionCode();
            }
          });
      });

    this.version(4).stores({
      products: "++id, name, category, status, createdAt, updatedAt",
      categories: "++id, name, createdAt",
      submissions:
        "++id, trackingCode, status, createdAt, updatedAt, sellerName, productName, category",
      orders: "++id, orderNumber, status, customerName, createdAt, updatedAt",
      profiles: "++id, &email, emailLower",
      settings: "++id, &email, emailLower",
    });
  }
}

// Only instantiate the database on the client side
export const db =
  typeof window !== "undefined" ? new BekasBerkahDB() : ({} as BekasBerkahDB);
