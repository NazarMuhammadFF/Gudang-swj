"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  ArrowLeft,
  ClipboardCheck,
  FileText,
  Package,
  ShieldCheck,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CartDrawer } from "@/components/cart-drawer";
import { NavUserButton } from "@/components/nav-user-button";
import { db } from "@/lib/database";
import { generateSubmissionCode } from "@/lib/tracking";
import {
  DEMO_USER_EVENT,
  isDemoUserLoggedIn,
  loadDemoProfile,
} from "@/lib/demo-user";

const formSchema = z.object({
  sellerName: z.string().min(3, "Nama wajib diisi"),
  email: z.string().email("Email tidak valid"),
  phone: z.string().min(10, "Nomor telepon minimal 10 digit"),
  sellerCity: z.string().min(2, "Kota wajib diisi"),
  sellerAddress: z.string().min(10, "Alamat minimal 10 karakter"),
  preferredContact: z.enum(["whatsapp", "email", "phone"]),
  productName: z.string().min(5, "Nama produk minimal 5 karakter"),
  productDescription: z.string().min(20, "Deskripsi minimal 20 karakter"),
  category: z.string().min(1, "Pilih kategori"),
  condition: z.enum(["excellent", "good", "fair"]),
  askingPrice: z
    .number()
    .min(100000, "Minimal Rp100.000"),
  productPhotos: z.array(z.string()).min(1, "Unggah minimal 1 foto"),
  agreeTerms: z.boolean().refine(Boolean, "Setujui syarat & ketentuan"),
});

type FormValues = z.infer<typeof formSchema>;

const conditionOptions = [
  {
    value: "excellent" as const,
    title: "Sangat Baik",
    subtitle: "Seperti baru, minim pemakaian",
  },
  {
    value: "good" as const,
    title: "Baik",
    subtitle: "Ada sedikit tanda pemakaian",
  },
  {
    value: "fair" as const,
    title: "Cukup",
    subtitle: "Perlu sedikit perbaikan",
  },
];

const stepItems = [
  {
    icon: FileText,
    title: "Isi Formulir",
    description: "Kirim detail produk dan kontak Anda.",
  },
  {
    icon: ShieldCheck,
    title: "Kurasi 24 Jam",
    description: "Kurator menilai kualitas dan keaslian barang.",
  },
  {
    icon: Sparkles,
    title: "Publikasi",
    description: "Produk tampil di katalog BekasBerkah.",
  },
];

const tipItems = [
  {
    title: "Foto Berkualitas",
    description: "Gunakan cahaya natural dan ambil dari beberapa sudut.",
  },
  {
    title: "Deskripsi Lengkap",
    description: "Cantumkan kondisi, kelengkapan, dan riwayat pemakaian.",
  },
  {
    title: "Harga Realistis",
    description: "Bandingkan dengan harga pasar agar cepat terjual.",
  },
];

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

export default function SellPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<string[]>([]);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lookupCode, setLookupCode] = useState("");
  const [stats, setStats] = useState({ total: 0, approved: 0 });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sellerName: "",
      email: "",
      phone: "",
      sellerCity: "",
      sellerAddress: "",
      preferredContact: "whatsapp",
      productName: "",
      productDescription: "",
      category: "",
      condition: "excellent",
      askingPrice: 0,
      productPhotos: [],
      agreeTerms: false,
    },
  });

  const applyProfileToForm = useCallback(() => {
    if (!isDemoUserLoggedIn()) {
      return;
    }
    const profile = loadDemoProfile();
    form.setValue("sellerName", profile.name, { shouldDirty: false });
    form.setValue("email", profile.email, { shouldDirty: false });
    form.setValue("phone", profile.phone, { shouldDirty: false });
    form.setValue("sellerAddress", profile.address, { shouldDirty: false });
    const derivedCity = extractCityFromAddress(profile.address);
    if (derivedCity) {
      form.setValue("sellerCity", derivedCity, { shouldDirty: false });
    }
  }, [form]);

  useEffect(() => {
    const load = async () => {
      const categoryList = await db.categories.orderBy("name").toArray();
      setCategories(categoryList.map((item) => item.name));

      const submissions = await db.submissions.toArray();
      if (submissions.length > 0) {
        const approved = submissions.filter(
          (item) => item.status === "approved"
        ).length;
        setStats({ total: submissions.length, approved });
      }
    };

    void load();
  }, []);

  useEffect(() => {
    applyProfileToForm();

    if (typeof window === "undefined") {
      return;
    }

    const handleProfileUpdate = () => {
      applyProfileToForm();
    };

    window.addEventListener(DEMO_USER_EVENT, handleProfileUpdate);
    window.addEventListener("storage", handleProfileUpdate);

    return () => {
      window.removeEventListener(DEMO_USER_EVENT, handleProfileUpdate);
      window.removeEventListener("storage", handleProfileUpdate);
    };
  }, [applyProfileToForm]);

  useEffect(() => {
    form.setValue("productPhotos", fileNames);
  }, [fileNames, form]);

  const pending = Math.max(stats.total - stats.approved, 0);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) {
      setFileNames([]);
      return;
    }
    const names = Array.from(files).map((file) => file.name);
    setFileNames(names);
  };

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const trackingCode = generateSubmissionCode();
      const timestamp = new Date();
      const loggedInProfile = isDemoUserLoggedIn() ? loadDemoProfile() : null;
      const submissionName = loggedInProfile?.name ?? values.sellerName;
      const submissionEmail = loggedInProfile?.email ?? values.email;
      const submissionPhone = loggedInProfile?.phone ?? values.phone;
      const submissionAddress =
        loggedInProfile?.address ?? values.sellerAddress;
      const submissionCity =
        loggedInProfile?.address
          ? extractCityFromAddress(loggedInProfile.address) ||
            values.sellerCity
          : values.sellerCity;

      const submissionId = await db.submissions.add({
        sellerName: submissionName,
        email: submissionEmail,
        phone: submissionPhone,
        sellerCity: submissionCity,
        sellerAddress: submissionAddress,
        preferredContact: values.preferredContact,
        productName: values.productName,
        productDescription: values.productDescription,
        category: values.category,
        condition: values.condition,
        askingPrice: values.askingPrice,
        productPhotos: values.productPhotos,
        trackingCode,
        status: "pending",
        notes: undefined,
        createdAt: timestamp,
        updatedAt: timestamp,
      });

      toast.success("Pengajuan dikirim!", {
        description: "Kami akan menghubungi Anda dalam 24 jam.",
      });

      form.reset({
        sellerName: "",
        email: "",
        phone: "",
        sellerCity: "",
        sellerAddress: "",
        preferredContact: "whatsapp",
        productName: "",
        productDescription: "",
        category: "",
        condition: "excellent",
        askingPrice: 0,
        productPhotos: [],
        agreeTerms: false,
      });
      setFileNames([]);
      applyProfileToForm();

      router.push(
        `/sell/success?submissionId=${submissionId}&trackingCode=${trackingCode}`
      );
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengirim pengajuan", {
        description: "Terjadi kesalahan tak terduga. Coba lagi nanti.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTrackingLookup = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!lookupCode.trim()) {
      toast.error("Masukkan kode tracking terlebih dahulu");
      return;
    }
    router.push(`/sell/status?code=${lookupCode.trim()}`);
  };

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
        <Button
          variant="ghost"
          className="mb-6 inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
          asChild
        >
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
            Kembali ke beranda
          </Link>
        </Button>

        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
              Jual Barang Bekas Mudah
            </p>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 md:text-4xl">
              Form Pengajuan Penjual
            </h1>
            <p className="max-w-2xl text-neutral-600 dark:text-neutral-400">
              Lengkapi formulir berikut agar tim kurasi kami dapat memeriksa kondisi dan membantu mempublikasikan barang Anda.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-emerald-100 bg-white p-4 text-center shadow-sm dark:border-emerald-900/50 dark:bg-neutral-900">
              <p className="text-xs uppercase text-neutral-500">Total Pengajuan</p>
              <p className="text-2xl font-semibold text-emerald-600">{stats.total}</p>
            </div>
            <div className="rounded-xl border border-sky-100 bg-white p-4 text-center shadow-sm dark:border-sky-900/60 dark:bg-neutral-900">
              <p className="text-xs uppercase text-neutral-500">Disetujui</p>
              <p className="text-2xl font-semibold text-sky-600">{stats.approved}</p>
            </div>
            <div className="rounded-xl border border-amber-100 bg-white p-4 text-center shadow-sm dark:border-amber-900/60 dark:bg-neutral-900">
              <p className="text-xs uppercase text-neutral-500">Pending</p>
              <p className="text-2xl font-semibold text-amber-600">{pending}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          <Card className="border-neutral-200 dark:border-neutral-800">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                Lengkapi Data Pengajuan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="sellerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nama Lengkap</FormLabel>
                          <FormControl>
                            <Input placeholder="Contoh: Budi Santoso" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nomor WhatsApp</FormLabel>
                          <FormControl>
                            <Input placeholder="081234567890" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="email@domain.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="sellerCity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kota/Kabupaten</FormLabel>
                          <FormControl>
                            <Input placeholder="Contoh: Jakarta Selatan" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="sellerAddress"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Alamat Lengkap</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Alamat penjemputan barang secara lengkap"
                              className="min-h-[80px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="preferredContact"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Metode Kontak Favorit</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih metode" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                                <SelectItem value="phone">Telepon</SelectItem>
                                <SelectItem value="email">Email</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="productName"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Nama Produk</FormLabel>
                          <FormControl>
                            <Input placeholder="Contoh: MacBook Pro 2019 i7 16GB" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kategori</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih kategori" />
                              </SelectTrigger>
                              <SelectContent>
                                {categories.map((category) => (
                                  <SelectItem key={category} value={category}>
                                    {category}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="condition"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kondisi Barang</FormLabel>
                          <FormControl>
                            <RadioGroup
                              value={field.value}
                              onValueChange={field.onChange}
                              className="grid gap-3"
                            >
                              {conditionOptions.map((option) => (
                                <label
                                  key={option.value}
                                  className="flex cursor-pointer flex-col gap-1 rounded-lg border p-3 text-left hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
                                >
                                  <RadioGroupItem value={option.value} />
                                  <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                                    {option.title}
                                  </span>
                                  <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                    {option.subtitle}
                                  </span>
                                </label>
                              ))}
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="askingPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Harga yang Diinginkan (Rp)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              placeholder="Contoh: 1500000"
                              value={field.value === 0 ? "" : field.value}
                              onChange={(event) => {
                                const value = event.target.value;
                                field.onChange(value ? Number(value) : 0);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                          {form.watch("askingPrice") > 0 && (
                            <p className="text-xs text-neutral-500">
                              Estimasi diterima (90%):{" "}
                              <span className="font-semibold text-emerald-600">
                                {formatCurrency(Math.round(form.watch("askingPrice") * 0.9))}
                              </span>
                            </p>
                          )}
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="productDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deskripsi Produk</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Jelaskan kondisi, kelengkapan, dan alasan menjual"
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="productPhotos"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Upload Foto Produk</FormLabel>
                        <FormControl>
                          <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-neutral-200 bg-white p-6 text-center hover:border-emerald-400 hover:bg-emerald-50 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-emerald-700 dark:hover:bg-neutral-800">
                            <UploadCloud className="h-8 w-8 text-emerald-500" />
                            <div>
                              <p className="font-medium text-neutral-900 dark:text-neutral-100">
                                Seret & lepas atau klik untuk memilih file
                              </p>
                              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                Minimal 1 foto, format JPG/PNG, maksimal 5MB per file.
                              </p>
                            </div>
                            <Input
                              type="file"
                              className="hidden"
                              accept="image/*"
                              multiple
                              onChange={(event) => {
                                handleFileChange(event);
                                const names = Array.from(event.target.files ?? []).map(
                                  (file) => file.name
                                );
                                field.onChange(names);
                              }}
                            />
                          </label>
                        </FormControl>
                        <FormMessage />
                        {fileNames.length > 0 && (
                          <ul className="mt-3 space-y-1 rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300">
                            {fileNames.map((name) => (
                              <li key={name}>{name}</li>
                            ))}
                          </ul>
                        )}
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="agreeTerms"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start gap-3 rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-900">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1">
                          <FormLabel className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                            Saya menyetujui syarat dan kebijakan BekasBerkah
                          </FormLabel>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            Tim kami mungkin menghubungi Anda untuk verifikasi tambahan.
                          </p>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      Anda akan menerima kode tracking setelah pengajuan berhasil dikirim.
                    </p>
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full sm:w-auto"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Mengirim...
                        </>
                      ) : (
                        <>
                          <ClipboardCheck className="mr-2 h-4 w-4" />
                          Kirim Pengajuan
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-neutral-200 dark:border-neutral-800">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  Alur Kurasi
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {stepItems.map((step) => (
                  <div
                    key={step.title}
                    className="flex gap-3 rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900"
                  >
                    <step.icon className="h-5 w-5 flex-shrink-0 text-emerald-500" />
                    <div>
                      <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                        {step.title}
                      </p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-neutral-200 dark:border-neutral-800">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  Lacak Pengajuan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-3" onSubmit={handleTrackingLookup}>
                  <Input
                    placeholder="Masukkan kode tracking"
                    value={lookupCode}
                    onChange={(event) => setLookupCode(event.target.value)}
                  />
                  <Button type="submit" className="w-full">
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Cek Status
                  </Button>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Kode dikirim ke email setelah pengajuan berhasil.
                  </p>
                </form>
              </CardContent>
            </Card>

            <Card className="border-neutral-200 dark:border-neutral-800">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  Tips Agar Disetujui
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-neutral-600 dark:text-neutral-400">
                {tipItems.map((tip) => (
                  <div
                    key={tip.title}
                    className="rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900"
                  >
                    <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                      {tip.title}
                    </p>
                    <p>{tip.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
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
