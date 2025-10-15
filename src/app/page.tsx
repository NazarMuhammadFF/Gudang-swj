"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Heart, Package, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { CartDrawer } from "@/components/cart-drawer";
import { NavUserButton } from "@/components/nav-user-button";
import { db, Product } from "@/lib/database";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      const allProducts = await db.products
        .where("status")
        .equals("active")
        .reverse()
        .sortBy("createdAt");

      setProducts(allProducts.slice(0, 12)); // Show first 12 products
      setFeaturedProducts(allProducts.slice(0, 4)); // Featured 4 products
      setIsLoading(false);
    };

    void loadProducts();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-950 dark:to-neutral-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-md dark:bg-neutral-900/80">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <Package className="h-6 w-6 text-emerald-600" />
            <span className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
              BekasBerkah
            </span>
          </Link>

          <div className="hidden flex-1 max-w-md mx-8 md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <Input
                placeholder="Cari produk bekas berkualitas..."
                className="pl-10"
              />
            </div>
          </div>

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

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 md:px-6 md:py-20">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="flex flex-col justify-center space-y-6">
            <div className="space-y-4">
              <Badge className="w-fit bg-emerald-100 text-emerald-700 hover:bg-emerald-200">
                Platform Jual Beli Terpercaya
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 md:text-5xl lg:text-6xl">
                Beri Kehidupan Kedua pada Barang Bekas Anda
              </h1>
              <p className="text-lg text-neutral-600 dark:text-neutral-400">
                Temukan barang bekas berkualitas dengan harga terbaik. Semua
                produk telah dikurasi oleh tim kami untuk menjamin kualitas dan
                keaslian.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild className="w-full sm:w-auto">
                <Link href="/products">
                  <Search className="mr-2 h-4 w-4" />
                  Jelajahi Produk
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="w-full sm:w-auto"
              >
                <Link href="/sell">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Jual Barang Anda
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {isLoading ? (
              <>
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-48 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-800"
                  />
                ))}
              </>
            ) : (
              <>
                {featuredProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className={`group relative overflow-hidden rounded-lg ${
                      index === 0 ? "col-span-2" : ""
                    }`}
                  >
                    <Image
                      src={product.image || "/placeholder.png"}
                      alt={product.name}
                      width={400}
                      height={index === 0 ? 400 : 200}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-4 text-white">
                      <p className="text-sm font-medium">{product.category}</p>
                      <p className="text-lg font-semibold">{product.name}</p>
                      <p className="text-sm">{formatCurrency(product.price)}</p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y bg-neutral-100/50 dark:bg-neutral-900/50">
        <div className="container mx-auto px-4 py-8 md:px-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-8">
            <div className="text-center">
              <p className="text-3xl font-bold text-emerald-600 md:text-4xl">
                {products.length}+
              </p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Produk Tersedia
              </p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-emerald-600 md:text-4xl">
                100%
              </p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Produk Terkurasi
              </p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-emerald-600 md:text-4xl">
                1000+
              </p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Pelanggan Puas
              </p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-emerald-600 md:text-4xl">
                24/7
              </p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Layanan Support
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="container mx-auto px-4 py-12 md:px-6 md:py-16">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 md:text-3xl">
              Produk Terbaru
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Temukan barang bekas berkualitas dengan harga terbaik
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/products">Lihat Semua</Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Card key={i} className="overflow-hidden">
                <div className="h-48 animate-pulse bg-neutral-200 dark:bg-neutral-800" />
                <CardContent className="p-4">
                  <div className="mb-2 h-4 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
                  <div className="h-6 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Package className="mb-4 h-16 w-16 text-neutral-300" />
            <h3 className="mb-2 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              Belum Ada Produk
            </h3>
            <p className="mb-4 text-sm text-neutral-600 dark:text-neutral-400">
              Produk akan segera hadir. Kembali lagi nanti!
            </p>
            <Button asChild>
              <Link href="/admin">Tambah Produk di Admin</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <Card
                key={product.id}
                className="group overflow-hidden transition-shadow hover:shadow-lg"
              >
                <div className="relative aspect-square overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                  <Image
                    src={product.image || "/placeholder.png"}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    unoptimized
                  />
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
                <CardContent className="p-4">
                  <p className="mb-1 text-xs text-neutral-500">
                    {product.category}
                  </p>
                  <h3 className="mb-2 line-clamp-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    {product.name}
                  </h3>
                  <p className="text-lg font-bold text-emerald-600">
                    {formatCurrency(product.price)}
                  </p>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button className="w-full" size="sm" asChild>
                    <Link href={`/products/${product.id}`}>Lihat Detail</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="border-t bg-emerald-50 dark:bg-emerald-950/20">
        <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-2xl font-bold text-neutral-900 dark:text-neutral-100 md:text-3xl">
              Punya Barang Bekas yang Ingin Dijual?
            </h2>
            <p className="mb-6 text-neutral-600 dark:text-neutral-400">
              Ajukan barang Anda sekarang! Tim kami akan mengurasi dan membantu
              Anda menjualnya dengan harga terbaik.
            </p>
            <Button size="lg" asChild>
              <Link href="/sell">
                <TrendingUp className="mr-2 h-4 w-4" />
                Mulai Jual Sekarang
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-neutral-900 text-neutral-100">
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
                <li>
                  <Link href="/about" className="hover:text-emerald-500">
                    Tentang Kami
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
                <li>
                  <Link href="/help" className="hover:text-emerald-500">
                    Bantuan
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-semibold">Kontak</h3>
              <ul className="space-y-2 text-sm text-neutral-400">
                <li>Email: hello@bekasberkah.id</li>
                <li>WhatsApp: +62 812-3456-7890</li>
                <li>Instagram: @bekasberkah</li>
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
