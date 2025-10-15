"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Package, Lock, Mail, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import {
  defaultDemoProfile,
  saveDemoProfile,
  setDemoUserLoggedIn,
} from "@/lib/demo-user";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simple authentication check
      if (email === "admin@bekasberkah.id" && password === "admin123") {
        // Admin login
        localStorage.setItem(
          "user",
          JSON.stringify({
            email: "admin@bekasberkah.id",
            name: "Admin",
            role: "admin",
            isAuthenticated: true,
          })
        );

        saveDemoProfile({
          ...defaultDemoProfile,
          name: "Admin BekasBerkah",
          email: "admin@bekasberkah.id",
          phone: "021-1234-5678",
          address: "Kantor Pusat BekasBerkah, Jakarta",
        });
        setDemoUserLoggedIn(true);

        toast.success("Login berhasil!", {
          description: "Selamat datang Admin",
        });

        router.push("/admin");
      } else if (email === "user@bekasberkah.id" && password === "user123") {
        // User login
        localStorage.setItem(
          "user",
          JSON.stringify({
            email: "user@bekasberkah.id",
            name: "User Demo",
            role: "user",
            isAuthenticated: true,
          })
        );

        saveDemoProfile({
          ...defaultDemoProfile,
          name: "User Demo",
          email: "user@bekasberkah.id",
          phone: "0821-4567-8901",
          address: "Jl. Ahmad Yani No. 45, Semarang",
        });
        setDemoUserLoggedIn(true);

        toast.success("Login berhasil!", {
          description: "Selamat datang kembali",
        });

        router.push("/account");
      } else {
        toast.error("Login gagal", {
          description: "Email atau password salah",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Terjadi kesalahan", {
        description: "Silakan coba lagi",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 dark:bg-neutral-950">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <Package className="h-8 w-8 text-emerald-600" />
            <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              BekasBerkah
            </span>
          </Link>
        </div>

        {/* Login Card */}
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Masuk</CardTitle>
            <CardDescription>
              Masukkan email dan password Anda untuk melanjutkan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="nama@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Memproses...
                  </>
                ) : (
                  "Masuk"
                )}
              </Button>
            </form>

            {/* Demo Accounts Info */}
            <div className="mt-6 space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-neutral-500 dark:bg-neutral-950">
                    Akun Demo
                  </span>
                </div>
              </div>

              <div className="space-y-3 rounded-lg bg-neutral-50 p-4 text-sm dark:bg-neutral-900">
                <div>
                  <p className="mb-1 font-semibold text-neutral-900 dark:text-neutral-100">
                    Admin Account:
                  </p>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Email: admin@bekasberkah.id
                  </p>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Password: admin123
                  </p>
                </div>
                <div>
                  <p className="mb-1 font-semibold text-neutral-900 dark:text-neutral-100">
                    User Account:
                  </p>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Email: user@bekasberkah.id
                  </p>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Password: user123
                  </p>
                </div>
              </div>
            </div>

            {/* Back to Home */}
            <div className="mt-6 text-center">
              <Link
                href="/"
                className="text-sm text-emerald-600 hover:text-emerald-700 hover:underline"
              >
                Kembali ke Beranda
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer Note */}
        <p className="mt-6 text-center text-xs text-neutral-500">
          Ini adalah aplikasi demo. Gunakan akun demo di atas untuk login.
        </p>
      </div>
    </div>
  );
}
