"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Trash2, Upload } from "lucide-react";
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
import { db, Submission } from "@/lib/database";

const submissionStatusCopy: Record<Submission["status"], string> = {
  pending: "Menunggu Review",
  approved: "Disetujui",
  rejected: "Ditolak",
};

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    sellerName: "",
    email: "",
    phone: "",
    productName: "",
    category: "",
    condition: "excellent" as Submission["condition"],
    notes: "",
  });

  const loadSubmissions = useCallback(async () => {
    const submissionList = await db.submissions
      .orderBy("createdAt")
      .reverse()
      .toArray();
    setSubmissions(submissionList);
  }, []);

  useEffect(() => {
    void loadSubmissions();
  }, [loadSubmissions]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formData.productName.trim()) {
      return;
    }

    await db.submissions.add({
      ...formData,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await loadSubmissions();
    resetForm();
    setIsDialogOpen(false);
  };

  const handleStatusUpdate = async (
    submission: Submission,
    status: Submission["status"]
  ) => {
    await db.submissions.update(submission.id!, {
      status,
      updatedAt: new Date(),
    });
    await loadSubmissions();
  };

  const handleDelete = async (submission: Submission) => {
    if (
      confirm(
        `Hapus pengajuan "${submission.productName}" dari ${submission.sellerName}?`
      )
    ) {
      await db.submissions.delete(submission.id!);
      await loadSubmissions();
    }
  };

  const resetForm = () => {
    setFormData({
      sellerName: "",
      email: "",
      phone: "",
      productName: "",
      category: "",
      condition: "excellent",
      notes: "",
    });
  };

  const emptyState = useMemo(
    () => submissions.length === 0,
    [submissions.length]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 md:text-2xl">
            Pengajuan Penjual
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 md:text-sm">
            Tinjau pengajuan barang bekas yang masuk sebelum dipublikasikan ke
            etalase.
          </p>
        </div>
        <Button
          onClick={() => setIsDialogOpen(true)}
          className="w-full md:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" /> Catat Pengajuan
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl">Antrian Review</CardTitle>
          <CardDescription className="text-xs md:text-sm">
            {emptyState
              ? "Belum ada pengajuan yang tercatat."
              : "Gunakan kolom aksi untuk memperbarui status review."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[150px]">Produk</TableHead>
                  <TableHead className="min-w-[120px]">Penjual</TableHead>
                  <TableHead className="hidden min-w-[120px] md:table-cell">
                    Kontak
                  </TableHead>
                  <TableHead className="min-w-[100px]">Status</TableHead>
                  <TableHead className="hidden min-w-[100px] sm:table-cell">
                    Kondisi
                  </TableHead>
                  <TableHead className="hidden min-w-[100px] lg:table-cell">
                    Tanggal
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
                      Belum ada pengajuan masuk.
                    </TableCell>
                  </TableRow>
                )}
                {submissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell className="font-medium">
                      <span className="line-clamp-2">
                        {submission.productName}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="truncate">{submission.sellerName}</p>
                        <p className="truncate text-xs text-neutral-500">
                          {submission.category || "Tanpa kategori"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="space-y-1 text-xs">
                        <p className="truncate">{submission.email}</p>
                        <p className="truncate">{submission.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-emerald-100 text-emerald-700">
                        {submissionStatusCopy[submission.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden capitalize sm:table-cell">
                      {submission.condition}
                    </TableCell>
                    <TableCell className="hidden text-sm text-neutral-500 lg:table-cell">
                      {new Date(submission.createdAt).toLocaleDateString(
                        "id-ID"
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Select
                          value={submission.status}
                          onValueChange={(value: Submission["status"]) =>
                            void handleStatusUpdate(submission, value)
                          }
                        >
                          <SelectTrigger className="w-[100px] sm:w-[140px]">
                            <SelectValue placeholder="Ubah status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">
                              Menunggu Review
                            </SelectItem>
                            <SelectItem value="approved">Setujui</SelectItem>
                            <SelectItem value="rejected">Tolak</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(submission)}
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
            <DialogTitle>Catat Pengajuan Manual</DialogTitle>
            <DialogDescription>
              Simulasikan pengajuan barang dari penjual untuk kebutuhan demo.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="sellerName">Nama Penjual</Label>
                <Input
                  id="sellerName"
                  value={formData.sellerName}
                  onChange={(event) =>
                    setFormData((previous) => ({
                      ...previous,
                      sellerName: event.target.value,
                    }))
                  }
                  placeholder="Contoh: Rina Saputra"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">No. WhatsApp</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(event) =>
                    setFormData((previous) => ({
                      ...previous,
                      phone: event.target.value,
                    }))
                  }
                  placeholder="0812-xxxx-xxxx"
                  required
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
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
                  placeholder="penjual@mail.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Kategori</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(event) =>
                    setFormData((previous) => ({
                      ...previous,
                      category: event.target.value,
                    }))
                  }
                  placeholder="Contoh: Furnitur"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="productName">Nama Produk</Label>
              <Input
                id="productName"
                value={formData.productName}
                onChange={(event) =>
                  setFormData((previous) => ({
                    ...previous,
                    productName: event.target.value,
                  }))
                }
                placeholder="Contoh: Sofa Minimalis"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="condition">Kondisi Barang</Label>
              <Select
                value={formData.condition}
                onValueChange={(value: Submission["condition"]) =>
                  setFormData((previous) => ({
                    ...previous,
                    condition: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kondisi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excellent">Sangat Baik</SelectItem>
                  <SelectItem value="good">Baik</SelectItem>
                  <SelectItem value="fair">Layak Pakai</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Catatan Tambahan</Label>
              <Textarea
                id="notes"
                rows={4}
                value={formData.notes}
                onChange={(event) =>
                  setFormData((previous) => ({
                    ...previous,
                    notes: event.target.value,
                  }))
                }
                placeholder="Tuliskan detail kondisi atau catatan inspeksi"
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
                <Upload className="h-4 w-4" /> Simpan Pengajuan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
