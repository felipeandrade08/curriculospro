# CurriculosPRO

<p align="center">
  <img src="public/brand/logo.png" alt="CurriculosPRO" width="360" />
</p>

<p align="center">
  Crie, organize e exporte currículos profissionais em PDF — gratuitamente e sem cadastro obrigatório.
</p>

<p align="center">
  <a href="https://curriculospro.vercel.app">Acessar o CurriculosPRO</a> ·
  <a href="https://github.com/felipeandrade08/curriculospro/actions">Ver builds</a>
</p>

## Sobre o projeto

O **CurriculosPRO** é uma aplicação web para criação e organização de currículos. A experiência permite começar sem conta, editar documentos, visualizar modelos e exportar o resultado em PDF. O cadastro é opcional e habilita recursos de conta e sincronização em nuvem.

## Recursos

- Editor de currículo com prévia e personalização.
- Modelos profissionais e exportação em PDF pelo navegador.
- Importação de currículo existente para continuar a edição.
- Perfil Profissional reutilizável para criar versões direcionadas.
- Adaptação de conteúdo para uma vaga, com validação para evitar informações profissionais inventadas.
- Conta opcional e sincronização em nuvem.
- Área administrativa com métricas e feedbacks.
- Páginas de privacidade, termos e apoio.
- Layout responsivo e metadados básicos para compartilhamento e mecanismos de busca.

> A disponibilidade de recursos que dependem de conta, banco de dados ou IA depende da configuração do ambiente.

## Tecnologias

- [Next.js](https://nextjs.org/) 16
- [React](https://react.dev/) 19
- [TypeScript](https://www.typescriptlang.org/)
- [Neon](https://neon.tech/) Serverless Postgres e Neon Auth
- [Sharp](https://sharp.pixelplumbing.com/) para preparação dos arquivos de marca
- [Vercel](https://vercel.com/) como destino de deploy

## Executar localmente

### Pré-requisitos

- Node.js 22 ou superior
- npm
- Uma base PostgreSQL Neon para habilitar persistência, autenticação e recursos administrativos

### Instalação

```bash
git clone https://github.com/felipeandrade08/curriculospro.git
cd curriculospro
npm install
```

Crie seu arquivo de ambiente local:

```bash
cp .env.example .env.local
```

Preencha as variáveis necessárias para os recursos que deseja executar. Para iniciar o ambiente de desenvolvimento:

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

### Build de produção

```bash
npm run build
npm run start
```

O script `prebuild` prepara automaticamente os arquivos derivados da identidade visual antes do build.

## Variáveis de ambiente

Configure as variáveis no arquivo `.env.local` para desenvolvimento e no painel do provedor de hospedagem para produção.

| Variável | Finalidade |
| --- | --- |
| `DATABASE_URL` | String de conexão do banco Neon. Necessária para persistência, migrações e recursos que usam o banco. |
| `NEON_AUTH_BASE_URL` | URL base do Neon Auth configurado para a aplicação. |
| `NEON_AUTH_COOKIE_SECRET` | Segredo forte usado para assinar os cookies de autenticação. Obrigatório em produção na Vercel. |
| `ADMIN_EMAIL` | E-mail autorizado a acessar `/admin`. |
| `OPENAI_API_KEY` | Chave da API OpenAI para habilitar a adaptação assistida por IA. |
| `ENABLE_PAID_AI` | Defina como `true` para habilitar a rota de IA; por padrão, o recurso fica desativado. |
| `OPENAI_TAILOR_MODEL` | Modelo da OpenAI usado na adaptação de currículo. Se omitido, a aplicação utiliza o padrão definido no código. |

Nunca publique valores reais dessas variáveis. Use apenas placeholders em exemplos e mantenha os arquivos locais de ambiente fora do Git.

## Banco de dados e migrações

As migrações SQL versionadas ficam em `database/migrations`. Com `DATABASE_URL` configurada, execute:

```bash
npm run db:migrate
```

O script registra as migrações aplicadas na tabela `schema_migrations` e ignora arquivos já executados. Faça backup do banco antes de alterações em produção.

## Deploy

O projeto está preparado para deploy na Vercel:

1. Importe o repositório `felipeandrade08/curriculospro`.
2. Configure as variáveis de ambiente necessárias no projeto da Vercel.
3. Aponte o Neon Auth para a URL pública e os caminhos de autenticação da aplicação, conforme a configuração do provedor.
4. Execute as migrações do banco com segurança antes de liberar funcionalidades que dependem das tabelas.
5. Faça o deploy e valide criação de currículo, exportação PDF, login e sincronização.

URL pública configurada nos metadados do projeto: https://curriculospro.vercel.app

## Integração contínua

O GitHub Actions executa o workflow **Build CurriculosPRO** em pushes para `main`, pull requests direcionados a `main` e execuções manuais. O workflow utiliza Node.js 22, instala as dependências e executa `npm run build`.

Acompanhe o resultado em [GitHub Actions](https://github.com/felipeandrade08/curriculospro/actions).

## Estrutura do repositório

```text
.
├── .github/workflows/   # Build automatizado
├── database/migrations/ # Migrações SQL
├── public/brand/        # Identidade visual
├── scripts/             # Preparação da marca e migrações
└── src/
    ├── app/              # Rotas, páginas e API
    ├── components/       # Componentes compartilhados
    └── lib/              # Regras, autenticação e acesso a dados
```

## Segurança e privacidade

- Não envie arquivos `.env.local` ou segredos para o repositório.
- Configure `NEON_AUTH_COOKIE_SECRET` com um valor aleatório forte em produção.
- Restrinja `ADMIN_EMAIL` ao endereço da pessoa administradora.
- Mantenha `ENABLE_PAID_AI` desativado até configurar e validar a integração e os limites de uso.
- Revise as políticas de privacidade e os termos antes de alterar os fluxos que tratam dados pessoais.

## Licença

Nenhuma licença de uso foi declarada neste repositório. Todos os direitos permanecem reservados ao titular até que uma licença seja adicionada.
