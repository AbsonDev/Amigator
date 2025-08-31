# PowerShell script para iniciar o ambiente de desenvolvimento
Write-Host "Starting Escritor IA Development Environment" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green

# Verificar se as dependencias do backend estao instaladas
if (-not (Test-Path "backend/node_modules")) {
    Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
    Set-Location backend
    npm install
    Set-Location ..
}

# Verificar se as dependencias do frontend estao instaladas
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    npm install
}

# Verificar se os arquivos .env existem
if (-not (Test-Path "backend/.env")) {
    Write-Host "Creating backend .env file..." -ForegroundColor Yellow
    if (Test-Path "backend/.env.example") {
        Copy-Item "backend/.env.example" "backend/.env"
    } else {
        "GEMINI_API_KEY=sua_chave_api_aqui" | Out-File "backend/.env" -Encoding UTF8
    }
    Write-Host "Please add your GEMINI_API_KEY to backend/.env" -ForegroundColor Cyan
}

if (-not (Test-Path ".env")) {
    Write-Host "Creating frontend .env file..." -ForegroundColor Yellow
    if (Test-Path "env.example") {
        Copy-Item "env.example" ".env"
    } else {
        "VITE_API_URL=http://localhost:3001/api`nVITE_APP_NAME=Simulador de Escritor IA`nVITE_APP_VERSION=2.0.0" | Out-File ".env" -Encoding UTF8
    }
}

Write-Host ""
Write-Host "Starting servers..." -ForegroundColor Green
Write-Host "----------------------" -ForegroundColor Green

# Iniciar backend em background
Write-Host "Starting backend on http://localhost:3001" -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev"

# Aguardar um pouco para o backend iniciar
Start-Sleep -Seconds 3

# Iniciar frontend
Write-Host "Starting frontend on http://localhost:5173" -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"

Write-Host ""
Write-Host "Development environment is running!" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Backend:  http://localhost:3001" -ForegroundColor Cyan
Write-Host "API Docs: http://localhost:3001/api-docs (if configured)" -ForegroundColor Cyan
Write-Host ""
Write-Host "Both servers are running in separate PowerShell windows" -ForegroundColor Yellow
Write-Host "Close those windows to stop the servers" -ForegroundColor Yellow
