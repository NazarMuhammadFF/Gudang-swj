"use client";

import { useCallback, useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  MoreHorizontal,
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
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
import { db, Order, OrderStatus } from "@/lib/database";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

const statusConfig: Record<
  OrderStatus,
  { label: string; className: string; icon: React.ReactNode }
> = {
  pending: {
    label: "Pending",
    className: "bg-amber-100 text-amber-700",
    icon: <Clock className="mr-1 h-3 w-3" />,
  },
  processing: {
    label: "Diproses",
    className: "bg-sky-100 text-sky-700",
    icon: <Package className="mr-1 h-3 w-3" />,
  },
  shipped: {
    label: "Dikirim",
    className: "bg-indigo-100 text-indigo-700",
    icon: <Truck className="mr-1 h-3 w-3" />,
  },
  delivered: {
    label: "Selesai",
    className: "bg-emerald-100 text-emerald-700",
    icon: <CheckCircle2 className="mr-1 h-3 w-3" />,
  },
  cancelled: {
    label: "Dibatalkan",
    className: "bg-neutral-200 text-neutral-600",
    icon: <XCircle className="mr-1 h-3 w-3" />,
  },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  const loadOrders = useCallback(async () => {
    const allOrders = await db.orders.orderBy("createdAt").reverse().toArray();
    setOrders(allOrders);
  }, []);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  const handleStatusUpdate = async (id: number, status: OrderStatus) => {
    await db.orders.update(id, {
      status,
      updatedAt: new Date(),
    });
    await loadOrders();
  };

  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: "orderNumber",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            No. Order
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return (
          <div className="font-mono font-semibold text-neutral-900 dark:text-neutral-100">
            #{row.getValue("orderNumber")}
          </div>
        );
      },
    },
    {
      accessorKey: "customerName",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Pelanggan
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return (
          <div>
            <div className="font-medium">{row.getValue("customerName")}</div>
            <div className="text-xs text-neutral-500">{row.original.email}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "itemsDescription",
      header: "Item",
      cell: ({ row }) => {
        return (
          <div className="line-clamp-2 max-w-xs text-sm text-neutral-600">
            {row.getValue("itemsDescription")}
          </div>
        );
      },
    },
    {
      accessorKey: "total",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Total
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const total = parseFloat(row.getValue("total"));
        return (
          <div className="font-semibold text-neutral-900 dark:text-neutral-100">
            {formatCurrency(total)}
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
        const status = row.getValue("status") as OrderStatus;
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
        const order = row.original;
        const isCompleted =
          order.status === "delivered" || order.status === "cancelled";

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
                onClick={() => handleStatusUpdate(order.id!, "processing")}
                disabled={isCompleted || order.status === "processing"}
              >
                <Package className="mr-2 h-4 w-4 text-sky-600" />
                Proses
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleStatusUpdate(order.id!, "shipped")}
                disabled={
                  isCompleted ||
                  order.status === "shipped" ||
                  order.status === "pending"
                }
              >
                <Truck className="mr-2 h-4 w-4 text-indigo-600" />
                Kirim
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleStatusUpdate(order.id!, "delivered")}
                disabled={isCompleted || order.status !== "shipped"}
              >
                <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-600" />
                Selesai
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleStatusUpdate(order.id!, "cancelled")}
                disabled={isCompleted}
                className="text-red-600"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Batalkan
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const processingCount = orders.filter((o) => o.status === "processing").length;
  const shippedCount = orders.filter((o) => o.status === "shipped").length;
  const deliveredCount = orders.filter((o) => o.status === "delivered").length;

  const totalRevenue = orders
    .filter((o) => o.status === "delivered")
    .reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 md:text-2xl">
            Manajemen Pesanan
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 md:text-sm">
            Pantau dan kelola status pemesanan pelanggan.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="bg-amber-50 text-amber-700">
            <Clock className="mr-1 h-3 w-3" />
            {pendingCount} Pending
          </Badge>
          <Badge variant="outline" className="bg-sky-50 text-sky-700">
            <Package className="mr-1 h-3 w-3" />
            {processingCount} Proses
          </Badge>
          <Badge variant="outline" className="bg-indigo-50 text-indigo-700">
            <Truck className="mr-1 h-3 w-3" />
            {shippedCount} Kirim
          </Badge>
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            {deliveredCount} Selesai
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">
              Total Pesanan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">
              Pesanan Aktif
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pendingCount + processingCount + shippedCount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">
              Total Pendapatan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl">Daftar Pesanan</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={orders}
            searchKey="orderNumber"
            searchPlaceholder="Cari nomor order atau pelanggan..."
          />
        </CardContent>
      </Card>
    </div>
  );
}
