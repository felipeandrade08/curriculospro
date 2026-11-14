import Image from "next/image";
import Link from "next/link";
import { ACCESS_DAYS, ACCESS_PRICE_LABEL } from "@/lib/billing";
import { SUPPORT_WHATSAPP_URL } from "@/lib/site";

const linkedinUrl = "https://www.linkedin.com/in/felipe-andrade-0331b9205/";

export function SiteFooter() {
  return (
    <footer className="sf">
      <div className="wrap sf-grid">
        <div className="sf-brand">
          <Link className="sf-logo" href="/" aria-label="CurriculosPRO — página inicial">
            <Image src="/brand/logo-transparent.png" alt="CurriculosPRO" width={150} height={57} />
          </Link>
          <p>
            Currículos bem escritos e bem diagramados, prontos para enviar. Crie e edite grátis; baixe o PDF
            por {ACCESS_PRICE_LABEL} com {ACCESS_DAYS} dias de acesso.
          </p>
        </div>
        <nav aria-label="Produto">
          <h2>Produto</h2>
          <Link href="/modelos">Modelos de currículo</Link>
          <Link href="/exemplos">Exemplos por profissão</Link>
          <Link href="/precos">Preços</Link>
          <Link href="/importar">Importar currículo</Link>
        </nav>
        <nav aria-label="Sua conta">
          <h2>Sua conta</h2>
          <Link href="/curriculos">Meus currículos</Link>
          <Link href="/perfil-profissional">Perfil profissional</Link>
          <Link href="/auth/sign-in">Entrar</Link>
          <Link href="/auth/sign-up">Criar conta</Link>
        </nav>
        <nav aria-label="Ajuda">
          <h2>Ajuda</h2>
          <a href={SUPPORT_WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
            Falar no WhatsApp
          </a>
          <Link href="/feedback">Enviar sugestão</Link>
          <Link href="/termos">Termos de uso</Link>
          <Link href="/privacidade">Privacidade</Link>
        </nav>
      </div>
      <div className="wrap sf-bottom">
        <span>© {new Date().getFullYear()} CurriculosPRO</span>
        <span>
          Desenvolvido por{" "}
          <a href={linkedinUrl} target="_blank" rel="noopener noreferrer">
            Felipe Andrade
          </a>
        </span>
      </div>
    </footer>
  );
}
