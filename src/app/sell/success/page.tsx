"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, Copy, Loader2, Package } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CartDrawer } from "@/components/cart-drawer";
import { NavUserButton } from "@/components/nav-user-button";
import type { Submission } from "@/lib/database";
import { db } from "@/lib/database";
import { SubmissionStatusView } from "../_components/submission-status-view";

export default function SubmissionSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [submission, setSubmission] = useState<Submission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadSubmission = async () => {
      const idParam = searchParams.get("submissionId");
      const codeParam = searchParams.get("trackingCode");

      if (!idParam && !codeParam) {
        setIsLoading(false);
        setSubmission(null);
        return;
      }

      setIsLoading(true);
      try {
        let record: Submission | undefined;

        const numericId = idParam ? Number(idParam) : undefined;
        if (numericId && !Number.isNaN(numericId)) {
          record = await db.submissions.get(numericId);
        }

        if (!record && codeParam) {
          record = await db.submissions
            .where("trackingCode")
            .equals(codeParam)
            .first();
        }

        setSubmission(record ?? null);
      } finally {
        setIsLoading(false);
      }
    };

    void loadSubmission();
  }, [searchParams]);

  const handleCopyCode = async () => {
    if (!submission) return;

    try {
      await navigator.clipboard.writeText(submission.trackingCode);
      setCopied(true);
      toast.success("Kode tracking disalin");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error(error);
      toast.error("Gagal menyalin kode tracking");
    }
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
            <NavUserButton />
            <Button size="sm" asChild className="hidden md:inline-flex">
              <Link href="/admin">Admin</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 md:px-6 md:py-16">
        <div className="mb-10 space-y-3 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
            Pengajuan Berhasil
          </p>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 md:text-4xl">
            Terima kasih! Pengajuan Anda sedang diproses.
          </h1>
          <p className="mx-auto max-w-2xl text-neutral-600 dark:text-neutral-400">
            Simpan kode pelacakan di bawah ini. Anda dapat kembali ke halaman ini kapan saja untuk memantau status terbaru pengajuan penjualan Anda.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
          </div>
        ) : submission ? (
          <div className="space-y-8">
            <SubmissionStatusView
              submission={submission}
              actions={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyCode}
                  className="gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      Disalin
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Salin Kode
                    </>
                  )}
                </Button>
              }
            />

            <Card className="border-neutral-200 dark:border-neutral-800">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  Langkah Berikutnya
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 sm:flex-row">
                <Button
                  size="lg"
                  className="w-full sm:w-auto"
                  onClick={() =>
                    router.push(`/sell/status?code=${submission.trackingCode}`)
                  }
                >
                  Lacak Pengajuan
                </Button>
                <Button variant="outline" size="lg" className="w-full sm:w-auto" asChild>
                  <Link href="/products">Lihat Produk BekasBerkah</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="mx-auto max-w-xl border-neutral-200 text-center dark:border-neutral-800">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                Pengajuan Tidak Ditemukan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-neutral-600 dark:text-neutral-400">
              <p>
                Kami tidak menemukan data pengajuan dengan parameter yang diberikan. Silakan periksa kembali link yang Anda gunakan.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Button asChild>
                  <Link href="/sell">Kembali ke Halaman Pengajuan</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/sell/status">Masukkan Kode Tracking</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
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
