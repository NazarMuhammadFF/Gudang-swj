'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Shapes,
  Inbox,
  ShoppingCart,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

const navigation = [
  {
    label: 'Overview',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    label: 'Products',
    href: '/admin/products',
    icon: Package,
  },
  {
    label: 'Categories',
    href: '/admin/categories',
    icon: Shapes,
  },
  {
    label: 'Submissions',
    href: '/admin/submissions',
    icon: Inbox,
  },
  {
    label: 'Orders',
    href: '/admin/orders',
    icon: ShoppingCart,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden border-r bg-white/95 backdrop-blur dark:bg-neutral-900/80 lg:flex lg:w-72 lg:flex-col">
      <div className="flex h-20 items-center gap-3 px-6">
        <div className="grid size-10 place-items-center rounded-xl bg-emerald-100 text-emerald-600">
          <span className="text-lg font-bold">BB</span>
        </div>
        <div>
          <p className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
            BekasBerkah Admin
          </p>
          <p className="text-sm text-neutral-500">Curated second-hand marketplace</p>
        </div>
      </div>

      <Separator className="mx-6" />

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                'hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-900/30',
                isActive
                  ? 'bg-emerald-600 text-white hover:bg-emerald-600 hover:text-white'
                  : 'text-neutral-600 dark:text-neutral-300',
              )}
            >
              <Icon className={cn('h-4 w-4', isActive ? 'text-white' : 'text-neutral-400')} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <Separator className="mx-6" />

      <div className="flex items-center gap-3 px-6 py-4">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-emerald-600 text-white">AD</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Admin Demo</p>
          <p className="text-xs text-neutral-500">admin@bekasberkah.app</p>
        </div>
      </div>
    </aside>
  );
}
