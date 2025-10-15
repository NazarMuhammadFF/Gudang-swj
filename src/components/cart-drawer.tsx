"use client";

import { useCart } from "@/contexts/cart-context";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { ShoppingCart, Trash2, Plus, Minus, Package } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

export function CartDrawer() {
  const {
    items,
    removeFromCart,
    updateQuantity,
    toggleSelection,
    toggleSelectAll,
    removeSelectedItems,
    getTotalItems,
    getTotalPrice,
    hasSelectedItems,
    allItemsSelected,
  } = useCart();

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();
  const selectedItemsExist = hasSelectedItems();
  const allSelected = allItemsSelected();

  const handleRemoveSelected = () => {
    const selectedCount = items.filter((item) => item.selected).length;
    removeSelectedItems();
    toast.success("Produk dihapus", {
      description: `${selectedCount} produk telah dihapus dari keranjang`,
    });
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <ShoppingCart className="h-4 w-4" />
          {totalItems > 0 && (
            <Badge className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 p-0 text-[10px] font-medium text-white">
              {totalItems > 99 ? "99+" : totalItems}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col sm:max-w-xl lg:max-w-2xl">
        <SheetHeader className="space-y-2.5 pb-4">
          <SheetTitle className="text-xl font-bold">
            Keranjang Belanja
          </SheetTitle>
          <SheetDescription className="text-sm">
            {totalItems > 0
              ? `${totalItems} item dalam keranjang`
              : "Keranjang belanja Anda kosong"}
          </SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center py-12">
            <div className="rounded-full bg-neutral-100 p-6 dark:bg-neutral-800">
              <Package className="h-12 w-12 text-neutral-400 dark:text-neutral-600" />
            </div>
            <h3 className="mb-2 mt-6 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              Keranjang Kosong
            </h3>
            <p className="mb-8 max-w-xs text-center text-sm text-neutral-600 dark:text-neutral-400">
              Belum ada produk di keranjang Anda. Mulai berbelanja sekarang dan
              temukan produk berkualitas!
            </p>
            <SheetTrigger asChild>
              <Button size="lg" asChild>
                <Link href="/products">Jelajah Produk</Link>
              </Button>
            </SheetTrigger>
          </div>
        ) : (
          <>
            {/* Select All Checkbox */}
            {items.length > 1 && (
              <div className="flex items-center gap-3 rounded-lg border bg-neutral-50 px-4 py-3 dark:bg-neutral-900">
                <Checkbox
                  id="select-all"
                  checked={allSelected}
                  onCheckedChange={toggleSelectAll}
                />
                <label
                  htmlFor="select-all"
                  className="flex-1 cursor-pointer text-sm font-medium text-neutral-700 dark:text-neutral-300"
                >
                  Pilih Semua ({items.length} item)
                </label>
              </div>
            )}

            {/* Cart Items */}
            <div className="flex-1 space-y-3 overflow-y-auto py-4">
              {items.map((item) => (
                <div
                  key={item.product.id}
                  className={`group relative rounded-lg border p-4 transition-all ${
                    item.selected
                      ? "border-emerald-500 bg-emerald-50/50 dark:border-emerald-600 dark:bg-emerald-950/20"
                      : "border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
                  }`}
                >
                  <div className="flex gap-4">
                    {/* Checkbox */}
                    <div className="flex items-start pt-1">
                      <Checkbox
                        id={`item-${item.product.id}`}
                        checked={item.selected || false}
                        onCheckedChange={() =>
                          toggleSelection(item.product.id!)
                        }
                      />
                    </div>

                    {/* Product Image */}
                    <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800">
                      <Image
                        src={item.product.image || "/placeholder.png"}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex flex-1 flex-col">
                      {/* Product Name & Remove Button */}
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h4 className="line-clamp-2 text-sm font-semibold leading-snug text-neutral-900 dark:text-neutral-100">
                            {item.product.name}
                          </h4>
                          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                            {item.product.category}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            removeFromCart(item.product.id!);
                            toast.success("Produk dihapus dari keranjang");
                          }}
                          className="text-neutral-400 transition-colors hover:text-red-600 dark:text-neutral-600 dark:hover:text-red-500"
                          title="Hapus item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Price & Quantity Controls */}
                      <div className="mt-auto flex items-center justify-between">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              updateQuantity(
                                item.product.id!,
                                item.quantity - 1
                              )
                            }
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <div className="flex h-8 w-12 items-center justify-center rounded-md border bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800">
                            <span className="text-sm font-medium">
                              {item.quantity}
                            </span>
                          </div>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              updateQuantity(
                                item.product.id!,
                                item.quantity + 1
                              )
                            }
                            disabled={item.quantity >= 99}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        {/* Item Price */}
                        <div className="text-right">
                          <p className="text-base font-bold text-emerald-600 dark:text-emerald-500">
                            {formatCurrency(item.product.price * item.quantity)}
                          </p>
                          {item.quantity > 1 && (
                            <p className="text-xs text-neutral-500">
                              {formatCurrency(item.product.price)} / item
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Separator />

            {/* Cart Footer */}
            <div className="space-y-4 pt-4">
              {/* Delete Selected Button */}
              {selectedItemsExist && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveSelected}
                  className="w-full text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Hapus {items.filter((item) => item.selected).length} Produk
                  Terpilih
                </Button>
              )}

              {/* Total Summary */}
              <div className="space-y-3 rounded-lg bg-neutral-50 p-4 dark:bg-neutral-900">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600 dark:text-neutral-400">
                    Subtotal ({totalItems} item)
                  </span>
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">
                    {formatCurrency(totalPrice)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                    Total
                  </span>
                  <span className="text-xl font-bold text-emerald-600 dark:text-emerald-500">
                    {formatCurrency(totalPrice)}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <SheetTrigger asChild>
                <Button asChild size="lg" className="w-full">
                  <Link href="/checkout">Lanjut ke Pembayaran</Link>
                </Button>
              </SheetTrigger>

              <p className="text-center text-xs text-neutral-500 dark:text-neutral-400">
                Gratis ongkir untuk pembelian di atas Rp 500.000
              </p>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
