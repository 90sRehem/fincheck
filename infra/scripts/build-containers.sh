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

# Verificar Docker
check_docker() {
    if ! command -v docker &> /dev/null; then
        error "Docker não encontrado"
        exit 1
    fi
    
    if ! docker info >/dev/null 2>&1; then
        error "Docker não está rodando"
        exit 1
    fi
    
    success "Docker verificado"
}

# Build da API
build_api() {
    log "Fazendo build da API..."
    
    # Verificar se Dockerfile existe
    if [ ! -f "infra/docker/api/Dockerfile" ]; then
        error "Dockerfile da API não encontrado em infra/docker/api/Dockerfile"
        exit 1
    fi
    
    # Build com cache otimizado
    docker build \
        -f infra/docker/api/Dockerfile \
        -t fincheck-api:latest \
        --build-arg BUILDKIT_INLINE_CACHE=1 \
        .
    
    success "Build da API concluído"
}

# Build do banco de dados (se existir)
build_database() {
    if [ -f "infra/docker/database/Dockerfile" ]; then
        log "Fazendo build do banco de dados..."
        
        docker build \
            -f infra/docker/database/Dockerfile \
            -t fincheck-database:latest \
            infra/docker/database/
        
        success "Build do banco concluído"
    else
        warning "Dockerfile do banco não encontrado, pulando..."
    fi
}

# Verificar builds
verify_builds() {
    log "Verificando builds..."
    
    # Verificar imagem da API
    if docker images | grep -q fincheck-api; then
        local api_size=$(docker images fincheck-api:latest --format "table {{.Size}}" | tail -n +2)
        success "Imagem fincheck-api criada (tamanho: $api_size)"
    else
        error "Imagem fincheck-api não encontrada"
        exit 1
    fi
    
    # Verificar imagem do banco (se foi criada)
    if docker images | grep -q fincheck-database; then
        local db_size=$(docker images fincheck-database:latest --format "table {{.Size}}" | tail -n +2)
        success "Imagem fincheck-database criada (tamanho: $db_size)"
    fi
}

# Testar containers
test_containers() {
    log "Testando containers..."
    
    # Teste básico da API (verificar se inicia)
    log "Testando container da API..."
    local api_test=$(docker run --rm -d \
        -e NODE_ENV=test \
        -e PORT=3000 \
        -e DATABASE_URL=postgresql://test:test@localhost:5432/test \
        fincheck-api:latest)
    
    sleep 5
    
    # Verificar se o container está rodando
    if docker ps | grep -q $api_test; then
        success "Container da API passou no teste"
        docker stop $api_test >/dev/null
    else
        error "Container da API falhou no teste"
        docker logs $api_test
        exit 1
    fi
}

# Limpar builds antigos
cleanup_old_builds() {
    log "Limpando builds antigos..."
    
    # Remover imagens órfãs
    docker image prune -f >/dev/null || true
    
    # Remover imagens antigas da aplicação
    docker images | grep fincheck | grep -v latest | awk '{print $3}' | xargs -r docker rmi >/dev/null 2>&1 || true
    
    success "Limpeza concluída"
}

# Função principal
main() {
    log "🐳 Iniciando build dos containers"
    
    check_docker
    cleanup_old_builds
    build_api
    build_database
    verify_builds
    test_containers
    
    echo ""
    success "🎉 Build dos containers concluído!"
    echo ""
    echo "Imagens criadas:"
    docker images | grep fincheck
    echo ""
    echo "Para fazer deploy: ./infra/scripts/deploy.sh"
}

# Tratamento de erro
trap 'error "Build interrompido"; exit 1' INT TERM

# Executar função principal
main "$@"