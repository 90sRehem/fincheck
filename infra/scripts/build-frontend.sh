#!/bin/bash

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Funções de logging
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

success() {
    echo -e "${GREEN}[SUCCESS] $1${NC}"
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
}

# Verificar pré-requisitos
check_prerequisites() {
    log "Verificando pré-requisitos..."
    
    # Verificar se Bun está instalado
    if ! command -v bun &> /dev/null; then
        error "Bun não encontrado. Instale em: https://bun.sh"
        exit 1
    fi
    
    # Verificar se o diretório do frontend existe
    if [ ! -d "apps/web" ]; then
        error "Diretório apps/web não encontrado"
        exit 1
    fi
    
    success "Pré-requisitos verificados"
}

# Instalar dependências
install_dependencies() {
    log "Instalando dependências do frontend..."
    
    cd apps/web
    
    # Limpar node_modules se necessário
    if [ -d "node_modules" ] && [ "$1" = "--clean" ]; then
        log "Limpando node_modules..."
        rm -rf node_modules
    fi
    
    # Instalar dependências
    bun install
    
    success "Dependências instaladas"
    cd ../..
}

# Verificar tipos TypeScript
type_check() {
    log "Verificando tipos TypeScript..."
    
    cd apps/web
    
    # Executar verificação de tipos
    if bun run type-check >/dev/null 2>&1; then
        success "Verificação de tipos passou"
    else
        warning "Problemas de tipos encontrados, mas continuando o build..."
        bun run type-check || true
    fi
    
    cd ../..
}

# Executar testes
run_tests() {
    log "Executando testes do frontend..."
    
    cd apps/web
    
    # Verificar se existem testes
    if [ -d "src/__tests__" ] || [ -f "vitest.config.ts" ]; then
        if bun test >/dev/null 2>&1; then
            success "Testes passaram"
        else
            warning "Alguns testes falharam, mas continuando..."
            bun test || true
        fi
    else
        warning "Nenhum teste encontrado, pulando..."
    fi
    
    cd ../..
}

# Build do projeto
build_project() {
    log "Fazendo build do frontend..."
    
    cd apps/web
    
    # Configurar variáveis de ambiente para build
    export NODE_ENV=production
    export VITE_API_URL=http://localhost.localstack.cloud
    export VITE_APP_ENV=local
    
    # Executar build
    bun run build
    
    # Verificar se o build foi criado
    if [ ! -d "dist" ]; then
        error "Build falhou - diretório dist não encontrado"
        exit 1
    fi
    
    # Verificar tamanho do build
    local build_size=$(du -sh dist | cut -f1)
    success "Build concluído (tamanho: $build_size)"
    
    cd ../..
}

# Otimizar assets
optimize_assets() {
    log "Otimizando assets..."
    
    cd apps/web/dist
    
    # Comprimir arquivos CSS e JS (se gzip estiver disponível)
    if command -v gzip &> /dev/null; then
        find . -name "*.css" -exec gzip -k {} \;
        find . -name "*.js" -exec gzip -k {} \;
        success "Assets comprimidos"
    else
        warning "gzip não disponível, pulando compressão"
    fi
    
    cd ../../..
}

# Gerar relatório do build
generate_report() {
    log "Gerando relatório do build..."
    
    cd apps/web
    
    echo ""
    echo "=== RELATÓRIO DO BUILD ===" 
    echo ""
    echo "Diretório: $(pwd)"
    echo "Build size: $(du -sh dist | cut -f1)"
    echo "Arquivos principais:"
    
    if [ -d "dist/assets" ]; then
        ls -lh dist/assets/ | grep -E '\.(js|css)$' | awk '{print "  " $9 " (" $5 ")"}'
    fi
    
    echo ""
    echo "Build concluído em: $(date)"
    
    cd ../..
}

# Preparar para deploy
prepare_deploy() {
    log "Preparando para deploy..."
    
    # Criar diretório de deploy se não existir
    mkdir -p deploy/frontend
    
    # Copiar arquivos do build
    cp -r apps/web/dist/* deploy/frontend/
    
    # Criar arquivo de configuração para servidor web
    cat > deploy/frontend/.htaccess << EOF
# Configuração para SPA
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QR,L]

# Compressão
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE text/html
</IfModule>

# Cache Headers
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
</IfModule>
EOF
    
    success "Arquivos preparados para deploy em deploy/frontend/"
}

# Função principal
main() {
    log "🌐 Iniciando build do frontend"
    
    # Verificar se é build limpo
    local clean_flag=""
    if [ "$1" = "--clean" ]; then
        clean_flag="--clean"
    fi
    
    check_prerequisites
    install_dependencies $clean_flag
    type_check
    run_tests
    build_project
    optimize_assets
    generate_report
    prepare_deploy
    
    echo ""
    success "🎉 Build do frontend concluído!"
    echo ""
    echo "Próximos passos:"
    echo "1. Deploy: ./infra/scripts/deploy.sh"
    echo "2. Arquivos em: deploy/frontend/"
    echo "3. Para servir localmente: bun run preview (em apps/web)"
}

# Tratamento de erro
trap 'error "Build do frontend interrompido"; exit 1' INT TERM

# Executar função principal
main "$@"