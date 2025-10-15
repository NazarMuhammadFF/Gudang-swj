"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ComponentType } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  FileText,
  LayoutDashboard,
  LogOut,
  Package,
  PackageCheck,
  Settings,
  ShoppingBag,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { liveQuery } from "dexie";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { CartDrawer } from "@/components/cart-drawer";
import { NavUserButton } from "@/components/nav-user-button";
import {
  db,
  type Order,
  type Submission,
  type UserProfile,
  type UserSettings,
} from "@/lib/database";
import { generateSubmissionCode } from "@/lib/tracking";
import {
  clearDemoUserState,
  DEMO_USER_EVENT,
  defaultDemoProfile,
  defaultDemoSettings,
  isDemoUserLoggedIn,
  loadDemoProfile,
  loadDemoSettings,
  saveDemoProfile,
  saveDemoSettings,
  type DemoProfile,
  type DemoSettings,
} from "@/lib/demo-user";

type AccountSection = "overview" | "orders" | "submissions" | "settings";

const navItems: Array<{
  id: AccountSection;
  label: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
}> = [
  {
    id: "overview",
    label: "Ringkasan",
    description: "Status akun & highlights",
    icon: LayoutDashboard,
  },
  {
    id: "orders",
    label: "Riwayat Pesanan",
    description: "Pantau status pesanan Anda",
    icon: ShoppingBag,
  },
  {
    id: "submissions",
    label: "Pengajuan Penjual",
    description: "Lacak proses kurasi barang",
    icon: FileText,
  },
  {
    id: "settings",
    label: "Pengaturan Akun",
    description: "Perbarui data & preferensi",
    icon: Settings,
  },
];

const orderStatusConfig: Record<
  NonNullable<Order["status"]>,
  { label: string; badge: string }
> = {
  pending: {
    label: "Menunggu Konfirmasi",
    badge: "bg-amber-100 text-amber-700",
  },
  processing: { label: "Sedang Diproses", badge: "bg-sky-100 text-sky-700" },
  shipped: {
    label: "Dalam Pengiriman",
    badge: "bg-indigo-100 text-indigo-700",
  },
  delivered: {
    label: "Sudah Diterima",
    badge: "bg-emerald-100 text-emerald-700",
  },
  cancelled: { label: "Dibatalkan", badge: "bg-rose-100 text-rose-700" },
};

const submissionStatusConfig = {
  pending: {
    label: "Menunggu Kurasi",
    icon: Clock,
    badge: "bg-amber-100 text-amber-700",
  },
  approved: {
    label: "Disetujui",
    icon: CheckCircle2,
    badge: "bg-emerald-100 text-emerald-700",
  },
  rejected: {
    label: "Ditolak",
    icon: XCircle,
    badge: "bg-rose-100 text-rose-700",
  },
} as const;

const formatCurrency = (value: number | undefined) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value ?? 0);

const formatDate = (value: Date | undefined) =>
  value
    ? new Date(value).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "-";

const DAY_MS = 1000 * 60 * 60 * 24;

async function ensureDemoUserData(userProfile: DemoProfile) {
  if (typeof window === "undefined") {
    return;
  }

  if (!db?.orders || !db?.submissions) {
    return;
  }

  const emailLower = userProfile.email.toLowerCase();

  try {
    const orderCount = await db.orders
      .filter(
        (order) =>
          (order.customerEmail ?? order.email ?? "").toLowerCase() ===
          emailLower
      )
      .count();

    if (orderCount === 0) {
      const now = new Date();
      const orderBlueprints: Array<{
        orderNumber: string;
        status: Order["status"];
        totalAmount: number;
        paymentMethod: string;
        notes: string;
        createdOffsetDays: number;
        updatedOffsetDays?: number;
        items: NonNullable<Order["items"]>;
      }> = [
        {
          orderNumber: "BB-2024-1042",
          status: "delivered",
          totalAmount: 3350000,
          paymentMethod: "Transfer Bank",
          notes: "Pesanan telah diterima pelanggan.",
          createdOffsetDays: 28,
          updatedOffsetDays: 7,
          items: [
            {
              productId: 412,
              productName: "Laptop Dell Latitude E7470",
              price: 3200000,
              quantity: 1,
            },
            {
              productId: 905,
              productName: "Tas Laptop Waterproof",
              price: 150000,
              quantity: 1,
            },
          ],
        },
        {
          orderNumber: "BB-2024-1095",
          status: "shipped",
          totalAmount: 2800000,
          paymentMethod: "COD",
          notes: "Kurir sedang menuju titik penjemputan.",
          createdOffsetDays: 10,
          updatedOffsetDays: 1,
          items: [
            {
              productId: 512,
              productName: "Smartphone Samsung A52 5G",
              price: 2800000,
              quantity: 1,
            },
          ],
        },
        {
          orderNumber: "BB-2024-1121",
          status: "processing",
          totalAmount: 3500000,
          paymentMethod: "Transfer Bank",
          notes: "Menunggu konfirmasi pembayaran.",
          createdOffsetDays: 3,
          updatedOffsetDays: 0.5,
          items: [
            {
              productId: 845,
              productName: "Kamera Mirrorless Sony A6000",
              price: 3500000,
              quantity: 1,
            },
          ],
        },
      ];

      await db.orders.bulkAdd(
        orderBlueprints.map((blueprint) => {
          const createdAt = new Date(
            now.getTime() - blueprint.createdOffsetDays * DAY_MS
          );
          const updatedAt =
            blueprint.updatedOffsetDays != null
              ? new Date(
                  now.getTime() - blueprint.updatedOffsetDays * DAY_MS
                )
              : createdAt;

          return {
            orderNumber: blueprint.orderNumber,
            customerName: userProfile.name,
            customerEmail: userProfile.email,
            customerPhone: userProfile.phone,
            shippingAddress: userProfile.address,
            items: blueprint.items,
            totalAmount: blueprint.totalAmount,
            paymentMethod: blueprint.paymentMethod,
            notes: blueprint.notes,
            status: blueprint.status,
            createdAt,
            updatedAt,
          } satisfies Order;
        })
      );
    }

    const submissionCount = await db.submissions
      .filter((submission) => submission.email.toLowerCase() === emailLower)
      .count();

    if (submissionCount === 0) {
      const now = new Date();
      const submissionBlueprints: Array<{
        productName: string;
        productDescription: string;
        category: string;
        condition: Submission["condition"];
        askingPrice?: number;
        status: Submission["status"];
        notes?: string;
        createdOffsetDays: number;
        updatedOffsetDays?: number;
        productPhotos?: string[];
      }> = [
        {
          productName: "Jam Tangan Casio Edifice",
          productDescription:
            "Jam tangan original kondisi sangat baik lengkap dengan box.",
          category: "Aksesoris",
          condition: "excellent",
          askingPrice: 950000,
          status: "approved",
          notes: "Disetujui dan dijadwalkan untuk pemotretan katalog.",
          createdOffsetDays: 21,
          updatedOffsetDays: 16,
          productPhotos: ["https://images.unsplash.com/photo-1524594154908-edd20349e9a8"],
        },
        {
          productName: "Speaker Bluetooth JBL Flip 5",
          productDescription:
            "Suara masih jernih, baterai tahan lama, hanya lecet kecil.",
          category: "Elektronik",
          condition: "good",
          askingPrice: 1100000,
          status: "pending",
          notes: "Menunggu evaluasi kualitas fisik oleh tim kurasi.",
          createdOffsetDays: 6,
          productPhotos: ["https://images.unsplash.com/photo-1514986888952-8cd320577b68"],
        },
      ];

      await db.submissions.bulkAdd(
        submissionBlueprints.map((blueprint) => {
          const createdAt = new Date(
            now.getTime() - blueprint.createdOffsetDays * DAY_MS
          );
          const updatedAt =
            blueprint.status === "pending" || blueprint.updatedOffsetDays == null
              ? createdAt
              : new Date(
                  now.getTime() - blueprint.updatedOffsetDays * DAY_MS
                );

          return {
            sellerName: userProfile.name,
            email: userProfile.email,
            phone: userProfile.phone,
            sellerCity: "Jakarta",
            sellerAddress: userProfile.address,
            preferredContact: "whatsapp",
            productName: blueprint.productName,
            productDescription: blueprint.productDescription,
            category: blueprint.category,
            condition: blueprint.condition,
            askingPrice: blueprint.askingPrice,
            productPhotos: blueprint.productPhotos ?? [],
            trackingCode: generateSubmissionCode(),
            status: blueprint.status,
            notes: blueprint.notes,
            createdAt,
            updatedAt,
          } satisfies Submission;
        })
      );
    }
  } catch (error) {
    console.error("Failed to ensure demo data for account page", error);
  }
}

export default function AccountPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] =
    useState<AccountSection>("overview");
  const [profile, setProfile] = useState(defaultDemoProfile);
  const [settings, setSettings] = useState(defaultDemoSettings);
  const [orders, setOrders] = useState<Order[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const initializeAccount = useCallback(async () => {
    if (!isDemoUserLoggedIn()) {
      if (isMountedRef.current) {
        setIsAuthorized(false);
      }
      router.push("/login");
      return;
    }

    const fallbackProfile = loadDemoProfile();
    const fallbackSettings = loadDemoSettings();

    let sessionEmail = fallbackProfile.email;
    let sessionName = fallbackProfile.name;

    if (typeof window !== "undefined") {
      try {
        const storedUser = window.localStorage.getItem("user");
        if (storedUser) {
          const parsed = JSON.parse(storedUser) as {
            email?: string;
            name?: string;
            role?: "admin" | "user";
            isAuthenticated?: boolean;
          };

          if (parsed.role === "admin" && parsed.isAuthenticated) {
            if (isMountedRef.current) {
              setIsAuthorized(false);
            }
            router.push("/admin");
            return;
          }

          sessionEmail = parsed.email ?? sessionEmail;
          sessionName = parsed.name ?? sessionName;
        }
      } catch {
        // ignore malformed session data
      }
    }

    if (typeof window === "undefined") {
      return;
    }

    const emailLower = sessionEmail.toLowerCase();

    let profileRecord: UserProfile | undefined;
    if (db?.profiles) {
      profileRecord = await db.profiles
        .where("emailLower")
        .equals(emailLower)
        .first();
    }

    if (!profileRecord && db?.profiles) {
      const now = new Date();
      const newRecord: UserProfile = {
        email: sessionEmail,
        emailLower,
        name: sessionName,
        phone: fallbackProfile.phone,
        address: fallbackProfile.address,
        memberSince: fallbackProfile.memberSince,
        role: "user",
        createdAt: now,
        updatedAt: now,
      };
      const newId = await db.profiles.add(newRecord);
      profileRecord = { ...newRecord, id: newId };
    }

    const resolvedProfile: DemoProfile = profileRecord
      ? {
          name: profileRecord.name,
          email: profileRecord.email,
          phone: profileRecord.phone,
          address: profileRecord.address,
          memberSince:
            profileRecord.memberSince ?? fallbackProfile.memberSince,
        }
      : {
          name: sessionName,
          email: sessionEmail,
          phone: fallbackProfile.phone,
          address: fallbackProfile.address,
          memberSince: fallbackProfile.memberSince,
        };

    let settingsRecord: UserSettings | undefined;
    if (db?.settings) {
      settingsRecord = await db.settings
        .where("emailLower")
        .equals(resolvedProfile.email.toLowerCase())
        .first();
    }

    if (!settingsRecord && db?.settings) {
      const now = new Date();
      const newSettings: UserSettings = {
        email: resolvedProfile.email,
        emailLower: resolvedProfile.email.toLowerCase(),
        emailUpdates: fallbackSettings.emailUpdates,
        smsUpdates: fallbackSettings.smsUpdates,
        marketingTips: fallbackSettings.marketingTips,
        darkMode: fallbackSettings.darkMode,
        updatedAt: now,
      };
      const newId = await db.settings.add(newSettings);
      settingsRecord = { ...newSettings, id: newId };
    }

    const resolvedSettings: DemoSettings = settingsRecord
      ? {
          emailUpdates: settingsRecord.emailUpdates,
          smsUpdates: settingsRecord.smsUpdates,
          marketingTips: settingsRecord.marketingTips,
          darkMode: settingsRecord.darkMode,
        }
      : fallbackSettings;

    await ensureDemoUserData(resolvedProfile);

    if (!isMountedRef.current) {
      return;
    }

    setProfile(resolvedProfile);
    setSettings(resolvedSettings);
    setIsAuthorized(true);
  }, [router]);

  useEffect(() => {
    void initializeAccount();
  }, [initializeAccount]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleRealtimeSync = () => {
      void initializeAccount();
    };

    window.addEventListener(DEMO_USER_EVENT, handleRealtimeSync);
    window.addEventListener("storage", handleRealtimeSync);

    return () => {
      window.removeEventListener(DEMO_USER_EVENT, handleRealtimeSync);
      window.removeEventListener("storage", handleRealtimeSync);
    };
  }, [initializeAccount]);

  useEffect(() => {
    if (!isAuthorized) {
      return;
    }

    if (typeof window === "undefined") {
      return;
    }

    if (!db?.orders || !db?.submissions) {
      setOrders([]);
      setSubmissions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const emailKey = profile.email.toLowerCase();

    const subscription = liveQuery(async () => {
      const [allOrders, allSubmissions] = await Promise.all([
        db.orders.toArray(),
        db.submissions.toArray(),
      ]);

      const filteredOrders = allOrders
        .filter((order) => {
          const email = (
            order.customerEmail ?? order.email ?? ""
          ).toLowerCase();
          return email === emailKey;
        })
        .sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });

      const filteredSubmissions = allSubmissions
        .filter((submission) => submission.email.toLowerCase() === emailKey)
        .sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });

      return { orders: filteredOrders, submissions: filteredSubmissions };
    }).subscribe({
      next: ({ orders: nextOrders, submissions: nextSubmissions }) => {
        setOrders(nextOrders);
        setSubmissions(nextSubmissions);
        setIsLoading(false);
      },
      error: (error) => {
        console.error("Failed to subscribe to account data", error);
        setIsLoading(false);
      },
    });

    return () => subscription.unsubscribe();
  }, [isAuthorized, profile.email]);

  const totals = useMemo(() => {
    const totalSpent = orders.reduce((sum, order) => {
      const amount = order.totalAmount ?? order.total ?? 0;
      return sum + amount;
    }, 0);

    const delivered = orders.filter(
      (order) => order.status === "delivered"
    ).length;
    const inTransit = orders.filter(
      (order) => order.status === "shipped"
    ).length;
    const pendingSubmissions = submissions.filter(
      (item) => item.status === "pending"
    ).length;
    const approvedSubmissions = submissions.filter(
      (item) => item.status === "approved"
    ).length;

    return {
      totalOrders: orders.length,
      totalSpent,
      delivered,
      inTransit,
      pendingSubmissions,
      approvedSubmissions,
    };
  }, [orders, submissions]);

  const handleSaveProfile = () => {
    saveDemoProfile(profile);
    toast.success("Profil berhasil diperbarui");
  };

  const handleSaveSettings = () => {
    saveDemoSettings(settings);
    toast.success("Pengaturan tersimpan");
  };

  const handleLogout = () => {
    clearDemoUserState();
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("user");
    }
    setProfile(defaultDemoProfile);
    setSettings(defaultDemoSettings);
    setIsAuthorized(false);
    toast.success("Logout berhasil (simulasi)");
    router.push("/login");
  };

  const latestOrders = orders.slice(0, 3);
  const latestSubmissions = submissions.slice(0, 3);

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-950 dark:to-neutral-900">
      <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur-md dark:bg-neutral-900/80">
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
            <NavUserButton hideAdminShortcut />
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 md:px-6 md:py-16">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
              Halo, {profile.name.split(" ")[0]}!
            </p>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 md:text-4xl">
              Dasbor Akun Anda
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Kelola pesanan, pantau pengajuan penjualan, dan perbarui
              preferensi akun Anda.
            </p>
          </div>
          <div className="rounded-lg border border-neutral-200 bg-white p-4 text-sm shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <p className="font-semibold text-neutral-900 dark:text-neutral-100">
              Email: {profile.email}
            </p>
            <p className="text-neutral-500 dark:text-neutral-400">
              Anggota sejak {profile.memberSince}
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <Card className="h-fit border-neutral-200 dark:border-neutral-800">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                Navigasi Akun
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveSection(item.id)}
                    className={`flex w-full flex-col rounded-lg border p-3 text-left transition hover:border-emerald-300 hover:bg-emerald-50 dark:hover:bg-neutral-800 ${
                      isActive
                        ? "border-emerald-400 bg-emerald-50/80 dark:border-emerald-700 dark:bg-emerald-900/30"
                        : "border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span
                          className={`rounded-full p-2 ${
                            isActive
                              ? "bg-emerald-500 text-white"
                              : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-300"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                          {item.label}
                        </span>
                      </div>
                      <span className="text-xs text-neutral-400">›</span>
                    </div>
                    <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                      {item.description}
                    </p>
                  </button>
                );
              })}
              <div className="pt-4">
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  Logout (Simulasi)
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {activeSection === "overview" && (
              <section className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  <Card className="border-neutral-200 dark:border-neutral-800">
                    <CardContent className="space-y-2 p-6">
                      <span className="text-sm text-neutral-500">
                        Total Pesanan
                      </span>
                      <p className="text-3xl font-semibold text-neutral-900 dark:text-neutral-100">
                        {totals.totalOrders}
                      </p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        {totals.delivered} pesanan sudah diterima
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-neutral-200 dark:border-neutral-800">
                    <CardContent className="space-y-2 p-6">
                      <span className="text-sm text-neutral-500">
                        Total Pengeluaran
                      </span>
                      <p className="text-3xl font-semibold text-neutral-900 dark:text-neutral-100">
                        {formatCurrency(totals.totalSpent)}
                      </p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        {totals.inTransit} pesanan masih dalam pengiriman
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-neutral-200 dark:border-neutral-800">
                    <CardContent className="space-y-2 p-6">
                      <span className="text-sm text-neutral-500">
                        Pengajuan Penjualan
                      </span>
                      <p className="text-3xl font-semibold text-neutral-900 dark:text-neutral-100">
                        {submissions.length}
                      </p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        {totals.approvedSubmissions} disetujui,{" "}
                        {totals.pendingSubmissions} menunggu kurasi
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <Card className="border-neutral-200 dark:border-neutral-800">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                        Pesanan Terbaru
                      </CardTitle>
                      <Badge
                        variant="outline"
                        className="border-emerald-200 text-emerald-600"
                      >
                        {orders.length} pesanan
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      {isLoading ? (
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                          Memuat riwayat pesanan...
                        </p>
                      ) : latestOrders.length === 0 ? (
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                          Anda belum memiliki pesanan. Mulai jelajahi produk
                          kami!
                        </p>
                      ) : (
                        <div className="space-y-4">
                          {latestOrders.map((order) => {
                            const status =
                              orderStatusConfig[order.status ?? "pending"];
                            return (
                              <div
                                key={order.id}
                                className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900"
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                                      {order.orderNumber}
                                    </p>
                                    <p className="text-xs text-neutral-500">
                                      {formatDate(order.createdAt)}
                                    </p>
                                  </div>
                                  <Badge className={`${status.badge} text-xs`}>
                                    {status.label}
                                  </Badge>
                                </div>
                                <div className="mt-3 flex items-center justify-between text-sm">
                                  <p className="text-neutral-600 dark:text-neutral-400">
                                    Total Barang: {order.items?.length ?? 0}
                                  </p>
                                  <p className="font-semibold text-emerald-600">
                                    {formatCurrency(
                                      order.totalAmount ?? order.total
                                    )}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border-neutral-200 dark:border-neutral-800">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                        Pengajuan Terbaru
                      </CardTitle>
                      <Badge
                        variant="outline"
                        className="border-sky-200 text-sky-600"
                      >
                        {submissions.length} pengajuan
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      {isLoading ? (
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                          Memuat data pengajuan...
                        </p>
                      ) : latestSubmissions.length === 0 ? (
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                          Belum ada pengajuan penjualan. Ajukan barang Anda
                          untuk dikurasi.
                        </p>
                      ) : (
                        <div className="space-y-4">
                          {latestSubmissions.map((submission) => {
                            const meta =
                              submissionStatusConfig[submission.status];
                            const StatusIcon = meta.icon;
                            return (
                              <div
                                key={submission.id}
                                className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900"
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                                      {submission.productName}
                                    </p>
                                    <p className="text-xs text-neutral-500">
                                      {submission.trackingCode}
                                    </p>
                                  </div>
                                  <Badge
                                    className={`${meta.badge} gap-1 text-xs`}
                                  >
                                    <StatusIcon className="h-3 w-3" />
                                    {meta.label}
                                  </Badge>
                                </div>
                                <p className="mt-3 text-xs text-neutral-500 dark:text-neutral-400">
                                  Diajukan pada{" "}
                                  {formatDate(submission.createdAt)}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </section>
            )}
            {activeSection === "orders" && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                    Riwayat Pesanan
                  </h2>
                  <Badge
                    variant="outline"
                    className="border-neutral-200 text-neutral-600"
                  >
                    {orders.length} pesanan ditemukan
                  </Badge>
                </div>

                <Card className="border-neutral-200 dark:border-neutral-800">
                  <CardContent className="overflow-x-auto p-0">
                    <table className="w-full min-w-[640px] table-fixed border-separate border-spacing-y-2 p-4">
                      <thead>
                        <tr className="text-left text-xs uppercase tracking-wide text-neutral-500">
                          <th className="px-4 py-2">Pesanan</th>
                          <th className="px-4 py-2">Tanggal</th>
                          <th className="px-4 py-2">Status</th>
                          <th className="px-4 py-2">Total</th>
                          <th className="px-4 py-2">Metode Bayar</th>
                        </tr>
                      </thead>
                      <tbody>
                        {isLoading ? (
                          <tr>
                            <td
                              colSpan={5}
                              className="px-4 py-6 text-center text-sm text-neutral-500"
                            >
                              Memuat data pesanan...
                            </td>
                          </tr>
                        ) : orders.length === 0 ? (
                          <tr>
                            <td
                              colSpan={5}
                              className="px-4 py-6 text-center text-sm text-neutral-500"
                            >
                              Belum ada pesanan yang tercatat untuk akun ini.
                            </td>
                          </tr>
                        ) : (
                          orders.map((order) => {
                            const status =
                              orderStatusConfig[order.status ?? "pending"];
                            return (
                              <tr
                                key={order.id}
                                className="rounded-lg bg-white text-sm shadow-sm dark:bg-neutral-900"
                              >
                                <td className="rounded-l-lg px-4 py-3 font-medium text-neutral-900 dark:text-neutral-100">
                                  <div className="flex flex-col">
                                    <span>{order.orderNumber}</span>
                                    <span className="text-xs text-neutral-500">
                                      {order.items?.length ?? 0} item
                                    </span>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">
                                  {formatDate(order.createdAt)}
                                </td>
                                <td className="px-4 py-3">
                                  <Badge className={`${status.badge} text-xs`}>
                                    {status.label}
                                  </Badge>
                                </td>
                                <td className="px-4 py-3 font-semibold text-emerald-600">
                                  {formatCurrency(
                                    order.totalAmount ?? order.total
                                  )}
                                </td>
                                <td className="rounded-r-lg px-4 py-3 text-neutral-600 dark:text-neutral-400">
                                  {order.paymentMethod ?? "Tidak diketahui"}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              </section>
            )}
            {activeSection === "submissions" && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                    Pengajuan Penjualan
                  </h2>
                  <Badge
                    variant="outline"
                    className="border-neutral-200 text-neutral-600"
                  >
                    {submissions.length} pengajuan
                  </Badge>
                </div>

                <Card className="border-neutral-200 dark:border-neutral-800">
                  <CardContent className="overflow-x-auto p-0">
                    <table className="w-full min-w-[640px] table-fixed border-separate border-spacing-y-2 p-4">
                      <thead>
                        <tr className="text-left text-xs uppercase tracking-wide text-neutral-500">
                          <th className="px-4 py-2">Produk</th>
                          <th className="px-4 py-2">Kategori</th>
                          <th className="px-4 py-2">Kondisi</th>
                          <th className="px-4 py-2">Status</th>
                          <th className="px-4 py-2">Tracking</th>
                        </tr>
                      </thead>
                      <tbody>
                        {isLoading ? (
                          <tr>
                            <td
                              colSpan={5}
                              className="px-4 py-6 text-center text-sm text-neutral-500"
                            >
                              Memuat data pengajuan...
                            </td>
                          </tr>
                        ) : submissions.length === 0 ? (
                          <tr>
                            <td
                              colSpan={5}
                              className="px-4 py-6 text-center text-sm text-neutral-500"
                            >
                              Belum ada pengajuan penjualan. Ajukan barang Anda
                              melalui halaman
                              <Link
                                href="/sell"
                                className="ml-1 font-semibold text-emerald-600 underline"
                              >
                                Jual Barang
                              </Link>
                              .
                            </td>
                          </tr>
                        ) : (
                          submissions.map((submission) => {
                            const meta =
                              submissionStatusConfig[submission.status];
                            const StatusIcon = meta.icon;
                            return (
                              <tr
                                key={submission.id}
                                className="rounded-lg bg-white text-sm shadow-sm dark:bg-neutral-900"
                              >
                                <td className="rounded-l-lg px-4 py-3 font-medium text-neutral-900 dark:text-neutral-100">
                                  <div className="flex flex-col">
                                    <span>{submission.productName}</span>
                                    <span className="text-xs text-neutral-500">
                                      Diajukan{" "}
                                      {formatDate(submission.createdAt)}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">
                                  {submission.category}
                                </td>
                                <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400 capitalize">
                                  {submission.condition}
                                </td>
                                <td className="px-4 py-3">
                                  <Badge
                                    className={`${meta.badge} gap-1 text-xs`}
                                  >
                                    <StatusIcon className="h-3 w-3" />
                                    {meta.label}
                                  </Badge>
                                </td>
                                <td className="rounded-r-lg px-4 py-3 font-mono text-xs text-neutral-500">
                                  {submission.trackingCode}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              </section>
            )}
            {activeSection === "settings" && (
              <section className="space-y-6">
                <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                  Pengaturan Akun
                </h2>

                <Card className="border-neutral-200 dark:border-neutral-800">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                      Data Pribadi
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">
                          Nama Lengkap
                        </label>
                        <Input
                          className="mt-2"
                          value={profile.name}
                          onChange={(event) =>
                            setProfile((prev) => ({
                              ...prev,
                              name: event.target.value,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">
                          Nomor Telepon
                        </label>
                        <Input
                          className="mt-2"
                          value={profile.phone}
                          onChange={(event) =>
                            setProfile((prev) => ({
                              ...prev,
                              phone: event.target.value,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">
                          Email
                        </label>
                        <Input
                          className="mt-2"
                          value={profile.email}
                          onChange={(event) =>
                            setProfile((prev) => ({
                              ...prev,
                              email: event.target.value,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">
                          Alamat
                        </label>
                        <Textarea
                          className="mt-2"
                          rows={3}
                          value={profile.address}
                          onChange={(event) =>
                            setProfile((prev) => ({
                              ...prev,
                              address: event.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                    <Button onClick={handleSaveProfile} className="gap-2">
                      <PackageCheck className="h-4 w-4" />
                      Simpan Perubahan Profil
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-neutral-200 dark:border-neutral-800">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                      Preferensi Notifikasi
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="flex items-start gap-3 rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
                      <Checkbox
                        checked={settings.emailUpdates}
                        onCheckedChange={(value) =>
                          setSettings((prev) => ({
                            ...prev,
                            emailUpdates: Boolean(value),
                          }))
                        }
                      />
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                          Email update pesanan
                        </p>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                          Dapatkan info terbaru tentang status pesanan Anda via
                          email.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
                      <Checkbox
                        checked={settings.smsUpdates}
                        onCheckedChange={(value) =>
                          setSettings((prev) => ({
                            ...prev,
                            smsUpdates: Boolean(value),
                          }))
                        }
                      />
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                          SMS status pengiriman
                        </p>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                          Kami kirimkan update pengiriman instan melalui
                          SMS/WhatsApp.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
                      <Checkbox
                        checked={settings.marketingTips}
                        onCheckedChange={(value) =>
                          setSettings((prev) => ({
                            ...prev,
                            marketingTips: Boolean(value),
                          }))
                        }
                      />
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                          Tips penjualan & promo
                        </p>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                          Terima inspirasi dan promo eksklusif untuk mitra
                          penjual BekasBerkah.
                        </p>
                      </div>
                    </div>

                    <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
                      <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                        Tampilan tema
                      </p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Pilih preferensi mode terang atau gelap (simulasi).
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {["light", "dark", "system"].map((mode) => (
                          <Button
                            key={mode}
                            type="button"
                            variant={
                              settings.darkMode === mode ? "default" : "outline"
                            }
                            onClick={() =>
                              setSettings((prev) => ({
                                ...prev,
                                darkMode:
                                  mode as typeof defaultDemoSettings.darkMode,
                              }))
                            }
                          >
                            {mode === "light"
                              ? "Terang"
                              : mode === "dark"
                              ? "Gelap"
                              : "Sistem"}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <Button onClick={handleSaveSettings} className="gap-2">
                      <Settings className="h-4 w-4" />
                      Simpan Pengaturan
                    </Button>
                  </CardContent>
                </Card>
              </section>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t bg-neutral-900 text-neutral-200">
        <div className="container mx-auto flex flex-col gap-2 px-4 py-6 text-sm md:flex-row md:items-center md:justify-between md:px-6">
          <p>&copy; 2025 BekasBerkah. Template demo e-commerce.</p>
          <div className="flex gap-4 text-neutral-400">
            <Link href="/products" className="hover:text-emerald-400">
              Produk
            </Link>
            <Link href="/sell" className="hover:text-emerald-400">
              Jual Barang
            </Link>
            <Link href="/account" className="hover:text-emerald-400">
              Akun Saya
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
