"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Package,
  CheckCircle2,
  ArrowRight,
  Home,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { db, Order } from "@/lib/database";
import { CartDrawer } from "@/components/cart-drawer";
import { NavUserButton } from "@/components/nav-user-button";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const orderId = searchParams.get("orderId");
  const orderNumber = searchParams.get("orderNumber");

  useEffect(() => {
    const loadOrder = async () => {
      if (!orderId) {
        router.push("/");
        return;
      }

      try {
        const foundOrder = await db.orders.get(Number(orderId));
        if (foundOrder) {
          setOrder(foundOrder);
        } else {
          router.push("/");
        }
      } catch (error) {
        console.error("Error loading order:", error);
        router.push("/");
      } finally {
        setIsLoading(false);
      }
    };

    void loadOrder();
  }, [orderId, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-md dark:bg-neutral-900/80">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <Package className="h-6 w-6 text-emerald-600" />
            <span className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
              BekasBerkah
            </span>
          </Link>
          <nav className="flex items-center gap-2 md:gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/products">Jelajah</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/sell">Jual Barang</Link>
            </Button>
            <CartDrawer />
            <NavUserButton />
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 md:px-6">
        <div className="mx-auto max-w-2xl">
          {/* Success Icon */}
          <div className="mb-8 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
              <CheckCircle2 className="h-12 w-12 text-emerald-600" />
            </div>
          </div>

          {/* Success Message */}
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              Pesanan Berhasil Dibuat!
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Terima kasih telah berbelanja di BekasBerkah. Pesanan Anda sedang
              diproses.
            </p>
          </div>

          {/* Order Details Card */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="mb-6">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    Nomor Pesanan
                  </span>
                  <Badge className="bg-emerald-600 text-white">
                    {order.status === "pending"
                      ? "Menunggu Konfirmasi"
                      : order.status}
                  </Badge>
                </div>
                <p className="text-2xl font-bold text-emerald-600">
                  {orderNumber || order.orderNumber}
                </p>
              </div>

              <Separator className="my-6" />

              {/* Customer Info */}
              <div className="mb-6 space-y-3">
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                  Informasi Pelanggan
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-600 dark:text-neutral-400">
                      Nama
                    </span>
                    <span className="font-medium">{order.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600 dark:text-neutral-400">
                      Email
                    </span>
                    <span className="font-medium">{order.customerEmail}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600 dark:text-neutral-400">
                      Telepon
                    </span>
                    <span className="font-medium">{order.customerPhone}</span>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Shipping Address */}
              <div className="mb-6 space-y-3">
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                  Alamat Pengiriman
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {order.shippingAddress}
                </p>
              </div>

              <Separator className="my-6" />

              {/* Order Items */}
              <div className="mb-6 space-y-3">
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                  Produk yang Dipesan ({order.items?.length || 0} item)
                </h3>
                <div className="space-y-2">
                  {order.items?.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <div>
                        <span className="font-medium">{item.productName}</span>
                        <span className="text-neutral-500">
                          {" "}
                          x {item.quantity}
                        </span>
                      </div>
                      <span className="font-medium">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="my-6" />

              {/* Payment Info */}
              <div className="mb-6 space-y-3">
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                  Metode Pembayaran
                </h3>
                <p className="text-sm capitalize">
                  {order.paymentMethod === "cod"
                    ? "Cash on Delivery (COD)"
                    : order.paymentMethod === "transfer"
                    ? "Transfer Bank"
                    : "E-Wallet"}
                </p>
              </div>

              <Separator className="my-6" />

              {/* Total */}
              <div className="flex justify-between text-lg font-bold">
                <span>Total Pembayaran</span>
                <span className="text-emerald-600">
                  {formatCurrency(order.totalAmount || order.total || 0)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Info Box */}
          <Card className="mb-8 border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30">
            <CardContent className="p-4">
              <h4 className="mb-2 font-semibold text-emerald-900 dark:text-emerald-100">
                Langkah Selanjutnya
              </h4>
              <ul className="space-y-1 text-sm text-emerald-800 dark:text-emerald-200">
                <li>• Kami akan menghubungi Anda untuk konfirmasi pesanan</li>
                <li>• Pesanan akan diproses dalam 1-2 hari kerja</li>
                <li>• Anda akan menerima notifikasi saat pesanan dikirim</li>
                <li>
                  • Simpan nomor pesanan untuk tracking:{" "}
                  <strong>{orderNumber || order.orderNumber}</strong>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="flex-1">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Kembali ke Beranda
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="flex-1">
              <Link href="/products">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Belanja Lagi
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
