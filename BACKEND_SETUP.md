# Configuração do Backend

## Variáveis de Ambiente

Crie um arquivo `.env` no diretório `backend/` com as seguintes variáveis:

```bash
# Backend Environment Variables
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:5173

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=10

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Google AI Configuration
GEMINI_API_KEY=your-gemini-api-key-here

# Database (if using)
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
```

## Como obter a GEMINI_API_KEY

1. Acesse [Google AI Studio](https://aistudio.google.com/)
2. Faça login com sua conta Google
3. Clique em "Get API key"
4. Copie a chave e cole no arquivo `.env`

## Iniciar o Backend

```bash
cd backend
npm install
npm run dev
```

O backend estará disponível em `http://localhost:3001`
