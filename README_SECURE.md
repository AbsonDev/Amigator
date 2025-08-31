# 🔐 Simulador de Escritor IA - Versão Segura

## 🎉 Melhorias de Segurança Implementadas

Este projeto foi completamente refatorado para incluir um backend seguro que protege suas chaves de API e dados dos usuários.

## 🚀 Início Rápido

### Pré-requisitos
- Node.js 18+ instalado
- NPM ou Yarn
- Chave de API do Google Gemini

### Instalação

1. **Clone o repositório**
```bash
git clone <seu-repositorio>
cd simulador-escritor-ia
```

2. **Configure as variáveis de ambiente**

Backend (.env):
```bash
cd backend
cp .env.example .env
# Edite .env e adicione sua GEMINI_API_KEY
```

Frontend (.env):
```bash
cd ..
cp .env.example .env
# As configurações padrão já estão prontas
```

3. **Instale as dependências**
```bash
# Backend
cd backend
npm install

# Frontend
cd ..
npm install
```

4. **Inicie o desenvolvimento**

Opção 1 - Script automatizado:
```bash
./start-dev.sh
```

Opção 2 - Manual:
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
npm run dev
```

## 🔐 Recursos de Segurança

### ✅ Implementados

1. **Autenticação JWT**
   - Tokens seguros com expiração
   - Refresh tokens
   - Middleware de autenticação

2. **Proteção de Senhas**
   - Hashing com bcrypt (10 rounds)
   - Validação de força de senha
   - Nunca armazenadas em texto plano

3. **API Key Protegida**
   - Gemini API key apenas no backend
   - Proxy seguro para todas as chamadas
   - Sem exposição no frontend

4. **Rate Limiting**
   - APIs gerais: 100 req/15min
   - APIs de IA: 10 req/min
   - Login: 5 tentativas/15min

5. **Validação de Dados**
   - Sanitização de HTML
   - Validação de tipos
   - Tamanhos máximos de campos

6. **Segurança HTTP**
   - Helmet para headers seguros
   - CORS configurado
   - HTTPS ready

## 📊 Limites por Plano

| Recurso | Free | Hobby | Amador | Profissional |
|---------|------|-------|--------|--------------|
| Histórias/mês | 1 | 3 | 10 | Ilimitado |
| Capítulos/mês | 0 | 5 | 30 | Ilimitado |
| Personagens/mês | 3 | 10 | 50 | Ilimitado |
| Capas/mês | 0 | 0 | 5 | Ilimitado |
| Chat IA/mês | 10 | 50 | 200 | Ilimitado |
| Export PDF/DOCX | ❌ | ❌ | ✅ | ✅ |

## 🔌 API Endpoints

### Autenticação
- `POST /api/auth/signup` - Criar conta
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Perfil do usuário
- `PUT /api/auth/profile` - Atualizar perfil
- `POST /api/auth/change-password` - Trocar senha

### Histórias
- `GET /api/stories` - Listar histórias
- `POST /api/stories` - Criar história
- `GET /api/stories/:id` - Obter história
- `PUT /api/stories/:id` - Atualizar história
- `DELETE /api/stories/:id` - Deletar história

### IA (Requer autenticação)
- `POST /api/ai/generate-story` - Gerar história
- `POST /api/ai/generate-chapter` - Gerar capítulo
- `POST /api/ai/generate-character` - Gerar personagem
- `POST /api/ai/analyze-story` - Analisar história
- `POST /api/ai/chat` - Chat com IA

## 🏗️ Estrutura do Projeto

```
/
├── backend/              # Backend Node.js
│   ├── src/
│   │   ├── controllers/  # Lógica dos endpoints
│   │   ├── services/     # Lógica de negócio
│   │   ├── routes/       # Definição de rotas
│   │   ├── middleware/   # Auth, validação, etc
│   │   └── utils/        # Utilitários
│   └── package.json
│
├── components/          # Componentes React
├── context/            # Contextos React
├── services/           # Serviços do frontend
│   ├── api.service.ts  # Cliente API centralizado
│   └── geminiService.ts # (Deprecated - usar api.service)
├── App.tsx             # Componente principal
└── package.json
```

## 🔧 Desenvolvimento

### Backend

```bash
cd backend
npm run dev     # Desenvolvimento com hot reload
npm run build   # Build para produção
npm start       # Executar produção
```

### Frontend

```bash
npm run dev     # Desenvolvimento
npm run build   # Build para produção
npm run preview # Preview da build
```

## 🚢 Deploy

### Backend (Heroku/Railway/Render)

1. Configure as variáveis de ambiente:
   - `JWT_SECRET` (gere uma chave segura)
   - `GEMINI_API_KEY`
   - `NODE_ENV=production`

2. Deploy:
```bash
cd backend
npm run build
npm start
```

### Frontend (Vercel/Netlify)

1. Configure a variável:
   - `VITE_API_URL=https://seu-backend.com/api`

2. Build:
```bash
npm run build
# Deploy da pasta 'dist'
```

## 🧪 Testes (A Implementar)

```bash
# Backend
cd backend
npm test

# Frontend
npm test
```

## 📝 Próximas Melhorias

- [ ] Banco de dados real (PostgreSQL/MongoDB)
- [ ] Testes automatizados
- [ ] Documentação da API (Swagger)
- [ ] WebSockets para colaboração
- [ ] Cache Redis
- [ ] Upload de imagens
- [ ] Export para ePub
- [ ] PWA offline

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

## 🆘 Suporte

Para problemas ou dúvidas:
1. Abra uma issue no GitHub
2. Verifique a documentação
3. Confira os logs do servidor

## 🎯 Status do Projeto

✅ **Segurança Crítica**: Implementada
🔄 **Performance**: Em andamento
📝 **Testes**: Planejado
🚀 **Production Ready**: 70%

---

**Desenvolvido com ❤️ e segurança em mente**