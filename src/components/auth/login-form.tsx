"use client";

import { Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("Auth.login");

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
      setError(error instanceof Error ? error.message : t("errorLogin"));
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
      setError(t("errorEnterEmail"));
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
      setSuccess(t("magicLinkSuccess"));
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : t("errorMagicLink"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs className="w-full" defaultValue="magic-link">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="magic-link">{t("tabMagicLink")}</TabsTrigger>
              <TabsTrigger value="password">{t("tabPassword")}</TabsTrigger>
            </TabsList>

            <TabsContent value="magic-link">
              <form className="mt-4" onSubmit={handleMagicLinkLogin}>
                <div className="flex flex-col gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email-magic">{t("email")}</Label>
                    <Input
                      id="email-magic"
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t("emailPlaceholder")}
                      required
                      type="email"
                      value={email}
                    />
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {t("magicLinkInfo")}
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
                    {isLoading ? t("sending") : t("sendMagicLink")}
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="password">
              <form className="mt-4" onSubmit={handlePasswordLogin}>
                <div className="flex flex-col gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email-password">{t("email")}</Label>
                    <Input
                      id="email-password"
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t("emailPlaceholder")}
                      required
                      type="email"
                      value={email}
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <Label htmlFor="password">{t("password")}</Label>
                      <Link
                        className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                        href="/auth/forgot-password"
                      >
                        {t("forgotPassword")}
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
                    {isLoading ? t("loggingIn") : t("logIn")}
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center text-sm">
            {t("noAccount")}{" "}
            <Link className="underline underline-offset-4" href="/auth/sign-up">
              {t("createAccount")}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
