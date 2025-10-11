'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Edit, Plus, Trash2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { db, Category } from '@/lib/database';

interface CategoryWithUsage extends Category {
  productCount: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryWithUsage[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const loadCategories = useCallback(async () => {
    const [categoryList, productList] = await Promise.all([
      db.categories.orderBy('createdAt').toArray(),
      db.products.toArray(),
    ]);

    const usageMap = productList.reduce<Record<string, number>>((accumulator, product) => {
      if (!accumulator[product.category]) {
        accumulator[product.category] = 0;
      }
      accumulator[product.category] += 1;
      return accumulator;
    }, {});

    const enrichedCategories = categoryList.map((category) => ({
      ...category,
      productCount: usageMap[category.name] ?? 0,
    }));

    setCategories(enrichedCategories);
  }, []);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      return;
    }

    if (editingCategory) {
      const previousName = editingCategory.name;
      await db.categories.update(editingCategory.id!, {
        name: formData.name,
        description: formData.description,
      });

      if (previousName !== formData.name) {
        await db.products
          .where('category')
          .equals(previousName)
          .modify({ category: formData.name });
      }
    } else {
      await db.categories.add({
        name: formData.name,
        description: formData.description,
        createdAt: new Date(),
      });
    }

    await loadCategories();
    resetForm();
    setIsDialogOpen(false);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (category: CategoryWithUsage) => {
    if (category.productCount > 0) {
      alert('Tidak dapat menghapus kategori yang memiliki produk aktif.');
      return;
    }

    if (confirm(`Hapus kategori "${category.name}"?`)) {
      await db.categories.delete(category.id!);
      await loadCategories();
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '' });
    setEditingCategory(null);
  };

  const emptyState = useMemo(() => categories.length === 0, [categories.length]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
            Manajemen Kategori
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Kelompokkan produk ke dalam kategori kurasi agar etalase mudah dinavigasi.
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Tambah Kategori
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Kategori</CardTitle>
          <CardDescription>
            {emptyState
              ? 'Belum ada kategori. Tambahkan kategori untuk mulai mengelompokkan produk.'
              : 'Perbarui dan kelola kategori yang digunakan pada etalase.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead>Jumlah Produk</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {emptyState && (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-sm text-neutral-500">
                    Belum ada kategori tersimpan.
                  </TableCell>
                </TableRow>
              )}
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="text-sm text-neutral-500">
                    {category.description || '-'}
                  </TableCell>
                  <TableCell>{category.productCount}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(category)}
                      >
                        <Edit className="mr-2 h-4 w-4" /> Sunting
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(category)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Hapus
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Sunting Kategori' : 'Tambah Kategori'}
            </DialogTitle>
            <DialogDescription>
              {editingCategory
                ? 'Perbarui informasi kategori untuk menjaga konsistensi katalog.'
                : 'Masukkan detail kategori baru untuk mengelompokkan produk.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Kategori</Label>
              <Input
                id="name"
                placeholder="Contoh: Elektronik Rumah Tangga"
                value={formData.name}
                onChange={(event) =>
                  setFormData((previous) => ({
                    ...previous,
                    name: event.target.value,
                  }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                placeholder="Tuliskan detail singkat mengenai kategori ini"
                value={formData.description}
                onChange={(event) =>
                  setFormData((previous) => ({
                    ...previous,
                    description: event.target.value,
                  }))
                }
                rows={4}
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
              <Button type="submit">
                {editingCategory ? 'Simpan Perubahan' : 'Tambah Kategori'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
