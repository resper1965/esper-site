# Configuração do Supabase

## 1. Executar Schema no Supabase

Acesse o painel do Supabase:
https://obhgzaxtsgjubzjermym.supabase.co

### SQL Editor:

1. Clique em **SQL Editor** no menu lateral
2. Clique em **New query**
3. Copie e cole o conteúdo de `schema.sql`
4. Clique em **Run** para executar

Isso criará:
- ✅ Tabela `posts` com todos os campos
- ✅ Índices para performance
- ✅ Trigger para `updated_at` automático
- ✅ Políticas de segurança (RLS)

## 2. Criar Usuário Admin

Para acessar o painel `/admin`, você precisa criar um usuário:

### Opção A: Via Dashboard (Recomendado)

1. Vá em **Authentication** → **Users**
2. Clique em **Add user** → **Create new user**
3. Preencha:
   - Email: seu-email@exemplo.com
   - Password: senha-segura (mínimo 6 caracteres)
   - Auto Confirm User: ✅ (marque)
4. Clique em **Create user**

### Opção B: Via SQL (Avançado)

```sql
-- Criar usuário admin
-- IMPORTANTE: Troque o email e senha
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'seu-email@exemplo.com',
  crypt('sua-senha-segura', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  FALSE,
  '',
  ''
);
```

## 3. Testar Autenticação

1. Acesse: http://localhost:3000/admin/login
2. Faça login com as credenciais criadas
3. Você será redirecionado para `/admin`

## 4. Migração de Dados (Opcional)

Se você tem posts no SQLite, pode migrá-los:

```bash
npm run db:migrate-to-supabase
```

Ou manualmente:
1. Exporte posts do SQLite
2. Importe no Supabase via SQL Editor ou CSV

## 5. Variáveis de Ambiente

Certifique-se de ter no `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://obhgzaxtsgjubzjermym.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_E9he-QrRi1o12sxfRPa2Tg_sHl5r2J7
```

## 6. Políticas de Segurança (RLS)

As políticas configuradas garantem:
- ✅ Posts publicados são públicos (qualquer um pode ler)
- ✅ Apenas usuários autenticados veem drafts
- ✅ Apenas usuários autenticados podem criar/editar/deletar

Se quiser ajustar, vá em **Database** → **posts** → **Policies**

## 7. Verificar Instalação

Teste se tudo está funcionando:

```bash
npm run dev
```

- Acesse: http://localhost:3000
- Verifique se posts aparecem (se houver algum publicado)
- Acesse: http://localhost:3000/admin/login
- Faça login e teste o painel

## Troubleshooting

### Erro "Missing Supabase environment variables"
- Verifique se `.env.local` existe e tem as credenciais corretas

### Erro "relation posts does not exist"
- Execute o schema.sql no SQL Editor do Supabase

### Não consigo fazer login
- Verifique se criou o usuário em Authentication → Users
- Certifique-se de marcar "Auto Confirm User"

### Posts não aparecem
- Verifique se há posts com `published = TRUE`
- Teste: `SELECT * FROM posts WHERE published = TRUE;` no SQL Editor
