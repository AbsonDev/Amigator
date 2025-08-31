/**
 * Script de teste para verificar as funcionalidades da API
 */

const API_URL = 'http://localhost:3001/api';
let authToken = null;
let userId = null;
let storyId = null;

// Cores para output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testAPI(endpoint, options = {}) {
  try {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };
    
    if (authToken && !options.skipAuth) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }
    
    return data;
  } catch (error) {
    throw error;
  }
}

async function runTests() {
  log('\n🧪 INICIANDO TESTES DA API\n', 'blue');
  
  // Test 1: Health Check
  try {
    log('1. Testando Health Check...', 'yellow');
    const health = await fetch('http://localhost:3001/health');
    const healthData = await health.json();
    log(`   ✅ Backend está rodando: ${healthData.status}`, 'green');
  } catch (error) {
    log(`   ❌ Erro no health check: ${error.message}`, 'red');
    return;
  }
  
  // Test 2: Signup
  try {
    log('\n2. Testando Cadastro de Usuário...', 'yellow');
    const signupData = await testAPI('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Usuário Teste',
        email: `teste${Date.now()}@example.com`,
        password: 'SenhaForte123!'
      }),
      skipAuth: true
    });
    
    authToken = signupData.data.token;
    userId = signupData.data.user.id;
    log(`   ✅ Usuário criado: ${signupData.data.user.name}`, 'green');
    log(`   ✅ Token JWT recebido`, 'green');
    log(`   ✅ Plano: ${signupData.data.user.subscription.tier}`, 'green');
  } catch (error) {
    log(`   ❌ Erro no cadastro: ${error.message}`, 'red');
  }
  
  // Test 3: Login
  try {
    log('\n3. Testando Login...', 'yellow');
    const loginData = await testAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: `teste${Date.now() - 1000}@example.com`,
        password: 'SenhaForte123!'
      }),
      skipAuth: true
    });
    
    if (loginData.data.token) {
      log(`   ✅ Login bem-sucedido`, 'green');
    }
  } catch (error) {
    log(`   ⚠️  Login falhou (esperado - email diferente): ${error.message}`, 'yellow');
  }
  
  // Test 4: Get Profile
  try {
    log('\n4. Testando Obter Perfil...', 'yellow');
    const profileData = await testAPI('/auth/profile', {
      method: 'GET'
    });
    
    log(`   ✅ Perfil obtido: ${profileData.data.name}`, 'green');
    log(`   ✅ Email: ${profileData.data.email}`, 'green');
  } catch (error) {
    log(`   ❌ Erro ao obter perfil: ${error.message}`, 'red');
  }
  
  // Test 5: Generate Story
  try {
    log('\n5. Testando Geração de História com IA...', 'yellow');
    log('   ⏳ Aguarde, gerando história com Gemini AI...', 'blue');
    
    const storyData = await testAPI('/ai/generate-story', {
      method: 'POST',
      body: JSON.stringify({
        genre: 'Ficção Científica',
        theme: 'Viagem no Tempo',
        prompt: 'Um cientista descobre uma forma de viajar no tempo mas cada viagem altera algo em sua própria vida'
      })
    });
    
    storyId = storyData.data.id;
    log(`   ✅ História gerada: "${storyData.data.title}"`, 'green');
    log(`   ✅ Sinopse: ${storyData.data.synopsis.substring(0, 100)}...`, 'green');
    log(`   ✅ Capítulos criados: ${storyData.data.chapters?.length || 0}`, 'green');
    log(`   ✅ Personagens criados: ${storyData.data.characters?.length || 0}`, 'green');
  } catch (error) {
    log(`   ❌ Erro ao gerar história: ${error.message}`, 'red');
  }
  
  // Test 6: List Stories
  try {
    log('\n6. Testando Listar Histórias...', 'yellow');
    const storiesData = await testAPI('/stories', {
      method: 'GET'
    });
    
    log(`   ✅ Histórias encontradas: ${storiesData.data.length}`, 'green');
    if (storiesData.data.length > 0) {
      log(`   ✅ Primeira história: "${storiesData.data[0].title}"`, 'green');
    }
  } catch (error) {
    log(`   ❌ Erro ao listar histórias: ${error.message}`, 'red');
  }
  
  // Test 7: Chat with AI
  try {
    log('\n7. Testando Chat com IA...', 'yellow');
    const chatData = await testAPI('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({
        prompt: 'Dê uma dica rápida para melhorar diálogos em uma história',
        model: 'gemini-flash'
      })
    });
    
    log(`   ✅ Resposta da IA recebida`, 'green');
    log(`   📝 "${chatData.data.response.substring(0, 100)}..."`, 'blue');
  } catch (error) {
    log(`   ❌ Erro no chat: ${error.message}`, 'red');
  }
  
  // Test 8: Rate Limiting
  try {
    log('\n8. Testando Rate Limiting...', 'yellow');
    log('   ⏳ Fazendo múltiplas requisições...', 'blue');
    
    const promises = [];
    for (let i = 0; i < 12; i++) {
      promises.push(testAPI('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({
          prompt: `Teste ${i}`,
          model: 'gemini-flash'
        })
      }));
    }
    
    await Promise.all(promises);
    log(`   ⚠️  Rate limiting não ativado (todas passaram)`, 'yellow');
  } catch (error) {
    if (error.message.includes('limit')) {
      log(`   ✅ Rate limiting funcionando: ${error.message}`, 'green');
    } else {
      log(`   ❌ Erro inesperado: ${error.message}`, 'red');
    }
  }
  
  // Test 9: Invalid Token
  try {
    log('\n9. Testando Segurança (Token Inválido)...', 'yellow');
    authToken = 'invalid-token-123';
    await testAPI('/auth/profile', {
      method: 'GET'
    });
    log(`   ❌ Segurança falhou - aceitou token inválido`, 'red');
  } catch (error) {
    log(`   ✅ Segurança funcionando: ${error.message}`, 'green');
  }
  
  log('\n' + '='.repeat(50), 'blue');
  log('📊 TESTES CONCLUÍDOS!', 'blue');
  log('='.repeat(50) + '\n', 'blue');
}

// Executar testes
runTests().catch(error => {
  log(`\n❌ Erro fatal: ${error.message}`, 'red');
  process.exit(1);
});