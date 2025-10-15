"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Package,
  Heart,
  Share2,
  ShoppingCart,
  ArrowLeft,
  Check,
  Truck,
  Shield,
  RefreshCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { db, Product } from "@/lib/database";
import { useCart } from "@/contexts/cart-context";
import { CartDrawer } from "@/components/cart-drawer";
import { NavUserButton } from "@/components/nav-user-button";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const loadProduct = async () => {
      setIsLoading(true);
      const productId = Number(params.id);

      if (Number.isNaN(productId)) {
        router.push("/products");
        return;
      }

      const foundProduct = await db.products.get(productId);

      if (!foundProduct || foundProduct.status !== "active") {
        router.push("/products");
        return;
      }

      setProduct(foundProduct);

      // Load related products from same category
      const related = await db.products
        .where("category")
        .equals(foundProduct.category)
        .and((p) => p.id !== productId && p.status === "active")
        .limit(4)
        .toArray();

      setRelatedProducts(related);
      setIsLoading(false);
    };

    void loadProduct();
  }, [params.id, router]);

  const handleAddToCart = () => {
    if (!product) return;

    addToCart(product, quantity);
    toast.success("Berhasil ditambahkan!", {
      description: `${quantity} ${product.name} telah ditambahkan ke keranjang`,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8 h-8 w-32 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="aspect-square animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-800" />
            <div className="space-y-4">
              <div className="h-8 w-3/4 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
              <div className="h-6 w-1/4 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
              <div className="h-12 w-1/3 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
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
        {/* Breadcrumb */}
        <div className="mb-8 flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
          <Link href="/" className="hover:text-emerald-600">
            Beranda
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-emerald-600">
            Produk
          </Link>
          <span>/</span>
          <Link
            href={`/products?category=${product.category}`}
            className="hover:text-emerald-600"
          >
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-neutral-900 dark:text-neutral-100">
            {product.name}
          </span>
        </div>

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

        {/* Product Detail */}
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-lg border bg-white dark:bg-neutral-900">
              <Image
                src={product.image || "/placeholder.png"}
                alt={product.name}
                fill
                className="object-cover"
                unoptimized
                priority
              />
              <Button
                size="icon"
                variant="secondary"
                className="absolute right-4 top-4"
              >
                <Heart className="h-4 w-4" />
              </Button>
            </div>

            {/* Thumbnail Gallery - Placeholder for future implementation */}
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="relative aspect-square cursor-pointer overflow-hidden rounded-md border bg-neutral-100 opacity-50 dark:bg-neutral-800"
                >
                  <Image
                    src={product.image || "/placeholder.png"}
                    alt={`${product.name} thumbnail ${i}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <Badge className="mb-2 bg-emerald-100 text-emerald-700">
                {product.category}
              </Badge>
              <h1 className="mb-2 text-3xl font-bold text-neutral-900 dark:text-neutral-100 md:text-4xl">
                {product.name}
              </h1>
              <div className="flex items-baseline gap-3">
                <p className="text-3xl font-bold text-emerald-600 md:text-4xl">
                  {formatCurrency(product.price)}
                </p>
              </div>
            </div>

            <Separator />

            {/* Description */}
            <div>
              <h2 className="mb-2 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                Deskripsi Produk
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400">
                {product.description}
              </p>
            </div>

            <Separator />

            {/* Features */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-400">
                <Check className="h-5 w-5 text-emerald-600" />
                <span>Produk telah dikurasi dan diverifikasi</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-400">
                <Shield className="h-5 w-5 text-emerald-600" />
                <span>Garansi keaslian produk</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-400">
                <Truck className="h-5 w-5 text-emerald-600" />
                <span>Pengiriman cepat dan aman</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-400">
                <RefreshCcw className="h-5 w-5 text-emerald-600" />
                <span>Kebijakan pengembalian 7 hari</span>
              </div>
            </div>

            <Separator />

            {/* Quantity & Add to Cart */}
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="quantity"
                  className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
                >
                  Jumlah
                </label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </Button>
                  <input
                    id="quantity"
                    type="number"
                    min="1"
                    max="10"
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(
                        Math.max(1, Math.min(10, Number(e.target.value)))
                      )
                    }
                    className="w-16 rounded-md border border-neutral-300 bg-white px-3 py-2 text-center text-sm dark:border-neutral-700 dark:bg-neutral-900"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.min(10, quantity + 1))}
                  >
                    +
                  </Button>
                </div>
              </div>

              <div className="flex gap-3">
                <Button size="lg" className="flex-1" onClick={handleAddToCart}>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Tambah ke Keranjang
                </Button>
                <Button size="lg" variant="outline">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Additional Info Card */}
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-600 dark:text-neutral-400">
                      Kondisi
                    </span>
                    <span className="font-medium">Bekas - Berkualitas</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600 dark:text-neutral-400">
                      Kategori
                    </span>
                    <span className="font-medium">{product.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600 dark:text-neutral-400">
                      Status
                    </span>
                    <Badge className="bg-emerald-100 text-emerald-700">
                      Tersedia
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  Produk Terkait
                </h2>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Produk lain dari kategori {product.category}
                </p>
              </div>
              <Button variant="outline" asChild>
                <Link href={`/products?category=${product.category}`}>
                  Lihat Semua
                </Link>
              </Button>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((relatedProduct) => (
                <Card
                  key={relatedProduct.id}
                  className="group overflow-hidden transition-shadow hover:shadow-lg"
                >
                  <Link href={`/products/${relatedProduct.id}`}>
                    <div className="relative aspect-square overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                      <Image
                        src={relatedProduct.image || "/placeholder.png"}
                        alt={relatedProduct.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        unoptimized
                      />
                    </div>
                    <CardContent className="p-4">
                      <p className="mb-1 text-xs text-neutral-500">
                        {relatedProduct.category}
                      </p>
                      <h3 className="mb-2 line-clamp-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                        {relatedProduct.name}
                      </h3>
                      <p className="text-lg font-bold text-emerald-600">
                        {formatCurrency(relatedProduct.price)}
                      </p>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t bg-neutral-900 text-neutral-100">
        <div className="container mx-auto px-4 py-8 md:px-6">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <Package className="h-6 w-6 text-emerald-500" />
                <span className="text-lg font-bold">BekasBerkah</span>
              </div>
              <p className="text-sm text-neutral-400">
                Platform jual beli barang bekas terpercaya dengan kurasi
                kualitas terbaik.
              </p>
            </div>
            <div>
              <h3 className="mb-4 font-semibold">Jelajah</h3>
              <ul className="space-y-2 text-sm text-neutral-400">
                <li>
                  <Link href="/products" className="hover:text-emerald-500">
                    Produk
                  </Link>
                </li>
                <li>
                  <Link href="/categories" className="hover:text-emerald-500">
                    Kategori
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-semibold">Layanan</h3>
              <ul className="space-y-2 text-sm text-neutral-400">
                <li>
                  <Link href="/sell" className="hover:text-emerald-500">
                    Jual Barang
                  </Link>
                </li>
                <li>
                  <Link href="/account" className="hover:text-emerald-500">
                    Akun Saya
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-semibold">Kontak</h3>
              <ul className="space-y-2 text-sm text-neutral-400">
                <li>Email: hello@bekasberkah.id</li>
                <li>WhatsApp: +62 812-3456-7890</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-neutral-800 pt-8 text-center text-sm text-neutral-500">
            <p>&copy; 2025 BekasBerkah. Template Demo E-commerce.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
