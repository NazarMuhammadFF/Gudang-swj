"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LayoutDashboard, LogIn, UserCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DEMO_USER_EVENT,
  isDemoUserLoggedIn,
  loadDemoProfile,
} from "@/lib/demo-user";

type NavUserButtonProps = {
  hideAdminShortcut?: boolean;
};

export function NavUserButton({ hideAdminShortcut = false }: NavUserButtonProps) {
  const [mounted, setMounted] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [firstName, setFirstName] = useState("User");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const updateState = () => {
      const logged = isDemoUserLoggedIn();
      setLoggedIn(logged);
      if (logged) {
        const profile = loadDemoProfile();
        const name = profile.name?.trim() || "User";
        setFirstName(name.split(" ")[0] || "User");
      } else {
        setFirstName("User");
      }

      if (typeof window !== "undefined") {
        try {
          const storedUser = window.localStorage.getItem("user");
          if (!storedUser) {
            setIsAdmin(false);
            return;
          }

          const parsed = JSON.parse(storedUser) as {
            role?: string;
            isAuthenticated?: boolean;
          };
          const hasAdminRole =
            parsed.role === "admin" && parsed.isAuthenticated !== false;
          setIsAdmin(hasAdminRole);
        } catch {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    };

    setMounted(true);
    updateState();

    const handleCustom = () => updateState();
    const handleStorage = () => updateState();

    window.addEventListener(DEMO_USER_EVENT, handleCustom);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(DEMO_USER_EVENT, handleCustom);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  if (!mounted) {
    return null;
  }

  if (!loggedIn) {
    return (
      <>
        <Button
          variant="ghost"
          size="sm"
          className="hidden md:inline-flex"
          asChild
        >
          <Link href="/login">Login</Link>
        </Button>
        <Button variant="ghost" size="icon" className="md:hidden" asChild>
          <Link href="/login">
            <LogIn className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Login</span>
          </Link>
        </Button>
      </>
    );
  }

  const renderAccountButton = () => (
    <>
      <Button
        variant="outline"
        size="sm"
        className="hidden items-center gap-2 md:inline-flex"
        asChild
      >
        <Link href="/account">
          <UserCircle className="h-4 w-4" aria-hidden="true" />
          <span>{firstName}</span>
        </Link>
      </Button>
      <Button variant="ghost" size="icon" className="md:hidden" asChild>
        <Link href="/account">
          <UserCircle className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">Akun</span>
        </Link>
      </Button>
    </>
  );

  if (isAdmin) {
    if (hideAdminShortcut) {
      return renderAccountButton();
    }

    return (
      <>
        <Button
          variant="outline"
          size="sm"
          className="hidden items-center gap-2 md:inline-flex"
          asChild
        >
          <Link href="/admin">
            <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
            <span>Admin Panel</span>
          </Link>
        </Button>
        <Button variant="ghost" size="icon" className="md:hidden" asChild>
          <Link href="/admin">
            <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Admin Panel</span>
          </Link>
        </Button>
      </>
    );
  }

  return renderAccountButton();
}
