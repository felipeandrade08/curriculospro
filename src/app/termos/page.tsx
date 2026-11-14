import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import type { Metadata } from "next";
import { ACCESS_DAYS, ACCESS_PRICE_LABEL } from "@/lib/billing";
import { COMPANY, SUPPORT_WHATSAPP_URL } from "@/lib/site";

export const metadata: Metadata = { title: "Termos de uso", alternates: { canonical: "/termos" } };
export default function Terms() {
  return (
    <main>
      <SiteHeader />
      <article className="legalPage shell">
        <span>TERMOS DE USO</span>
        <h1>Regras simples para usar o CurriculosPRO.</h1>
        <p className="legalLead">
          Ao utilizar o CurriculosPRO, você concorda em usar a ferramenta para criar e organizar currículos
          com informações sob sua responsabilidade.
        </p>
        <section>
          <h2>Quem oferece o serviço</h2>
          <p>
            O CurriculosPRO é oferecido por {COMPANY.legalName}, inscrita no CNPJ {COMPANY.cnpj}. Atendimento
            pelo telefone e WhatsApp {COMPANY.phone}.
          </p>
        </section>
        <section>
          <h2>Conteúdo do currículo</h2>
          <p>
            Você é responsável pela veracidade das informações inseridas. As orientações do produto ajudam na
            organização e apresentação, mas não substituem sua revisão antes de enviar o currículo.
          </p>
        </section>
        <section>
          <h2>Uso gratuito</h2>
          <p>
            Criar, editar, visualizar e organizar currículos é gratuito. A prévia exibida no editor contém
            marca d&apos;água e serve apenas para conferência.
          </p>
        </section>
        <section>
          <h2>Acesso pago para download</h2>
          <p>
            O download do currículo em PDF sem marca d&apos;água requer um acesso pago de {ACCESS_DAYS} dias,
            no valor de {ACCESS_PRICE_LABEL}, cobrado uma única vez. O período começa no momento em que o
            pagamento é confirmado e, durante ele, você pode baixar quantas vezes quiser todos os currículos
            da sua conta. Se você comprar um novo período antes do fim do atual, os dias são somados.
          </p>
          <p>
            Não há assinatura nem renovação automática. O acesso é pessoal, vinculado à sua conta e não pode
            ser transferido. O pagamento é feito por Pix e processado pelo Mercado Pago; o CurriculosPRO não
            recebe dados bancários.
          </p>
        </section>
        <section>
          <h2>Arrependimento e reembolso</h2>
          <p>
            Você pode desistir da compra em até 7 dias após o pagamento, conforme o artigo 49 do Código de
            Defesa do Consumidor, e receber o valor de volta. Também reembolsamos quando um problema técnico
            do serviço impedir o download. Para pedir, fale conosco pelo{" "}
            <a href={SUPPORT_WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>{" "}
            informando o e-mail da conta. O estorno é feito pelo Mercado Pago e o acesso correspondente é
            encerrado.
          </p>
        </section>
        <section>
          <h2>Mudanças no serviço</h2>
          <p>
            O serviço pode receber melhorias, correções e mudanças de funcionalidades. Alterações de preço não
            afetam acessos já pagos.
          </p>
        </section>
        <section>
          <h2>Arquivos e cópias</h2>
          <p>
            Quando estiver usando somente armazenamento local, mantenha uma cópia de segurança se o currículo
            for importante. Limpar dados do navegador ou trocar de dispositivo pode remover informações que
            não tenham sido sincronizadas.
          </p>
        </section>
        <section>
          <h2>PDF e candidaturas</h2>
          <p>
            Antes de enviar ou imprimir, confira o PDF final, datas, contatos, ortografia e conteúdo. O
            CurriculosPRO auxilia na criação do documento, mas não garante contratação, seleção ou resultado
            em processos seletivos.
          </p>
        </section>
        <p className="legalUpdated">Última atualização: novembro de 2026.</p>
      </article>
      <SiteFooter />
    </main>
  );
}
