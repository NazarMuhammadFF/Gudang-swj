"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { PackageCheck, Plus, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { db, Order, OrderStatus } from "@/lib/database";

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Menunggu Pembayaran",
  processing: "Sedang Diproses",
  shipped: "Dikirim",
  delivered: "Selesai",
  cancelled: "Dibatalkan",
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    orderNumber: "",
    customerName: "",
    email: "",
    total: "",
    status: "pending" as OrderStatus,
    itemsDescription: "",
  });

  const loadOrders = useCallback(async () => {
    const orderList = await db.orders.orderBy("createdAt").reverse().toArray();
    setOrders(orderList);
  }, []);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formData.orderNumber.trim()) {
      return;
    }

    await db.orders.add({
      orderNumber: formData.orderNumber,
      customerName: formData.customerName,
      email: formData.email,
      total: Number(formData.total) || 0,
      status: formData.status,
      itemsDescription: formData.itemsDescription,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await loadOrders();
    resetForm();
    setIsDialogOpen(false);
  };

  const handleStatusChange = async (order: Order, status: OrderStatus) => {
    await db.orders.update(order.id!, {
      status,
      updatedAt: new Date(),
    });
    await loadOrders();
  };

  const handleDelete = async (order: Order) => {
    if (confirm(`Hapus pesanan #${order.orderNumber}?`)) {
      await db.orders.delete(order.id!);
      await loadOrders();
    }
  };

  const resetForm = () => {
    setFormData({
      orderNumber: "",
      customerName: "",
      email: "",
      total: "",
      status: "pending",
      itemsDescription: "",
    });
  };

  const emptyState = useMemo(() => orders.length === 0, [orders.length]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 md:text-2xl">
            Manajemen Pesanan
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 md:text-sm">
            Pantau setiap tahapan pesanan mulai dari pembayaran hingga
            pengiriman.
          </p>
        </div>
        <Button
          onClick={() => setIsDialogOpen(true)}
          className="w-full md:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" /> Catat Pesanan
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl">Daftar Pesanan</CardTitle>
          <CardDescription className="text-xs md:text-sm">
            {emptyState
              ? "Belum ada pesanan yang tercatat."
              : "Perbarui status pesanan untuk menjaga transparansi pelanggan."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[120px]">Nomor Pesanan</TableHead>
                  <TableHead className="min-w-[150px]">Pelanggan</TableHead>
                  <TableHead className="min-w-[120px]">Status</TableHead>
                  <TableHead className="hidden min-w-[180px] lg:table-cell">
                    Catatan Item
                  </TableHead>
                  <TableHead className="hidden min-w-[100px] sm:table-cell">
                    Tanggal
                  </TableHead>
                  <TableHead className="min-w-[100px] text-right">
                    Nilai
                  </TableHead>
                  <TableHead className="min-w-[180px] text-right">
                    Aksi
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {emptyState && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-8 text-center text-xs text-neutral-500 sm:text-sm"
                    >
                      Belum ada data pesanan.
                    </TableCell>
                  </TableRow>
                )}
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      <span className="truncate">#{order.orderNumber}</span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="truncate">{order.customerName}</p>
                        <p className="truncate text-xs text-neutral-500">
                          {order.email || "-"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-sky-100 text-sky-700">
                        {STATUS_LABELS[order.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden text-sm text-neutral-500 lg:table-cell">
                      <span className="line-clamp-2">
                        {order.itemsDescription || "-"}
                      </span>
                    </TableCell>
                    <TableCell className="hidden text-sm text-neutral-500 sm:table-cell">
                      {new Date(order.createdAt).toLocaleDateString("id-ID")}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(order.total)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Select
                          value={order.status}
                          onValueChange={(value: OrderStatus) =>
                            void handleStatusChange(order, value)
                          }
                        >
                          <SelectTrigger className="w-[100px] sm:w-[140px]">
                            <SelectValue placeholder="Ubah status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">
                              Menunggu Pembayaran
                            </SelectItem>
                            <SelectItem value="processing">
                              Sedang Diproses
                            </SelectItem>
                            <SelectItem value="shipped">Dikirim</SelectItem>
                            <SelectItem value="delivered">Selesai</SelectItem>
                            <SelectItem value="cancelled">
                              Dibatalkan
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(order)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            resetForm();
          }
        }}
      >
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Catat Pesanan Manual</DialogTitle>
            <DialogDescription>
              Simulasikan pesanan untuk mendemonstrasikan alur pemrosesan admin.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="orderNumber">Nomor Pesanan</Label>
                <Input
                  id="orderNumber"
                  value={formData.orderNumber}
                  onChange={(event) =>
                    setFormData((previous) => ({
                      ...previous,
                      orderNumber: event.target.value,
                    }))
                  }
                  placeholder="INV-2025-001"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="total">Total Pembayaran</Label>
                <Input
                  id="total"
                  type="number"
                  min="0"
                  value={formData.total}
                  onChange={(event) =>
                    setFormData((previous) => ({
                      ...previous,
                      total: event.target.value,
                    }))
                  }
                  placeholder="1500000"
                  required
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="customerName">Nama Pelanggan</Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(event) =>
                    setFormData((previous) => ({
                      ...previous,
                      customerName: event.target.value,
                    }))
                  }
                  placeholder="Contoh: Budi Santoso"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(event) =>
                    setFormData((previous) => ({
                      ...previous,
                      email: event.target.value,
                    }))
                  }
                  placeholder="pelanggan@mail.com"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status Pesanan</Label>
              <Select
                value={formData.status}
                onValueChange={(value: OrderStatus) =>
                  setFormData((previous) => ({
                    ...previous,
                    status: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Menunggu Pembayaran</SelectItem>
                  <SelectItem value="processing">Sedang Diproses</SelectItem>
                  <SelectItem value="shipped">Dikirim</SelectItem>
                  <SelectItem value="delivered">Selesai</SelectItem>
                  <SelectItem value="cancelled">Dibatalkan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="itemsDescription">Detail Item</Label>
              <Textarea
                id="itemsDescription"
                rows={4}
                value={formData.itemsDescription}
                onChange={(event) =>
                  setFormData((previous) => ({
                    ...previous,
                    itemsDescription: event.target.value,
                  }))
                }
                placeholder="Contoh: 1x Sofa Minimalis, 2x Bantal Dekorasi"
              />
            </div>
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetForm();
                  setIsDialogOpen(false);
                }}
              >
                Batal
              </Button>
              <Button type="submit" className="gap-2">
                <PackageCheck className="h-4 w-4" /> Simpan Pesanan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
