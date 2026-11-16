import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import type { Metadata } from "next";
import { COMPANY } from "@/lib/site";

export const metadata: Metadata = {
  title: "Política de privacidade",
  alternates: { canonical: "/privacidade" },
};
export default function Privacy() {
  return (
    <main>
      <SiteHeader />
      <article className="legalPage shell">
        <span>PRIVACIDADE</span>
        <h1>Seus dados, com transparência.</h1>
        <p className="legalLead">
          O CurriculosPRO foi criado para permitir que você monte seu currículo sem entregar mais dados do que
          o necessário.
        </p>
        <section>
          <h2>Responsável pelos dados</h2>
          <p>
            {COMPANY.legalName}, CNPJ {COMPANY.cnpj}. Para dúvidas ou pedidos sobre seus dados, fale pelo
            telefone e WhatsApp {COMPANY.phone}.
          </p>
        </section>
        <section>
          <h2>O que fica no seu dispositivo</h2>
          <p>
            Você pode usar os recursos principais sem criar conta. Currículos, preferências e o Perfil
            Profissional podem ser armazenados localmente no navegador deste dispositivo.
          </p>
        </section>
        <section>
          <h2>Quando você usa uma conta</h2>
          <p>
            Ao entrar e escolher sincronizar, dados necessários da conta e conteúdos sincronizados podem ser
            armazenados na infraestrutura do CurriculosPRO para permitir acesso em outros dispositivos. A
            sincronização é uma camada adicional; o produto informa quando os dados estão apenas neste
            dispositivo ou também na nuvem.
          </p>
        </section>
        <section>
          <h2>Pagamentos</h2>
          <p>
            Para liberar o download, o pagamento por Pix é processado pelo Mercado Pago. Compartilhamos com o
            Mercado Pago o e-mail da sua conta e o valor da compra. Guardamos o identificador do pagamento, o
            status, o valor e as datas, vinculados à sua conta, para liberar o acesso, prestar suporte e
            cumprir obrigações legais. Não recebemos nem armazenamos dados bancários.
          </p>
        </section>
        <section>
          <h2>Feedbacks enviados</h2>
          <p>
            Se você enviar uma avaliação, armazenamos a nota, a categoria, o texto e a data de envio para
            analisar sugestões e corrigir problemas. Se você estiver conectado, a avaliação fica vinculada à
            sua conta. O nome e a profissão são opcionais e só são pedidos quando você autoriza a publicação.
            Depoimentos autorizados podem aparecer no site, com o nome que você escolheu, depois de revisados;
            para retirar um depoimento publicado, fale conosco pelo WhatsApp. Evite inserir dados pessoais no
            texto enviado.
          </p>
        </section>
        <section>
          <h2>Métricas de uso</h2>
          <p>
            Registramos contagens agregadas de eventos, como acesso ao site, abertura do editor e solicitação
            de preparação de PDF, para entender quais partes do serviço são utilizadas. Não enviamos o
            conteúdo do currículo, nome, e-mail ou identificador individual do currículo para essas métricas.
            O sistema pode usar temporariamente informações técnicas da requisição para reduzir spam; elas não
            são gravadas na tabela de métricas.
          </p>
        </section>
        <section>
          <h2>Currículos e informações profissionais</h2>
          <p>
            Você decide quais informações inserir, importar para um currículo e destacar para uma vaga. O
            CurriculosPRO não deve criar experiências, competências ou qualificações que você não informou.
          </p>
        </section>
        <section>
          <h2>Serviços externos</h2>
          <p>
            O site utiliza provedores necessários para operar a aplicação: hospedagem, banco de dados,
            autenticação e o Mercado Pago para pagamentos. A geração de texto por inteligência artificial está
            desativada no produto atual.
          </p>
        </section>
        <section>
          <h2>Seu controle</h2>
          <p>
            Você pode editar ou excluir currículos locais pela Biblioteca. Ao usar recursos de conta e nuvem,
            as ações disponíveis no produto indicam o estado de sincronização. Evite inserir dados sensíveis
            que não sejam necessários para uma candidatura profissional.
          </p>
        </section>
        <p className="legalUpdated">Última atualização: novembro de 2026.</p>
      </article>
      <SiteFooter />
    </main>
  );
}
