"use client";

import { useState } from "react";
import { toast } from "sonner";
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
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";

interface ProfileFormProps {
  profile: Profile | null;
  email: string;
}

export function ProfileForm({ profile, email }: ProfileFormProps) {
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name ?? "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName.trim() || null })
      .eq("id", profile?.id ?? "");

    setLoading(false);

    if (error) {
      toast.error("Error al actualizar el perfil");
    } else {
      toast.success("Perfil actualizado");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Información personal</CardTitle>
          <CardDescription>Actualiza tu información de perfil</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input disabled id="email" value={email} />
              <p className="text-muted-foreground text-xs">
                El email no se puede cambiar
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Nombre completo</Label>
              <Input
                id="fullName"
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Tu nombre"
                value={fullName}
              />
            </div>

            <Button disabled={loading} type="submit">
              {loading ? "Guardando..." : "Guardar cambios"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
