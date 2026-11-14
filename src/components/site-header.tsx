import Image from "next/image";
import Link from "next/link";

type Active = "modelos" | "exemplos" | "curriculos" | "precos";

const links: { href: string; label: string; key: Active }[] = [
  { href: "/modelos", label: "Modelos", key: "modelos" },
  { href: "/exemplos", label: "Exemplos por profissão", key: "exemplos" },
  { href: "/precos", label: "Preços", key: "precos" },
  { href: "/curriculos", label: "Meus currículos", key: "curriculos" },
];

export function SiteHeader({ active }: { active?: Active }) {
  return (
    <header className="sh">
      <div className="sh-inner wrap">
        <Link className="sh-logo" href="/" aria-label="CurriculosPRO — página inicial">
          <Image src="/brand/logo-transparent.png" alt="CurriculosPRO" width={168} height={64} priority />
        </Link>
        <nav className="sh-nav" aria-label="Navegação principal">
          {links.map((link) => (
            <Link
              key={link.key}
              href={link.href}
              className={active === link.key ? "is-active" : undefined}
              aria-current={active === link.key ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <Link href="/comecar" className="btn btn-primary sh-cta">
          Criar currículo
        </Link>
        <details className="sh-menu">
          <summary aria-label="Abrir menu">
            <span />
            <span />
            <span />
          </summary>
          <nav aria-label="Menu">
            {links.map((link) => (
              <Link key={link.key} href={link.href} aria-current={active === link.key ? "page" : undefined}>
                {link.label}
              </Link>
            ))}
            <Link href="/auth/sign-in">Entrar na conta</Link>
            <Link href="/comecar" className="btn btn-primary">
              Criar currículo
            </Link>
          </nav>
        </details>
      </div>
    </header>
  );
}
