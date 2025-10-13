"use client";

import { useCallback, useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { db, Submission, SubmissionStatus } from "@/lib/database";

const statusConfig: Record<
  SubmissionStatus,
  { label: string; className: string; icon: React.ReactNode }
> = {
  pending: {
    label: "Menunggu",
    className: "bg-amber-100 text-amber-700",
    icon: <Clock className="mr-1 h-3 w-3" />,
  },
  approved: {
    label: "Disetujui",
    className: "bg-emerald-100 text-emerald-700",
    icon: <CheckCircle2 className="mr-1 h-3 w-3" />,
  },
  rejected: {
    label: "Ditolak",
    className: "bg-rose-100 text-rose-700",
    icon: <XCircle className="mr-1 h-3 w-3" />,
  },
};

const conditionConfig: Record<string, { label: string; className: string }> = {
  excellent: {
    label: "Sangat Baik",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  good: {
    label: "Baik",
    className: "bg-sky-50 text-sky-700 border-sky-200",
  },
  fair: {
    label: "Cukup",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
};

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  const loadSubmissions = useCallback(async () => {
    const allSubmissions = await db.submissions
      .orderBy("createdAt")
      .reverse()
      .toArray();
    setSubmissions(allSubmissions);
  }, []);

  useEffect(() => {
    void loadSubmissions();
  }, [loadSubmissions]);

  const handleStatusUpdate = async (id: number, status: SubmissionStatus) => {
    await db.submissions.update(id, {
      status,
      updatedAt: new Date(),
    });
    await loadSubmissions();
  };

  const columns: ColumnDef<Submission>[] = [
    {
      accessorKey: "sellerName",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Penjual
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return (
          <div>
            <div className="font-medium">{row.getValue("sellerName")}</div>
            <div className="text-xs text-neutral-500">{row.original.email}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "productName",
      header: "Produk",
      cell: ({ row }) => {
        return (
          <div>
            <div className="line-clamp-2 font-medium">
              {row.getValue("productName")}
            </div>
            <div className="text-xs text-neutral-500">{row.original.category}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "condition",
      header: "Kondisi",
      cell: ({ row }) => {
        const condition = row.getValue("condition") as string;
        const config = conditionConfig[condition];
        return (
          <Badge variant="outline" className={config?.className}>
            {config?.label || condition}
          </Badge>
        );
      },
    },
    {
      accessorKey: "phone",
      header: "Kontak",
      cell: ({ row }) => {
        return (
          <div className="text-sm font-mono text-neutral-600">
            {row.getValue("phone")}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Status
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const status = row.getValue("status") as SubmissionStatus;
        const config = statusConfig[status];
        return (
          <Badge className={config.className}>
            {config.icon}
            {config.label}
          </Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Tanggal
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const date = row.getValue("createdAt") as Date;
        return (
          <div className="text-sm text-neutral-600">
            {new Date(date).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </div>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const submission = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Buka menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ubah Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleStatusUpdate(submission.id!, "approved")}
                disabled={submission.status === "approved"}
              >
                <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-600" />
                Setujui
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleStatusUpdate(submission.id!, "rejected")}
                disabled={submission.status === "rejected"}
              >
                <XCircle className="mr-2 h-4 w-4 text-rose-600" />
                Tolak
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleStatusUpdate(submission.id!, "pending")}
                disabled={submission.status === "pending"}
              >
                <Clock className="mr-2 h-4 w-4 text-amber-600" />
                Pending
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const pendingCount = submissions.filter((s) => s.status === "pending").length;
  const approvedCount = submissions.filter((s) => s.status === "approved").length;
  const rejectedCount = submissions.filter((s) => s.status === "rejected").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 md:text-2xl">
            Pengajuan Penjual
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 md:text-sm">
            Review dan kelola pengajuan produk dari penjual.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="bg-amber-50 text-amber-700">
            <Clock className="mr-1 h-3 w-3" />
            {pendingCount} Pending
          </Badge>
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            {approvedCount} Disetujui
          </Badge>
          <Badge variant="outline" className="bg-rose-50 text-rose-700">
            <XCircle className="mr-1 h-3 w-3" />
            {rejectedCount} Ditolak
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl">
            Daftar Pengajuan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={submissions}
            searchKey="productName"
            searchPlaceholder="Cari produk atau penjual..."
          />
        </CardContent>
      </Card>
    </div>
  );
}
