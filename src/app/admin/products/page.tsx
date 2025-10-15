"use client";

import { useState, useEffect, type ChangeEvent } from "react";
import Image from "next/image";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { db, Product, Category } from "@/lib/database";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

const readFileAsDataURL = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () =>
      reject(reader.error ?? new Error("Gagal membaca file gambar"));
    reader.readAsDataURL(file);
  });

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image: "",
    status: "active" as "active" | "inactive",
  });
  const [imageName, setImageName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageError, setImageError] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async () => {
    const allProducts = await db.products.toArray();
    setProducts(allProducts);
  };

  const loadCategories = async () => {
    const allCategories = await db.categories.toArray();
    setCategories(allCategories);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const sanitizedPrice = parseFloat(formData.price);
    const normalizedImage = imageUrl.trim() || formData.image;

    const productData: Omit<Product, "id"> = {
      name: formData.name,
      description: formData.description,
      price: Number.isNaN(sanitizedPrice) ? 0 : sanitizedPrice,
      category: formData.category,
      image: normalizedImage,
      status: formData.status,
      createdAt: editingProduct?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    if (editingProduct) {
      await db.products.update(editingProduct.id!, productData);
    } else {
      await db.products.add(productData);
    }

    await loadProducts();
    resetForm();
    setIsDialogOpen(false);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      image: product.image,
      status: product.status,
    });
    setImageUrl(product.image?.startsWith("data:") ? "" : product.image);
    setImageName(
      product.image?.startsWith("data:") ? "Unggahan sebelumnya" : ""
    );
    setImageError(null);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
      await db.products.delete(id);
      await loadProducts();
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "",
      image: "",
      status: "active",
    });
    setImageName("");
    setImageUrl("");
    setImageError(null);
    setEditingProduct(null);
  };

  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const input = event.target;

    if (!file.type.startsWith("image/")) {
      setImageError("File harus berupa gambar (JPG, PNG, atau WEBP).");
      input.value = "";
      return;
    }

    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      setImageError("Ukuran file maksimal 2MB.");
      input.value = "";
      return;
    }

    try {
      const dataUrl = await readFileAsDataURL(file);
      setFormData((previous) => ({ ...previous, image: dataUrl }));
      setImageName(file.name);
      setImageUrl("");
      setImageError(null);
    } catch (error) {
      console.error(error);
      setImageError("Gagal memuat gambar. Silakan coba lagi.");
    } finally {
      input.value = "";
    }
  };

  const handleImageUrlChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setImageUrl(value);
    setFormData((previous) => ({ ...previous, image: value.trim() }));
    setImageName("");
    setImageError(null);
  };

  const handleRemoveImage = () => {
    setFormData((previous) => ({ ...previous, image: "" }));
    setImageName("");
    setImageUrl("");
    setImageError(null);
  };

  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: "image",
      header: "Gambar",
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => {
        const image = row.getValue("image") as string | undefined;

        return image ? (
          <div className="flex h-10 w-10 items-center justify-center">
            <Image
              src={image}
              alt={`Produk ${row.original.name}`}
              width={40}
              height={40}
              className="h-10 w-10 rounded-md object-cover"
              unoptimized
            />
          </div>
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-neutral-100 text-xs text-neutral-500">
            N/A
          </div>
        );
      },
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Nama Produk
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return (
          <div className="font-medium">
            <div className="line-clamp-2">{row.getValue("name")}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "category",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Kategori
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return (
          <div className="truncate">{row.getValue("category") || "-"}</div>
        );
      },
    },
    {
      accessorKey: "price",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Harga
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const price = parseFloat(row.getValue("price"));
        return <div className="font-medium">{formatCurrency(price)}</div>;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge
            className={
              status === "active"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-neutral-100 text-neutral-600"
            }
          >
            {status === "active" ? "Aktif" : "Non-aktif"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const product = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Buka menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleEdit(product)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDelete(product.id!)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Hapus
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 md:text-2xl">
            Manajemen Produk
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 md:text-sm">
            Kelola semua produk yang tersedia di etalase Anda.
          </p>
        </div>
        <Button onClick={openAddDialog} className="w-full md:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Tambah Produk
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl">Daftar Produk</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={products}
            searchKey="name"
            searchPlaceholder="Cari produk..."
            mobileHeaders={{
              image: "Gambar",
              name: "Nama Produk",
              category: "Kategori",
              price: "Harga",
              status: "Status",
            }}
          />
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Edit Produk" : "Tambah Produk Baru"}
            </DialogTitle>
            <DialogDescription>
              {editingProduct
                ? "Perbarui informasi produk di bawah ini."
                : "Isi detail untuk menambahkan produk baru."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nama
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Deskripsi
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">
                  Harga
                </Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Kategori
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="image" className="pt-2 text-right">
                  Gambar
                </Label>
                <div className="col-span-3 space-y-3">
                  {formData.image ? (
                    <div className="flex items-center gap-3">
                      <Image
                        src={formData.image}
                        alt={formData.name || "Pratinjau produk"}
                        width={64}
                        height={64}
                        className="h-16 w-16 rounded-md object-cover shadow-sm"
                        unoptimized
                      />
                      <div className="flex flex-col gap-2">
                        <span className="text-xs text-neutral-500">
                          {imageName || "Menggunakan URL langsung"}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleRemoveImage}
                        >
                          Hapus gambar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-neutral-500">
                      Belum ada gambar yang dipilih.
                    </p>
                  )}
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                  <p className="text-xs text-neutral-500">
                    Format JPG, PNG, atau WEBP dengan ukuran maksimal 2MB.
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="image-url" className="text-xs font-medium">
                      Atau gunakan URL gambar
                    </Label>
                    <Input
                      id="image-url"
                      placeholder="https://contoh.com/gambar-produk.jpg"
                      value={imageUrl}
                      onChange={handleImageUrlChange}
                    />
                  </div>
                  {imageError && (
                    <p className="text-xs text-rose-600">{imageError}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: "active" | "inactive") =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Aktif</SelectItem>
                    <SelectItem value="inactive">Non-aktif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">
                {editingProduct ? "Perbarui Produk" : "Tambah Produk"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
