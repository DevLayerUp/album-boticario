# 🗺️ Roadmap — Grupo Boticário: Album de Figurinhas

## Visão Geral

Plataforma web gamificada onde usuários criam sua figurinha personalizada, completam um álbum digital com mecânicas de pacotinhos, quiz e trocas entre jogadores.

**Stack Principal**
- Frontend: Next.js 15 (App Router)
- Backend/DB: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- Estilo: Tailwind CSS + Framer Motion (animações)
- Remoção de fundo: remove.bg via Supabase Edge Function

---

## Etapas de Desenvolvimento

### ETAPA 1 — Fundação & Infraestrutura
> Configuração do projeto, autenticação e estrutura base do banco de dados.

- [ ] Setup Next.js 15 + Tailwind + Supabase client
- [ ] Auth: email/senha + OAuth Google
- [ ] Modelagem completa do banco de dados (Supabase/PostgreSQL)
- [ ] Estrutura de pastas e rotas (App Router)
- [ ] Middleware de proteção de rotas (usuário e admin)
- [ ] Deploy inicial (Vercel)

**Entregável:** Projeto rodando com login funcional, rotas protegidas e banco modelado.

---

### ETAPA 2 — Figurinha do Usuário
> Upload de foto, remoção de fundo e geração da figurinha personalizada.

- [ ] Tela de onboarding: upload de foto
- [ ] Supabase Edge Function: integração com remove.bg
- [ ] Composição da figurinha (foto sem fundo + moldura do programa)
- [ ] Storage no Supabase (bucket `stickers`)
- [ ] Exibição da figurinha na tela de perfil
- [ ] Animação de "revelação" da figurinha

**Entregável:** Usuário consegue gerar sua figurinha personalizada.

---

### ETAPA 3 — Admin Dashboard
> Painel para gestão de conteúdo do programa.

- [ ] Layout do painel admin (rota protegida `/admin`)
- [ ] CRUD de categorias de figurinhas
- [ ] CRUD de figurinhas (upload de imagem, raridade, categoria)
- [ ] Configuração de raridades e % de tiragem por pacotinho
- [ ] CRUD de quiz (perguntas, alternativas, resposta correta, pontuação)
- [ ] CRUD de missões
- [ ] Visualização de usuários e estatísticas básicas

**Entregável:** Admin consegue cadastrar todo o conteúdo do programa.

---

### ETAPA 4 — Álbum & Coleção
> Sistema de álbum estilo flipbook com páginas organizadas por categoria.

- [ ] Modelagem de páginas do álbum por categoria
- [ ] Tela Álbum com flipbook (virar páginas animado)
- [ ] Espaços de figurinhas: vazio / preenchido / duplicado
- [ ] Tela Coleção: lista de todas as figurinhas do usuário
- [ ] Lógica de "colar" figurinha no álbum
- [ ] Animação de colar figurinha
- [ ] Indicador de progresso do álbum

**Entregável:** Álbum navegável e funcional, coleção visível.

---

### ETAPA 5 — Pacotinhos
> Sistema de abertura de pacotinhos com raridades e animações.

- [ ] Lógica de geração de pacotinho (5 figurinhas, respeitar % por raridade)
- [ ] Tela de abertura de pacotinho com animação (rasgar/abrir)
- [ ] Revelação carta a carta com efeito por raridade
- [ ] Adição das figurinhas ao inventário do usuário
- [ ] Controle de pacotinhos disponíveis por usuário
- [ ] Animação especial para figurinha rara e super rara

**Entregável:** Pacotinhos funcionais com experiência visual imersiva.

---

### ETAPA 6 — Quiz & Missões
> Sistema de quiz diário e missões para ganhar pacotinhos.

- [ ] Tela de Quiz diário (pergunta + 4 alternativas)
- [ ] Lógica de bloqueio (1 quiz por dia por usuário)
- [ ] Animação de acerto/erro
- [ ] Animação de ganhar pacotinho após acerto
- [ ] Sistema de missões (listagem, progresso, conclusão)
- [ ] Histórico de quiz/missões do usuário

**Entregável:** Quiz diário e missões funcionais gerando pacotinhos.

---

### ETAPA 7 — Sistema de Trocas
> Troca de figurinhas duplicadas entre usuários.

- [ ] Listagem de figurinhas disponíveis para troca (duplicadas)
- [ ] Criar solicitação de troca (oferecer X, pedir Y)
- [ ] Notificação de solicitação recebida
- [ ] Aceitar / recusar troca
- [ ] Transferência de figurinhas entre inventários
- [ ] Histórico de trocas

**Entregável:** Sistema de trocas completo entre usuários.

---

### ETAPA 8 — Polimento & QA
> Refinamento de UX, responsividade e testes.

- [ ] Responsividade mobile completa
- [ ] Revisão de todas as animações (Framer Motion)
- [ ] Tratamento de edge cases (foto inválida, pacotinho vazio, etc.)
- [ ] Testes de carga no Supabase
- [ ] Acessibilidade básica (ARIA, contraste)
- [ ] SEO e metadados (Open Graph)
- [ ] Revisão de segurança (RLS policies no Supabase)

**Entregável:** Produto pronto para lançamento.

---

## Estrutura de Arquivos (Next.js App Router)

```
/app
  /(auth)
    /login
    /register
  /(dashboard)
    /album
    /colecao
    /quiz
    /perfil
    /trocas
  /(admin)
    /admin
      /figurinhas
      /quiz
      /missoes
      /usuarios
  /api
    /sticker/generate   ← chama Edge Function remove.bg
/components
  /ui                   ← componentes base (botões, cards, modais)
  /album                ← flipbook, página, slot
  /sticker              ← card de figurinha, raridade badge
  /pack                 ← animação de abertura
  /quiz                 ← tela de quiz
  /trade                ← sistema de trocas
/lib
  /supabase.ts
  /utils.ts
/supabase
  /functions
    /remove-bg          ← Edge Function
  /migrations           ← SQL de criação das tabelas
```

---

## Módulos Documentados

| Arquivo | Conteúdo |
|---|---|
| `01-DATABASE.md` | Schema completo do banco, RLS policies |
| `02-AUTH.md` | Fluxo de autenticação, OAuth Google |
| `03-STICKER-GENERATION.md` | Upload, remove.bg, composição da figurinha |
| `04-ADMIN.md` | Painel admin, CRUDs, regras de negócio |
| `05-ALBUM.md` | Álbum flipbook, coleção, lógica de completar |
| `06-PACK-SYSTEM.md` | Geração de pacotinhos, raridades, algoritmo |
| `07-QUIZ-MISSIONS.md` | Quiz diário, missões, recompensas |
| `08-TRADE-SYSTEM.md` | Trocas, notificações, transferências |
| `09-ANIMATIONS.md` | Framer Motion: referências e padrões de animação |
