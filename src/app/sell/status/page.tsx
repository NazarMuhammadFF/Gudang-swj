"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Package, Search } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CartDrawer } from "@/components/cart-drawer";
import { NavUserButton } from "@/components/nav-user-button";
import type { Submission } from "@/lib/database";
import { db } from "@/lib/database";
import { SubmissionStatusView } from "../_components/submission-status-view";

export default function SubmissionStatusPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const codeParam = searchParams.get("code") ?? "";

  const [codeInput, setCodeInput] = useState(codeParam);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(Boolean(codeParam));

  useEffect(() => {
    setCodeInput(codeParam);
  }, [codeParam]);

  useEffect(() => {
    const fetchSubmission = async () => {
      if (!codeParam.trim()) {
        setSubmission(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const record = await db.submissions
          .where("trackingCode")
          .equals(codeParam.trim())
          .first();
        setSubmission(record ?? null);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchSubmission();
  }, [codeParam]);

  const handleLookup = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!codeInput.trim()) {
      toast.error("Masukkan kode tracking terlebih dahulu");
      return;
    }
    setHasSearched(true);
    router.replace(`/sell/status?code=${codeInput.trim()}`);
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
        <div className="mb-10 space-y-3 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
            Lacak Pengajuan
          </p>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 md:text-4xl">
            Masukkan Kode Tracking Pengajuan Anda
          </h1>
          <p className="mx-auto max-w-2xl text-neutral-600 dark:text-neutral-400">
            Kode tracking dikirim ke email dan dapat ditemukan di halaman konfirmasi setelah mengirim pengajuan.
          </p>
        </div>

        <Card className="mx-auto mb-10 max-w-2xl border-neutral-200 dark:border-neutral-800">
          <CardContent className="py-6">
            <form
              onSubmit={handleLookup}
              className="flex flex-col gap-3 sm:flex-row"
            >
              <Input
                placeholder="Contoh: SUB-123456-789"
                value={codeInput}
                onChange={(event) => setCodeInput(event.target.value)}
              />
              <Button type="submit" className="gap-2">
                <Search className="h-4 w-4" />
                Cek Status
              </Button>
            </form>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
          </div>
        ) : submission ? (
          <SubmissionStatusView submission={submission} />
        ) : hasSearched ? (
          <Card className="mx-auto max-w-xl border-neutral-200 text-center dark:border-neutral-800">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                Kode Tidak Ditemukan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-neutral-600 dark:text-neutral-400">
              <p>
                Pastikan kode yang Anda masukkan sudah benar. Hubungi tim BekasBerkah jika Anda membutuhkan bantuan lebih lanjut.
              </p>
              <Button asChild>
                <Link href="/sell">Kirim Pengajuan Baru</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="mx-auto max-w-xl text-center text-sm text-neutral-500 dark:text-neutral-400">
            Masukkan kode tracking untuk melihat status terkini pengajuan penjualan Anda.
          </div>
        )}
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
