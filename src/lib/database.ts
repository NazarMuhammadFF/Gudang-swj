import Dexie, { Table } from "dexie";

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

export class BekasBerkahDB extends Dexie {
  products!: Table<Product>;
  categories!: Table<Category>;

  constructor() {
    super("BekasBerkahDB");
    this.version(1).stores({
      products: "++id, name, category, status, createdAt, updatedAt",
      categories: "++id, name, createdAt",
    });
  }
}

export const db = new BekasBerkahDB();
