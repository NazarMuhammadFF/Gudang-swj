"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import Link from "next/link";
import { Bell, Menu } from "lucide-react";
import { AdminSidebar, SidebarContent } from "@/components/admin/sidebar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { DialogTitle } from "@/components/ui/dialog";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <div className="flex min-h-screen">
        {/* Desktop Sidebar */}
        <AdminSidebar />

        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-white/80 px-4 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/60 md:h-20 md:px-6">
            <div className="flex items-center gap-3">
              {/* Mobile Menu Button */}
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden"
                    aria-label="Toggle menu"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 p-0">
                  <VisuallyHidden>
                    <DialogTitle>Navigation Menu</DialogTitle>
                  </VisuallyHidden>
                  <SidebarContent onNavigate={() => setOpen(false)} />
                </SheetContent>
              </Sheet>

              <div className="hidden md:block">
                <h1 className="text-lg font-semibold md:text-xl">
                  BekasBerkah Control Center
                </h1>
                <p className="hidden text-sm text-neutral-500 dark:text-neutral-400 lg:block">
                  Kelola inventori, pengajuan, dan pesanan secara terpusat.
                </p>
              </div>

              {/* Mobile Title */}
              <div className="md:hidden">
                <h1 className="text-base font-semibold">Admin Panel</h1>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              <Button
                variant="outline"
                size="icon"
                className="relative h-9 w-9 md:h-10 md:w-10"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute right-1 top-1 size-2 rounded-full bg-emerald-500" />
              </Button>
              <Button asChild className="hidden sm:inline-flex">
                <Link href="/">Lihat Etalase</Link>
              </Button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            <div className="mx-auto w-full max-w-7xl space-y-6 md:space-y-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
