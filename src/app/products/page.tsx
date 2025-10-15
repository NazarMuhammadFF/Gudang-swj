"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Package, Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { CartDrawer } from "@/components/cart-drawer";
import { NavUserButton } from "@/components/nav-user-button";
import { db, Product } from "@/lib/database";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Filter states
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "all"
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000000]);
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "newest");

  // Data states
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);

      // Load all active products
      const products = await db.products
        .where("status")
        .equals("active")
        .toArray();

      setAllProducts(products);

      // Extract unique categories
      const uniqueCategories = [
        ...new Set(products.map((p) => p.category)),
      ].sort();
      setCategories(uniqueCategories);

      // Set price range based on actual products
      if (products.length > 0) {
        const prices = products.map((p) => p.price);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        setPriceRange([minPrice, maxPrice]);
      }

      setIsLoading(false);
    };

    void loadData();
  }, []);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = [...allProducts];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    // Price range filter
    filtered = filtered.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    // Sort
    switch (sortBy) {
      case "price-asc":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "newest":
      default:
        filtered.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
    }

    return filtered;
  }, [allProducts, searchQuery, selectedCategory, priceRange, sortBy]);

  // Update URL params
  useEffect(() => {
    const params = new URLSearchParams();

    if (searchQuery) params.set("q", searchQuery);
    if (selectedCategory !== "all") params.set("category", selectedCategory);
    if (sortBy !== "newest") params.set("sort", sortBy);

    const newUrl = params.toString()
      ? `/products?${params.toString()}`
      : "/products";

    router.replace(newUrl, { scroll: false });
  }, [searchQuery, selectedCategory, sortBy, router]);

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSortBy("newest");

    if (allProducts.length > 0) {
      const prices = allProducts.map((p) => p.price);
      setPriceRange([Math.min(...prices), Math.max(...prices)]);
    }
  };

  // Check if any filters are active
  const hasActiveFilters =
    searchQuery !== "" ||
    selectedCategory !== "all" ||
    sortBy !== "newest" ||
    (allProducts.length > 0 &&
      (priceRange[0] !== Math.min(...allProducts.map((p) => p.price)) ||
        priceRange[1] !== Math.max(...allProducts.map((p) => p.price))));

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
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="mb-2 text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            Jelajahi Produk
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            {isLoading
              ? "Memuat produk..."
              : `Menampilkan ${filteredProducts.length} dari ${allProducts.length} produk`}
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
              <Input
                type="text"
                placeholder="Cari produk berdasarkan nama, deskripsi, atau kategori..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button
              variant="outline"
              size="default"
              onClick={() => setShowFilters(!showFilters)}
              className="sm:w-auto"
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filter
              {hasActiveFilters && (
                <Badge className="ml-2 bg-emerald-600 px-1.5 py-0.5 text-xs">
                  Aktif
                </Badge>
              )}
            </Button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <Card className="p-4">
              <div className="grid gap-6 md:grid-cols-3">
                {/* Category Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Kategori
                  </label>
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Kategori</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort By */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Urutkan
                  </label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih urutan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Terbaru</SelectItem>
                      <SelectItem value="price-asc">
                        Harga: Rendah ke Tinggi
                      </SelectItem>
                      <SelectItem value="price-desc">
                        Harga: Tinggi ke Rendah
                      </SelectItem>
                      <SelectItem value="name-asc">Nama: A-Z</SelectItem>
                      <SelectItem value="name-desc">Nama: Z-A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Reset Button */}
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={handleResetFilters}
                    disabled={!hasActiveFilters}
                    className="w-full"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Reset Filter
                  </Button>
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Rentang Harga
                  </label>
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    {formatCurrency(priceRange[0])} -{" "}
                    {formatCurrency(priceRange[1])}
                  </span>
                </div>
                <Slider
                  min={
                    allProducts.length > 0
                      ? Math.min(...allProducts.map((p) => p.price))
                      : 0
                  }
                  max={
                    allProducts.length > 0
                      ? Math.max(...allProducts.map((p) => p.price))
                      : 50000000
                  }
                  step={100000}
                  value={priceRange}
                  onValueChange={(value) =>
                    setPriceRange(value as [number, number])
                  }
                  className="w-full"
                />
              </div>
            </Card>
          )}
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="mb-4 flex flex-wrap gap-2">
            {searchQuery && (
              <Badge variant="secondary" className="gap-1">
                Pencarian: &ldquo;{searchQuery}&rdquo;
                <button
                  onClick={() => setSearchQuery("")}
                  className="ml-1 hover:text-neutral-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {selectedCategory !== "all" && (
              <Badge variant="secondary" className="gap-1">
                Kategori: {selectedCategory}
                <button
                  onClick={() => setSelectedCategory("all")}
                  className="ml-1 hover:text-neutral-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {sortBy !== "newest" && (
              <Badge variant="secondary" className="gap-1">
                Urutan:{" "}
                {sortBy === "price-asc"
                  ? "Harga Rendah"
                  : sortBy === "price-desc"
                  ? "Harga Tinggi"
                  : sortBy === "name-asc"
                  ? "A-Z"
                  : "Z-A"}
                <button
                  onClick={() => setSortBy("newest")}
                  className="ml-1 hover:text-neutral-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        )}

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="aspect-square animate-pulse bg-neutral-200 dark:bg-neutral-800" />
                <CardContent className="space-y-2 p-4">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
                  <div className="h-6 w-1/2 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center">
            <Package className="mx-auto mb-4 h-16 w-16 text-neutral-300 dark:text-neutral-700" />
            <h3 className="mb-2 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
              Tidak ada produk ditemukan
            </h3>
            <p className="mb-6 text-neutral-600 dark:text-neutral-400">
              Coba ubah filter atau kata kunci pencarian Anda
            </p>
            <Button onClick={handleResetFilters}>Reset Filter</Button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <Card
                key={product.id}
                className="group overflow-hidden transition-shadow hover:shadow-lg"
              >
                <Link href={`/products/${product.id}`}>
                  <div className="relative aspect-square overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                    <Image
                      src={product.image || "/placeholder.png"}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      unoptimized
                    />
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
                </Link>
              </Card>
            ))}
          </div>
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
