"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Package,
  ArrowLeft,
  CreditCard,
  Truck,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { useCart } from "@/contexts/cart-context";
import { db } from "@/lib/database";
import { CartDrawer } from "@/components/cart-drawer";
import { NavUserButton } from "@/components/nav-user-button";
import {
  DEMO_USER_EVENT,
  isDemoUserLoggedIn,
  loadDemoProfile,
} from "@/lib/demo-user";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

const extractCityFromAddress = (address?: string) => {
  if (!address) {
    return "";
  }
  const segments = address.split(",");
  return segments[segments.length - 1]?.trim() ?? "";
};

interface CheckoutForm {
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  paymentMethod: string;
  notes: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart, getTotalPrice } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState<CheckoutForm>({
    customerName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    paymentMethod: "cod",
    notes: "",
  });

  const applyProfileToCheckoutForm = useCallback(() => {
    if (!isDemoUserLoggedIn()) {
      return;
    }
    const profile = loadDemoProfile();
    const derivedCity = extractCityFromAddress(profile.address);
    setFormData((previous) => ({
      ...previous,
      customerName: previous.customerName || profile.name,
      email: profile.email,
      phone: profile.phone,
      address: previous.address || profile.address,
      city: previous.city || derivedCity,
    }));
  }, []);

  useEffect(() => {
    applyProfileToCheckoutForm();

    if (typeof window === "undefined") {
      return;
    }

    const handleProfileChange = () => {
      applyProfileToCheckoutForm();
    };

    window.addEventListener(DEMO_USER_EVENT, handleProfileChange);
    window.addEventListener("storage", handleProfileChange);

    return () => {
      window.removeEventListener(DEMO_USER_EVENT, handleProfileChange);
      window.removeEventListener("storage", handleProfileChange);
    };
  }, [applyProfileToCheckoutForm]);

  const totalPrice = getTotalPrice();

  useEffect(() => {
    // Redirect to products if cart is empty
    if (items.length === 0) {
      router.push("/products");
    }
  }, [items, router]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Validate form
      if (
        !formData.customerName ||
        !formData.email ||
        !formData.phone ||
        !formData.address ||
        !formData.city
      ) {
        toast.error("Mohon lengkapi semua field yang wajib diisi");
        setIsProcessing(false);
        return;
      }

      // Generate order number
      const orderNumber = `ORD-${Date.now()}`;
      const now = new Date();
      const profile = isDemoUserLoggedIn() ? loadDemoProfile() : null;
      const customerName =
        formData.customerName || profile?.name || "Pelanggan BekasBerkah";
      const customerEmail = profile?.email ?? formData.email;
      const customerPhone = profile?.phone ?? formData.phone;
      const typedAddress = [formData.address, formData.city, formData.postalCode]
        .map((part) => part?.trim())
        .filter(Boolean)
        .join(", ");
      const shippingAddress =
        typedAddress || profile?.address || "Alamat belum diisi";

      // Create order in database
      const orderId = await db.orders.add({
        orderNumber,
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress,
        items: items.map((item) => ({
          productId: item.product.id!,
          productName: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
        })),
        totalAmount: totalPrice,
        status: "pending",
        paymentMethod: formData.paymentMethod,
        notes: formData.notes,
        createdAt: now,
        updatedAt: now,
        email: customerEmail,
        total: totalPrice,
      });

      // Clear cart
      clearCart();

      // Show success message
      toast.success("Pesanan berhasil dibuat!", {
        description: `Nomor pesanan: ${orderNumber}`,
      });

      // Redirect to success page
      router.push(
        `/checkout/success?orderId=${orderId}&orderNumber=${orderNumber}`
      );
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Gagal membuat pesanan", {
        description: "Silakan coba lagi",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
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
      <main className="container mx-auto px-4 py-8 md:px-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          className="mb-6"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            Checkout
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Lengkapi informasi pengiriman untuk melanjutkan pesanan
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-emerald-600" />
                    Informasi Pelanggan
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="customerName">
                        Nama Lengkap <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="customerName"
                        name="customerName"
                        placeholder="John Doe"
                        value={formData.customerName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">
                        Email <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      Nomor Telepon <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="08123456789"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-emerald-600" />
                    Alamat Pengiriman
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">
                      Alamat Lengkap <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="address"
                      name="address"
                      placeholder="Jl. Contoh No. 123"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="city">
                        Kota <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="city"
                        name="city"
                        placeholder="Jakarta"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Kode Pos</Label>
                      <Input
                        id="postalCode"
                        name="postalCode"
                        placeholder="12345"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Catatan Tambahan</Label>
                    <textarea
                      id="notes"
                      name="notes"
                      rows={3}
                      className="flex w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-950 dark:ring-offset-neutral-950 dark:placeholder:text-neutral-400"
                      placeholder="Patokan atau instruksi khusus pengiriman..."
                      value={formData.notes}
                      onChange={handleInputChange}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-emerald-600" />
                    Metode Pembayaran
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={formData.paymentMethod}
                    onValueChange={(value: string) =>
                      setFormData({ ...formData, paymentMethod: value })
                    }
                  >
                    <div className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-neutral-50 dark:hover:bg-neutral-900">
                      <RadioGroupItem value="cod" id="cod" />
                      <Label htmlFor="cod" className="flex-1 cursor-pointer">
                        <div className="font-semibold">
                          Cash on Delivery (COD)
                        </div>
                        <div className="text-sm text-neutral-500">
                          Bayar saat barang diterima
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-neutral-50 dark:hover:bg-neutral-900">
                      <RadioGroupItem value="transfer" id="transfer" />
                      <Label
                        htmlFor="transfer"
                        className="flex-1 cursor-pointer"
                      >
                        <div className="font-semibold">Transfer Bank</div>
                        <div className="text-sm text-neutral-500">
                          Transfer ke rekening toko
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-neutral-50 dark:hover:bg-neutral-900">
                      <RadioGroupItem value="ewallet" id="ewallet" />
                      <Label
                        htmlFor="ewallet"
                        className="flex-1 cursor-pointer"
                      >
                        <div className="font-semibold">E-Wallet</div>
                        <div className="text-sm text-neutral-500">
                          GoPay, OVO, Dana, dll
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Ringkasan Pesanan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Cart Items */}
                <div className="max-h-64 space-y-3 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex gap-3">
                      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-neutral-100 dark:bg-neutral-800">
                        <Image
                          src={item.product.image || "/placeholder.png"}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        <h4 className="line-clamp-2 text-sm font-medium">
                          {item.product.name}
                        </h4>
                        <p className="text-xs text-neutral-500">
                          {item.quantity} x {formatCurrency(item.product.price)}
                        </p>
                      </div>
                      <div className="text-sm font-semibold">
                        {formatCurrency(item.product.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600 dark:text-neutral-400">
                      Subtotal
                    </span>
                    <span className="font-medium">
                      {formatCurrency(totalPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600 dark:text-neutral-400">
                      Ongkir
                    </span>
                    <span className="font-medium">Gratis</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-base font-bold">
                    <span>Total</span>
                    <span className="text-emerald-600">
                      {formatCurrency(totalPrice)}
                    </span>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  size="lg"
                  className="w-full"
                  onClick={handleSubmit}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Buat Pesanan
                    </>
                  )}
                </Button>

                <p className="text-center text-xs text-neutral-500">
                  Dengan melanjutkan, Anda menyetujui syarat dan ketentuan kami
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
