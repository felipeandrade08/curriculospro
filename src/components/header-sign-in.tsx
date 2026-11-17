"use client";
import Link from "next/link";
import { authClient } from "@/lib/auth/client";

/** Botão "Entrar" do cabeçalho: some quando a pessoa já está logada. */
export function HeaderSignIn() {
  const session = authClient.useSession();
  if (session.data?.user) return null;
  return (
    <Link
      href="/auth/sign-in"
      className="btn sh-signin"
      style={session.isPending ? { visibility: "hidden" } : undefined}
    >
      Entrar
    </Link>
  );
}
