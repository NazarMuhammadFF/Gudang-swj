import Dexie, { type Table } from "dexie";

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
  productName: string;
  category: string;
  condition: "excellent" | "good" | "fair";
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
  email: string;
  total: number;
  status: OrderStatus;
  itemsDescription: string;
  createdAt: Date;
  updatedAt: Date;
}

export class BekasBerkahDB extends Dexie {
  products!: Table<Product>;
  categories!: Table<Category>;
  submissions!: Table<Submission>;
  orders!: Table<Order>;

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
  }
}

// Only instantiate the database on the client side
export const db = typeof window !== "undefined" ? new BekasBerkahDB() : ({} as BekasBerkahDB);
