"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Package,
  Inbox,
  Shapes,
  TrendingUp,
  RefreshCcw,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { db, Product, Category, Submission, Order } from "@/lib/database";
import { seedDatabase, clearDatabase, resetDatabase } from "@/lib/seed-data";

type DashboardStats = {
  totalProducts: number;
  activeProducts: number;
  categories: number;
  pendingSubmissions: number;
  processingOrders: number;
  totalOrderValue: number;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

const statusBadgeVariants: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  inactive: "bg-neutral-100 text-neutral-600",
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-rose-100 text-rose-700",
  processing: "bg-sky-100 text-sky-700",
  shipped: "bg-indigo-100 text-indigo-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-neutral-200 text-neutral-600",
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    activeProducts: 0,
    categories: 0,
    pendingSubmissions: 0,
    processingOrders: 0,
    totalOrderValue: 0,
  });
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [recentSubmissions, setRecentSubmissions] = useState<Submission[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    const [productList, categoryList, submissionList, orderList] =
      await Promise.all([
        db.products.orderBy("createdAt").reverse().toArray(),
        db.categories.orderBy("createdAt").reverse().toArray(),
        db.submissions.orderBy("createdAt").reverse().toArray(),
        db.orders.orderBy("createdAt").reverse().toArray(),
      ]);

    const activeProducts = productList.filter(
      (product) => product.status === "active"
    ).length;

    const pendingSubmissions = submissionList.filter(
      (submission) => submission.status === "pending"
    ).length;

    const processingOrders = orderList.filter(
      (order) => !["delivered", "cancelled"].includes(order.status)
    ).length;

    const totalOrderValue = orderList.reduce(
      (accumulator, current) =>
        accumulator + (current.totalAmount || current.total || 0),
      0
    );

    setStats({
      totalProducts: productList.length,
      activeProducts,
      categories: categoryList.length,
      pendingSubmissions,
      processingOrders,
      totalOrderValue,
    });
    setRecentProducts(productList.slice(0, 5));
    setRecentSubmissions(submissionList.slice(0, 5));
    setRecentOrders(orderList.slice(0, 5));
    setCategories(categoryList);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void loadDashboardData();
  }, [loadDashboardData]);

  const handleSeedDatabase = async () => {
    if (
      !confirm(
        "Apakah Anda yakin ingin mengisi database dengan data dummy? Ini akan menambahkan banyak produk, kategori, pengajuan, dan pesanan."
      )
    ) {
      return;
    }

    setIsSeeding(true);
    const result = await seedDatabase();
    setIsSeeding(false);

    if (result.success) {
      alert(
        `✅ Database berhasil diisi!\n\nData yang ditambahkan:\n- ${
          result.counts?.categories ?? 0
        } Kategori\n- ${result.counts?.products ?? 0} Produk\n- ${
          result.counts?.submissions ?? 0
        } Pengajuan\n- ${result.counts?.orders ?? 0} Pesanan`
      );
      await loadDashboardData();
    } else {
      alert(`❌ Gagal mengisi database: ${result.message}`);
    }
  };

  const handleClearDatabase = async () => {
    if (
      !confirm(
        "⚠️ PERHATIAN: Ini akan menghapus SEMUA data dari database!\n\nApakah Anda yakin ingin melanjutkan?"
      )
    ) {
      return;
    }

    setIsSeeding(true);
    const result = await clearDatabase();
    setIsSeeding(false);

    if (result.success) {
      alert("✅ Database berhasil dikosongkan!");
      await loadDashboardData();
    } else {
      alert(`❌ Gagal mengosongkan database: ${result.message}`);
    }
  };

  const handleResetDatabase = async () => {
    if (
      !confirm(
        "⚠️ PERHATIAN: Ini akan menghapus semua data dan mengisi ulang dengan data dummy!\n\nApakah Anda yakin ingin melanjutkan?"
      )
    ) {
      return;
    }

    setIsSeeding(true);
    const result = await resetDatabase();
    setIsSeeding(false);

    if (result.success) {
      alert(
        `✅ Database berhasil direset!\n\nData baru:\n- ${
          result.counts?.categories ?? 0
        } Kategori\n- ${result.counts?.products ?? 0} Produk\n- ${
          result.counts?.submissions ?? 0
        } Pengajuan\n- ${result.counts?.orders ?? 0} Pesanan`
      );
      await loadDashboardData();
    } else {
      alert(`❌ Gagal mereset database: ${result.message}`);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
            Ringkasan Operasional
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Pantau aktivitas terkini dari inventori, pengajuan penjual, dan
            pesanan.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => void loadDashboardData()}
            disabled={isLoading || isSeeding}
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            {isLoading ? "Memuat..." : "Segarkan"}
          </Button>
          <Button
            variant="outline"
            onClick={() => void handleSeedDatabase()}
            disabled={isSeeding || isLoading}
          >
            {isSeeding ? "Memproses..." : "Isi Data Dummy"}
          </Button>
          <Button
            variant="outline"
            onClick={() => void handleResetDatabase()}
            disabled={isSeeding || isLoading}
          >
            {isSeeding ? "Memproses..." : "Reset Database"}
          </Button>
          <Button
            variant="destructive"
            onClick={() => void handleClearDatabase()}
            disabled={isSeeding || isLoading}
          >
            {isSeeding ? "Memproses..." : "Hapus Semua Data"}
          </Button>
          <Button asChild disabled={isSeeding || isLoading}>
            <Link href="/admin/products">
              <ArrowUpRight className="mr-2 h-4 w-4" />
              Tambah Produk
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Produk"
          description="Jumlah listing aktif dan non-aktif"
          value={stats.totalProducts.toLocaleString("id-ID")}
          trendLabel={`${stats.activeProducts} aktif`}
          icon={<Package className="h-4 w-4" />}
        />
        <StatCard
          title="Kategori"
          description="Total kategori kurasi"
          value={stats.categories.toLocaleString("id-ID")}
          trendLabel={
            categories.length > 0
              ? `${categories[0]?.name ?? ""} ditambahkan terbaru`
              : "Belum ada kategori"
          }
          icon={<Shapes className="h-4 w-4" />}
        />
        <StatCard
          title="Pengajuan Pending"
          description="Menunggu review admin"
          value={stats.pendingSubmissions.toLocaleString("id-ID")}
          trendLabel="Prioritaskan review hari ini"
          icon={<Inbox className="h-4 w-4" />}
        />
        <StatCard
          title="Nilai Pesanan"
          description="Total nilai transaksi"
          value={formatCurrency(stats.totalOrderValue)}
          trendLabel={`${stats.processingOrders} dalam proses`}
          icon={<TrendingUp className="h-4 w-4" />}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        <Card className="col-span-1 xl:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl md:text-2xl">
                Produk Terbaru
              </CardTitle>
              <CardDescription className="text-xs md:text-sm">
                5 produk terakhir yang masuk sistem
              </CardDescription>
            </div>
            <Button variant="link" asChild className="px-0 text-xs md:text-sm">
              <Link href="/admin/products">Lihat semua</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[150px]">Produk</TableHead>
                    <TableHead className="hidden min-w-[100px] sm:table-cell">
                      Kategori
                    </TableHead>
                    <TableHead className="min-w-[80px]">Status</TableHead>
                    <TableHead className="min-w-[100px] text-right">
                      Harga
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentProducts.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="py-6 text-center text-xs text-neutral-500 sm:text-sm"
                      >
                        Belum ada produk. Tambahkan produk pertama Anda.
                      </TableCell>
                    </TableRow>
                  )}
                  {recentProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">
                        <span className="line-clamp-2">{product.name}</span>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {product.category || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            statusBadgeVariants[product.status] ??
                            "bg-neutral-100 text-neutral-600"
                          }
                        >
                          {product.status === "active" ? "Aktif" : "Non-aktif"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(product.price)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl md:text-2xl">Menu Cepat</CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Kelola modul utama dalam satu klik
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <QuickLinkCard
              title="Kelola Produk"
              description="Atur stok, harga, dan status produk"
              href="/admin/products"
            />
            <QuickLinkCard
              title="Kurasi Pengajuan"
              description="Review barang yang diajukan penjual"
              href="/admin/submissions"
            />
            <QuickLinkCard
              title="Atur Kategori"
              description="Bangun struktur kategori yang rapi"
              href="/admin/categories"
            />
            <QuickLinkCard
              title="Proses Pesanan"
              description="Pantau dan perbarui status pemesanan"
              href="/admin/orders"
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl md:text-2xl">
              Antrian Pengajuan Penjual
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Prioritaskan pengajuan yang paling awal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[120px]">Penjual</TableHead>
                    <TableHead className="min-w-[150px]">Produk</TableHead>
                    <TableHead className="min-w-[100px]">Status</TableHead>
                    <TableHead className="hidden min-w-[100px] sm:table-cell">
                      Tanggal
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentSubmissions.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="py-6 text-center text-xs text-neutral-500 sm:text-sm"
                      >
                        Belum ada pengajuan masuk.
                      </TableCell>
                    </TableRow>
                  )}
                  {recentSubmissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell className="font-medium">
                        <span className="truncate">
                          {submission.sellerName}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="line-clamp-2">
                          {submission.productName}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            statusBadgeVariants[submission.status] ??
                            "bg-neutral-100 text-neutral-600"
                          }
                        >
                          {submission.status === "pending"
                            ? "Menunggu"
                            : submission.status === "approved"
                            ? "Disetujui"
                            : "Ditolak"}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden text-sm text-neutral-500 sm:table-cell">
                        {new Date(submission.createdAt).toLocaleDateString(
                          "id-ID"
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl md:text-2xl">
              Pesanan Terbaru
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Pantau status pemesanan pelanggan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[100px]">Order</TableHead>
                    <TableHead className="min-w-[120px]">Pelanggan</TableHead>
                    <TableHead className="min-w-[100px]">Status</TableHead>
                    <TableHead className="min-w-[100px] text-right">
                      Nilai
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="py-6 text-center text-xs text-neutral-500 sm:text-sm"
                      >
                        Belum ada pesanan masuk.
                      </TableCell>
                    </TableRow>
                  )}
                  {recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        <span className="truncate">#{order.orderNumber}</span>
                      </TableCell>
                      <TableCell>
                        <span className="truncate">{order.customerName}</span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            statusBadgeVariants[order.status] ??
                            "bg-neutral-100 text-neutral-600"
                          }
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(order.totalAmount || order.total || 0)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  title,
  description,
  value,
  trendLabel,
  icon,
}: {
  title: string;
  description: string;
  value: string;
  trendLabel: string;
  icon: ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="text-sm font-medium text-neutral-500">
            {title}
          </CardTitle>
          <p className="text-xs text-neutral-400">{description}</p>
        </div>
        <div className="grid size-9 place-items-center rounded-full bg-emerald-100 text-emerald-600">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          {value}
        </p>
        <p className="text-xs text-neutral-500">{trendLabel}</p>
      </CardContent>
    </Card>
  );
}

function QuickLinkCard({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-start justify-between rounded-lg border border-transparent bg-neutral-50 p-4 transition hover:border-emerald-200 hover:bg-white dark:bg-neutral-900 dark:hover:border-emerald-900/60"
    >
      <div>
        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
          {title}
        </p>
        <p className="text-xs text-neutral-500">{description}</p>
      </div>
      <ArrowUpRight className="h-4 w-4 text-neutral-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    </Link>
  );
}
