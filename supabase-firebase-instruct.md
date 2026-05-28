# Guia de Configuração: Vercel + Firebase + Supabase (Pronto para Produção)

Este projeto foi projetado de forma **híbrida e resiliente** para rodar perfeitamente na sandbox de testes e ser facilmente exportado para o **Supabase** e **Firebase** quando você estiver pronto para publicar em produção.

---

## 1. Banco de Dados - Supabase (PostgreSQL)

Para conectar o back-end em produção ao seu Supabase, você pode migrar as chamadas para o client do Supabase. Aqui está a estrutura de tabelas SQL necessária para rodar no seu painel do Supabase SQL Editor:

### Script de Tabelas (SQL)

```sql
-- Tabela de Animes
create table if not exists animes (
  id text primary key,
  title text not null,
  image text not null,
  description text not null,
  season text not null,
  votes integer default 0,
  trailer_url text,
  episodes_count integer,
  rating numeric(3,1),
  genres text[] -- array de generos
);

-- Tabela de Comentários
create table if not exists comments (
  id text primary key,
  anime_id text references animes(id) on delete cascade,
  user_name text not null,
  comment text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  likes integer default 0,
  is_vip boolean default false
);

-- Tabela de Alertas de Notícias
create table if not exists news (
  id text primary key,
  title text not null,
  content text not null,
  category text check (category in ('Filme', 'Curiosidade', 'Mangá', 'Novidade')),
  created_at timestamp with time zone default timezone('utc'::text, now()),
  image_url text,
  author text
);
```

### Script de Inicialização de Sementes (Seed)

```sql
insert into animes (id, title, image, description, season, votes, trailer_url, episodes_count, rating, genres) values
('1', 'Solo Leveling', 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800', 'Em um mundo onde caçadores humanos devem combater monstros...', 'Temporada de Inverno', 215, 'https://www.youtube.com/embed/g8fP-Wf_qC4', 12, 9.1, array['Ação', 'Fantasia', 'Superpoderes']),
('2', 'Frieren: Beyond Journeys End', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800', 'Uma maga elfa e seus ex-companheiros de aventura derrotaram o Rei Demônio...', 'Temporada de Outono', 310, 'https://www.youtube.com/embed/qgQunxD0qZ4', 28, 9.5, array['Aventura', 'Drama', 'Fantasia']);
```

---

## 2. Autenticação - Firebase Auth (Google Login)

O projeto já está estruturado com componentes de perfil para simulação avançada de login (Padrão, VIP e Admin) para facilitar os testes rápidos. Para substituir com o Firebase real utilizando o Google Login:

1. Acesse o **Console do Firebase** e crie ou selecione um projeto.
2. Ative o **Authentication** e habilite o provedor **Google**.
3. Crie um arquivo `src/lib/firebase.ts` (ou adicione as variáveis no seu `.env` de produção):

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = () => signInWithPopup(auth, googleProvider);
```

---

## 3. Variáveis de Ambiente (.env) para Vercel Deploys

Ao realizar o deploy na **Vercel**, configure as seguintes chaves de produção nas configurações de variáveis de ambiente (*Environment Variables*) do seu painel do projeto:

```env
# Conexão Supabase Client (No Next.js ou React App compilado)
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=seu-token-anonimo-aqui

# Credenciais Firebase
VITE_FIREBASE_API_KEY=sua-api-key-firebase
VITE_FIREBASE_AUTH_DOMAIN=seu-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto-id
VITE_FIREBASE_STORAGE_BUCKET=seu-bucket.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=seu-sender-id
VITE_FIREBASE_APP_ID=seu-app-id
```

---

## 🔥 Benefícios do Setup Híbrido Atual

- **Rapidez no Iframe**: O servidor roda localmente em segundos usando um estado leve de JSON persistent, eliminando lentidões no carregamento de APIs externas durante o desenvolvimento.
- **Segurança de Chaves**: A API key do Gemini e demais segredos de rotas permanecem **escondidas** no back-end, impossibilitando que leitores do seu site visualizem ou roubem suas cotas de requisição no navegador.
- **Porto 3000 Ingress**: Prontidão completa com o pipeline de Cloud Run de contêineres e compatibilidade de testes de lint.
