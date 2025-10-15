"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Product } from "@/lib/database";

export interface CartItem {
  product: Product;
  quantity: number;
  selected?: boolean;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  toggleSelection: (productId: number) => void;
  toggleSelectAll: () => void;
  removeSelectedItems: () => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getSelectedItems: () => CartItem[];
  getSelectedTotal: () => number;
  isInCart: (productId: number) => boolean;
  hasSelectedItems: () => boolean;
  allItemsSelected: () => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "bekasberkah-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      try {
        setItems(JSON.parse(stored));
      } catch (error) {
        console.error("Failed to parse cart from localStorage:", error);
      }
    }
    setIsHydrated(true);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, isHydrated]);

  const addToCart = (product: Product, quantity = 1) => {
    setItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) => item.product.id === product.id
      );

      if (existingItem) {
        // Update quantity if item already exists
        return currentItems.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      // Add new item with selected = false by default
      return [...currentItems, { product, quantity, selected: false }];
    });
  };

  const removeFromCart = (productId: number) => {
    setItems((currentItems) =>
      currentItems.filter((item) => item.product.id !== productId)
    );
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const toggleSelection = (productId: number) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.product.id === productId
          ? { ...item, selected: !item.selected }
          : item
      )
    );
  };

  const toggleSelectAll = () => {
    const allSelected = items.every((item) => item.selected);
    setItems((currentItems) =>
      currentItems.map((item) => ({ ...item, selected: !allSelected }))
    );
  };

  const removeSelectedItems = () => {
    setItems((currentItems) => currentItems.filter((item) => !item.selected));
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return items.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  };

  const getSelectedItems = () => {
    return items.filter((item) => item.selected);
  };

  const getSelectedTotal = () => {
    return items
      .filter((item) => item.selected)
      .reduce((total, item) => total + item.product.price * item.quantity, 0);
  };

  const hasSelectedItems = () => {
    return items.some((item) => item.selected);
  };

  const allItemsSelected = () => {
    return items.length > 0 && items.every((item) => item.selected);
  };

  const isInCart = (productId: number) => {
    return items.some((item) => item.product.id === productId);
  };

  const value: CartContextType = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    toggleSelection,
    toggleSelectAll,
    removeSelectedItems,
    clearCart,
    getTotalItems,
    getTotalPrice,
    getSelectedItems,
    getSelectedTotal,
    isInCart,
    hasSelectedItems,
    allItemsSelected,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
