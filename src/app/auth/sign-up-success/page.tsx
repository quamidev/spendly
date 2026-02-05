import { CheckCircle, Mail } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="size-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Cuenta creada</CardTitle>
            <CardDescription>
              Tu cuenta ha sido creada exitosamente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 rounded-lg border bg-muted/50 p-4">
              <Mail className="size-5 text-muted-foreground" />
              <div className="text-sm">
                <p className="font-medium">Revisa tu correo</p>
                <p className="text-muted-foreground">
                  Te enviamos un enlace de confirmación
                </p>
              </div>
            </div>
            <Button asChild className="w-full">
              <Link href="/auth/login">Ir a iniciar sesión</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
