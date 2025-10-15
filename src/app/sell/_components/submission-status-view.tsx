"use client";

import { ReactNode, useMemo } from "react";
import { Clock, FileText, PackageCheck, XCircle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Submission } from "@/lib/database";

interface SubmissionStatusViewProps {
  submission: Submission;
  actions?: ReactNode;
}

const statusMeta = {
  pending: {
    label: "Menunggu Kurasi",
    badgeClass: "bg-amber-100 text-amber-700",
    description: "Kurator kami sedang menilai detail produk Anda.",
  },
  approved: {
    label: "Disetujui",
    badgeClass: "bg-emerald-100 text-emerald-700",
    description: "Selamat! Produk Anda siap dipublikasikan.",
  },
  rejected: {
    label: "Ditolak",
    badgeClass: "bg-rose-100 text-rose-700",
    description: "Mohon maaf, pengajuan tidak lolos kurasi.",
  },
} as const;

const formatCurrency = (value: number | undefined) =>
  value
    ? new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(value)
    : "-";

const formatDateTime = (value: Date | undefined) =>
  value
    ? new Date(value).toLocaleString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

export function SubmissionStatusView({
  submission,
  actions,
}: SubmissionStatusViewProps) {
  const status = statusMeta[submission.status];

  const timeline = useMemo(() => {
    return [
      {
        title: "Pengajuan Diterima",
        description: "Kami telah menerima formulir pengajuan Anda.",
        date: submission.createdAt,
        state: "done" as const,
        icon: FileText,
      },
      {
        title: "Proses Kurasi",
        description: "Tim internal meninjau kondisi dan kelayakan produk.",
        date:
          submission.status === "pending" ? undefined : submission.updatedAt,
        state:
          submission.status === "pending"
            ? ("current" as const)
            : ("done" as const),
        icon: Clock,
      },
      {
        title:
          submission.status === "approved"
            ? "Pengajuan Disetujui"
            : submission.status === "rejected"
            ? "Pengajuan Ditolak"
            : "Menunggu Keputusan",
        description:
          submission.status === "approved"
            ? "Produk Anda akan segera kami publikasikan."
            : submission.status === "rejected"
            ? "Pengajuan tidak memenuhi standar kurasi kami."
            : "Menunggu keputusan akhir dari tim kurasi.",
        date:
          submission.status === "pending" ? undefined : submission.updatedAt,
        state:
          submission.status === "pending"
            ? ("upcoming" as const)
            : submission.status === "approved"
            ? ("done" as const)
            : ("rejected" as const),
        icon:
          submission.status === "approved"
            ? PackageCheck
            : submission.status === "rejected"
            ? XCircle
            : Clock,
      },
    ];
  }, [submission]);

  return (
    <div className="space-y-6">
      <Card className="border-neutral-200 dark:border-neutral-800">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
              Status Pengajuan
            </CardTitle>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Lacak progres pengajuan penjualan Anda secara real-time.
            </p>
          </div>
          <Badge className={`${status.badgeClass} px-3 py-1 text-sm`}>
            {status.label}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/20">
            <p className="text-xs uppercase tracking-wide text-emerald-600">
              Kode Pelacakan
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <span className="text-lg font-semibold tracking-wide text-neutral-900 dark:text-neutral-100">
                {submission.trackingCode}
              </span>
              {actions}
            </div>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              Simpan kode ini untuk memantau progres pengajuan kapan saja.
            </p>
          </div>

          <div className="space-y-5">
            {timeline.map((item, index) => {
              const Icon = item.icon;
              const isLast = index === timeline.length - 1;

              const stateStyles =
                item.state === "done"
                  ? "bg-emerald-600 text-white"
                  : item.state === "current"
                  ? "bg-sky-600 text-white animate-pulse"
                  : item.state === "rejected"
                  ? "bg-rose-600 text-white"
                  : "bg-neutral-200 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400";

              return (
                <div key={item.title} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${stateStyles}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    {!isLast && (
                      <div className="mt-1 h-full w-px flex-1 bg-neutral-200 dark:bg-neutral-700" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                      {item.title}
                    </p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {item.description}
                    </p>
                    <p className="mt-2 text-xs uppercase tracking-wide text-neutral-400">
                      {formatDateTime(item.date)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="border-neutral-200 dark:border-neutral-800">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Ringkasan Pengajuan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="text-xs uppercase tracking-wide text-neutral-500">
              Status Terbaru
            </p>
            <p className="mt-1 font-medium text-neutral-900 dark:text-neutral-100">
              {status.description}
            </p>
          </div>

          <Separator />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wide text-neutral-500">
                Informasi Penjual
              </p>
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-sm dark:border-neutral-700 dark:bg-neutral-900">
                <p className="font-medium text-neutral-900 dark:text-neutral-100">
                  {submission.sellerName}
                </p>
                <p className="text-neutral-500 dark:text-neutral-400">
                  {submission.email}
                </p>
                <p className="text-neutral-500 dark:text-neutral-400">
                  {submission.phone}
                </p>
                <p className="text-neutral-500 dark:text-neutral-400">
                  {submission.sellerCity}
                </p>
                <p className="text-neutral-500 dark:text-neutral-400">
                  Preferensi kontak: {submission.preferredContact?.toUpperCase()}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wide text-neutral-500">
                Informasi Produk
              </p>
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-sm dark:border-neutral-700 dark:bg-neutral-900">
                <p className="font-medium text-neutral-900 dark:text-neutral-100">
                  {submission.productName}
                </p>
                <p className="text-neutral-500 dark:text-neutral-400">
                  Kategori: {submission.category}
                </p>
                <p className="text-neutral-500 dark:text-neutral-400 capitalize">
                  Kondisi: {submission.condition}
                </p>
                <p className="text-neutral-500 dark:text-neutral-400">
                  Harga diinginkan: {formatCurrency(submission.askingPrice)}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wide text-neutral-500">
              Deskripsi Produk
            </p>
            <p className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300">
              {submission.productDescription}
            </p>
          </div>

          {submission.productPhotos && submission.productPhotos.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wide text-neutral-500">
                Lampiran Foto
              </p>
              <ul className="space-y-1 rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300">
                {submission.productPhotos.map((photo) => (
                  <li key={photo}>{photo}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
