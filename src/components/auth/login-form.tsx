"use client";

import { Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        throw error;
      }
      router.push("/dashboard");
    } catch (error: unknown) {
      setError(
        error instanceof Error ? error.message : "Ocurrió un error al ingresar"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleMagicLinkLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    if (!email) {
      setError("Ingresa tu email");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm?next=/dashboard`,
        },
      });
      if (error) {
        throw error;
      }
      setSuccess(
        "Te enviamos un enlace mágico a tu correo. Revisa tu bandeja de entrada."
      );
    } catch (error: unknown) {
      setError(
        error instanceof Error
          ? error.message
          : "Ocurrió un error al enviar el enlace"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Iniciar sesión</CardTitle>
          <CardDescription>
            Elige cómo quieres acceder a tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs className="w-full" defaultValue="magic-link">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="magic-link">Magic Link</TabsTrigger>
              <TabsTrigger value="password">Contraseña</TabsTrigger>
            </TabsList>

            <TabsContent value="magic-link">
              <form className="mt-4" onSubmit={handleMagicLinkLogin}>
                <div className="flex flex-col gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email-magic">Email</Label>
                    <Input
                      id="email-magic"
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      required
                      type="email"
                      value={email}
                    />
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Te enviaremos un enlace mágico a tu correo para iniciar
                    sesión sin contraseña.
                  </p>
                  {error && <p className="text-red-500 text-sm">{error}</p>}
                  {success && (
                    <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-green-700 text-sm dark:text-green-400">
                      <Mail className="size-4" />
                      {success}
                    </div>
                  )}
                  <Button
                    className="w-full"
                    disabled={isLoading || !!success}
                    type="submit"
                  >
                    {isLoading ? "Enviando..." : "Enviar enlace mágico"}
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="password">
              <form className="mt-4" onSubmit={handlePasswordLogin}>
                <div className="flex flex-col gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email-password">Email</Label>
                    <Input
                      id="email-password"
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      required
                      type="email"
                      value={email}
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <Label htmlFor="password">Contraseña</Label>
                      <Link
                        className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                        href="/auth/forgot-password"
                      >
                        ¿Olvidaste tu contraseña?
                      </Link>
                    </div>
                    <Input
                      id="password"
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      type="password"
                      value={password}
                    />
                  </div>
                  {error && <p className="text-red-500 text-sm">{error}</p>}
                  <Button className="w-full" disabled={isLoading} type="submit">
                    {isLoading ? "Ingresando..." : "Ingresar"}
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center text-sm">
            ¿No tienes cuenta?{" "}
            <Link className="underline underline-offset-4" href="/auth/sign-up">
              Crear cuenta
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
