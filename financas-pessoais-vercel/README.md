# Finanças Pessoais - Next.js + Prisma + PostgreSQL

Aplicativo web para controle de finanças pessoais com login por e-mail e senha, dashboard, assinaturas, valores a pagar e valores a receber.

## Funcionalidades

- Cadastro e login de usuários.
- Senhas salvas com hash usando `bcryptjs`.
- Sessão por token JWT em cookie HTTP-only.
- Rotas privadas protegidas.
- Dados separados por usuário usando `userId`.
- CRUD de assinaturas.
- CRUD de dívidas e valores a receber.
- Dashboard com cálculos automáticos.
- Interface responsiva para computador e celular.
- Projeto preparado para Vercel + PostgreSQL, como Neon ou Supabase.

## Tecnologias

- Next.js
- React
- TypeScript
- Prisma ORM
- PostgreSQL
- bcryptjs
- jose/JWT

## Como rodar localmente

1. Instale as dependências:

```bash
npm install
```

2. Crie o arquivo `.env` copiando o exemplo:

```bash
cp .env.example .env
```

No Windows, pode copiar manualmente o arquivo `.env.example` e renomear para `.env`.

3. Configure a variável `DATABASE_URL` com a conexão do seu banco PostgreSQL.

Exemplo:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"
JWT_SECRET="uma-chave-grande-e-segura"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

4. Crie as tabelas no banco:

```bash
npm run db:push
```

Ou, se quiser usar migrations:

```bash
npm run db:migrate
```

5. Rode o projeto:

```bash
npm run dev
```

6. Acesse:

```text
http://localhost:3000
```

## Como publicar na Vercel

1. Suba o projeto para o GitHub.
2. Importe o repositório na Vercel.
3. Configure as variáveis de ambiente na Vercel:

```env
DATABASE_URL="sua-url-do-postgres"
JWT_SECRET="sua-chave-secreta"
NEXT_PUBLIC_APP_URL="https://seu-projeto.vercel.app"
```

4. Faça o deploy.

O script de build já executa `prisma generate` antes do `next build`.

## Estrutura principal

```text
src/app/login               Tela de login
src/app/register            Tela de cadastro
src/app/dashboard           Dashboard financeiro
src/app/assinaturas         Controle de assinaturas
src/app/dividas             Controle de valores a pagar/receber
src/app/api                 Rotas de API
src/lib                     Prisma, sessão, validações e utilitários
prisma/schema.prisma        Modelagem do banco
```

## Observação importante

Todas as consultas de assinaturas e registros financeiros filtram pelo usuário logado. Isso impede que uma pessoa visualize, edite ou exclua dados de outra conta.
