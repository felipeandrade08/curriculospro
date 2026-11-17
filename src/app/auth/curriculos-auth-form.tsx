"use client";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";

/** Aceita apenas caminhos internos para evitar redirecionamento aberto. */
function safeCallback(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\"))
    return "/curriculos";
  return value;
}

export function CurriculosAuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const creating = mode === "sign-up",
    router = useRouter();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [callback, setCallback] = useState("/curriculos");
  useEffect(() => {
    setCallback(safeCallback(new URLSearchParams(window.location.search).get("callbackURL")));
  }, []);
  const checkoutFlow = callback.includes("checkout=1");
  const withCallback = (path: string) =>
    callback === "/curriculos" ? path : path + "?callbackURL=" + encodeURIComponent(callback);
  const [googleBusy, setGoogleBusy] = useState(false);
  async function google() {
    setGoogleBusy(true);
    setError("");
    try {
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: window.location.origin + callback,
      });
      if (result?.error) {
        setError("O login com Google não está disponível agora. Use seu e-mail e senha.");
        setGoogleBusy(false);
      }
    } catch {
      setError("O login com Google não está disponível agora. Use seu e-mail e senha.");
      setGoogleBusy(false);
    }
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const data = new FormData(event.currentTarget),
      email = String(data.get("email") || ""),
      password = String(data.get("password") || "");
    try {
      const result = creating
        ? await authClient.signUp.email({ name: String(data.get("name") || ""), email, password })
        : await authClient.signIn.email({ email, password });
      if (result.error) {
        setError(result.error.message || "Não foi possível continuar. Verifique os dados informados.");
        return;
      }
      router.push(callback);
      router.refresh();
    } catch {
      setError("Não foi possível conectar à sua conta agora. Tente novamente.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="cpAuthForm" onSubmit={submit}>
      {checkoutFlow && (
        <div className="cpAuthContext">
          <b>Falta pouco para baixar seu currículo.</b>
          <span>
            {creating ? "Crie sua conta" : "Entre na sua conta"} e você volta direto para o pagamento. O que
            você escreveu continua salvo.
          </span>
        </div>
      )}
      <div className="cpAuthTitle">
        <h2>{creating ? "Criar sua conta" : "Entrar no CurriculosPRO"}</h2>
        <p>{creating ? "Leva menos de um minuto." : "Use seu e-mail e senha para continuar."}</p>
      </div>
      <button type="button" className="cpGoogleBtn" onClick={google} disabled={googleBusy || busy}>
        <svg viewBox="0 0 48 48" width="18" height="18" aria-hidden="true">
          <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/>
          <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
          <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
          <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/>
        </svg>
        {googleBusy ? "Abrindo o Google…" : creating ? "Criar conta com Google" : "Entrar com Google"}
      </button>
      <div className="cpAuthOr">
        <span>ou com e-mail</span>
      </div>
      {creating && (
        <label>
          Nome completo
          <input name="name" autoComplete="name" required placeholder="Como devemos chamar você?" />
        </label>
      )}
      <label>
        E-mail
        <input name="email" type="email" autoComplete="email" required placeholder="voce@exemplo.com" />
      </label>
      <label>
        Senha
        <div className="cpPasswordRow">
          {!creating && <Link href="/auth/forgot-password">Esqueci minha senha</Link>}
        </div>
        <input
          name="password"
          type="password"
          minLength={8}
          autoComplete={creating ? "new-password" : "current-password"}
          required
          placeholder={creating ? "Crie uma senha segura" : "Digite sua senha"}
        />
      </label>
      {error && (
        <div className="cpAuthError" role="alert">
          {error}
        </div>
      )}
      <button type="submit" disabled={busy}>
        {busy ? "Aguarde…" : creating ? "Criar conta grátis" : "Entrar na minha conta"}
      </button>
      <p className="cpAuthSwitch">
        {creating ? "Já tem uma conta?" : "Ainda não tem uma conta?"}{" "}
        <Link href={withCallback(creating ? "/auth/sign-in" : "/auth/sign-up")}>
          {creating ? "Entrar" : "Criar conta grátis"}
        </Link>
      </p>
    </form>
  );
}
