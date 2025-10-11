import type { ReactNode } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { AdminSidebar } from "@/components/admin/sidebar";
import { Button } from "@/components/ui/button";

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <div className="flex min-h-screen">
        <AdminSidebar />

        <div className="flex flex-1 flex-col">
          <header className="flex h-20 items-center justify-between border-b bg-white/80 px-6 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/60">
            <div>
              <h1 className="text-xl font-semibold">BekasBerkah Control Center</h1>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Kelola inventori, pengajuan, dan pesanan secara terpusat.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                <span className="absolute right-1 top-1 size-2 rounded-full bg-emerald-500" />
              </Button>
              <Button asChild className="hidden md:inline-flex">
                <Link href="/">Lihat Etalase</Link>
              </Button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            <div className="mx-auto max-w-6xl space-y-8">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
