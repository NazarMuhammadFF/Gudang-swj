"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/admin/sidebar";
import { Button } from "@/components/ui/button";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const userStr = window.localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        // Check if user is authenticated and has admin role
        if (user.isAuthenticated && user.role === "admin") {
          setIsAuthenticated(true);
        } else {
          // Not admin, redirect to login
          router.push("/login");
        }
      } catch {
        // Invalid user data, redirect to login
        router.push("/login");
      }
    } else {
      // No user data, redirect to login
      router.push("/login");
    }
    setAuthChecked(true);
  }, [router]);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("user");
    }

    setIsAuthenticated(false);
    router.push("/login");
  };

  const breadcrumbs = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean).slice(0, 4);

    const labelMap: Record<string, string> = {
      admin: "Dashboard",
      products: "Produk",
      categories: "Kategori",
      submissions: "Pengajuan",
      orders: "Pesanan",
    };

    const hrefSegments: string[] = [];

    return segments.map((segment) => {
      hrefSegments.push(segment);
      return {
        label: labelMap[segment] ?? segment,
        href: `/${hrefSegments.join("/")}`,
      };
    });
  }, [pathname]);

  if (!authChecked || !isAuthenticated) {
    return null;
  }

  return (
    <SidebarProvider>
      <AdminSidebar onLogout={handleLogout} />
      <SidebarInset>
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-2 border-b bg-white/80 backdrop-blur transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 dark:bg-neutral-900/80">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400"
            >
              <Link
                href="/admin"
                className="transition hover:text-neutral-800 dark:hover:text-neutral-100"
              >
                Admin
              </Link>
              {breadcrumbs.map(({ href, label }, index) => (
                <div key={href} className="flex items-center gap-2">
                  <span className="text-xs">/</span>
                  {index === breadcrumbs.length - 1 ? (
                    <span className="font-medium text-neutral-700 dark:text-neutral-200">
                      {label}
                    </span>
                  ) : (
                    <Link
                      href={href}
                      className="transition hover:text-neutral-800 dark:hover:text-neutral-100"
                    >
                      {label}
                    </Link>
                  )}
                </div>
              ))}
            </nav>
          </div>

          <div className="ml-auto flex items-center gap-2 px-4">
            <Button variant="outline" size="icon" className="relative h-8 w-8">
              <Bell className="h-4 w-4" />
              <span className="absolute right-0.5 top-0.5 size-2 rounded-full bg-emerald-500" />
            </Button>
            <Button asChild size="sm">
              <Link href="/">Lihat Etalase</Link>
            </Button>
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="mx-auto w-full max-w-7xl space-y-6 pt-6">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
