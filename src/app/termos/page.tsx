import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import type { Metadata } from "next";
import {
  ACCESS_DAYS,
  ACCESS_PLANS,
  ACCESS_PRICE_LABEL,
  MONTH_PRICE_LABEL,
  REFERRED_BONUS_DAYS,
  REFERRER_BONUS_DAYS,
} from "@/lib/billing";
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
            O download do currículo em PDF sem marca d&apos;água requer um acesso pago, cobrado uma única vez:
            o pacote Currículo, com {ACCESS_DAYS} dias por {ACCESS_PRICE_LABEL}, ou o Kit Emprego, com {ACCESS_PLANS.mes.days} dias
            por {MONTH_PRICE_LABEL}, que também libera as ferramentas de busca de emprego. Quem tem o pacote Currículo
            ativo pode completar para o Kit Emprego pagando a diferença, e o acesso passa a somar 30 dias. Cupons
            de desconto valem conforme as condições informadas em cada um e são aplicados antes do pagamento. O período começa no momento em que o
            pagamento é confirmado e, durante ele, você pode baixar quantas vezes quiser todos os currículos
            da sua conta. Se você comprar um novo período antes do fim do atual, os dias são somados.
          </p>
          <p>
            Não há assinatura nem renovação automática. O acesso é pessoal, vinculado à sua conta e não pode
            ser transferido. O pagamento é feito por Pix ou cartão e processado pelo Mercado Pago; o CurriculosPRO não
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
          <h2>Currículo feito pela equipe</h2>
          <p>
            Cada acesso pago de {ACCESS_DAYS} dias inclui um pedido de currículo montado pela nossa equipe,
            com entrega em até 24 horas após o envio das informações. O currículo é feito com o que você
            informar; não criamos experiências, cursos ou qualificações que você não tenha. A entrega aparece
            na sua conta e pode ser editada e baixada em PDF ou Word durante o acesso. Se faltar alguma
            informação, falamos com você pelo WhatsApp informado e o prazo conta a partir da resposta.
          </p>
        </section>
        <section>
          <h2>Programa de indicação</h2>
          <p>
            Cada conta tem um link de indicação. Quando uma pessoa cria a conta por esse link e faz a primeira
            compra, quem indicou ganha {REFERRER_BONUS_DAYS} dias de acesso e a pessoa indicada ganha{" "}
            {REFERRED_BONUS_DAYS} dias extras. O bônus vale uma vez por pessoa indicada, não vale para a
            própria conta e é retirado se a compra for estornada. Contas criadas só para obter bônus podem ter
            os dias removidos. Os dias de bônus não podem ser trocados por dinheiro.
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
