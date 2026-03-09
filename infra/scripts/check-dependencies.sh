#!/bin/bash

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Funções de logging
log() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

success() {
    echo -e "${GREEN}[✓] $1${NC}"
}

warning() {
    echo -e "${YELLOW}[⚠] $1${NC}"
}

error() {
    echo -e "${RED}[✗] $1${NC}"
}

# Função para verificar versão
check_version() {
    local tool=$1
    local min_version=$2
    local current_version=$3
    
    if [ -z "$current_version" ]; then
        error "$tool: Não instalado"
        return 1
    fi
    
    success "$tool: $current_version"
    return 0
}

# Verificar Docker
check_docker() {
    log "Verificando Docker..."
    
    if command -v docker &> /dev/null; then
        local version=$(docker --version | grep -o '[0-9]\+\.[0-9]\+\.[0-9]\+' | head -1)
        check_version "Docker" "20.0.0" "$version"
        
        if ! docker info >/dev/null 2>&1; then
            warning "Docker instalado mas não está rodando"
            echo "  Execute: sudo systemctl start docker"
            return 1
        fi
    else
        error "Docker não encontrado"
        echo "  Instale em: https://docs.docker.com/get-docker/"
        return 1
    fi
}

# Verificar AWS CLI
check_aws_cli() {
    log "Verificando AWS CLI..."
    
    if command -v aws &> /dev/null; then
        local version=$(aws --version 2>&1 | grep -o 'aws-cli/[0-9]\+\.[0-9]\+\.[0-9]\+' | cut -d'/' -f2)
        check_version "AWS CLI" "2.0.0" "$version"
    else
        error "AWS CLI não encontrado"
        echo "  Instale em: https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html"
        return 1
    fi
}

# Verificar AWS Local
check_aws_local() {
    log "Verificando AWS Local..."
    
    if command -v awslocal &> /dev/null; then
        success "AWS Local: Instalado"
    else
        error "AWS Local não encontrado"
        echo "  Instale com: pip install awscli-local"
        return 1
    fi
}

# Verificar Terraform
check_terraform() {
    log "Verificando Terraform..."
    
    if command -v terraform &> /dev/null; then
        local version=$(terraform version | head -1 | grep -o 'v[0-9]\+\.[0-9]\+\.[0-9]\+' | cut -c2-)
        check_version "Terraform" "1.0.0" "$version"
    else
        error "Terraform não encontrado"
        echo "  Instale em: https://learn.hashicorp.com/tutorials/terraform/install-cli"
        return 1
    fi
}

# Verificar Bun
check_bun() {
    log "Verificando Bun..."
    
    if command -v bun &> /dev/null; then
        local version=$(bun --version)
        check_version "Bun" "1.0.0" "$version"
    else
        error "Bun não encontrado"
        echo "  Instale em: https://bun.sh/docs/installation"
        return 1
    fi
}

# Verificar Node.js (alternativa ao Bun)
check_node() {
    log "Verificando Node.js (opcional)..."
    
    if command -v node &> /dev/null; then
        local version=$(node --version | cut -c2-)
        check_version "Node.js" "18.0.0" "$version"
    else
        warning "Node.js não encontrado (não obrigatório se Bun estiver instalado)"
    fi
}

# Verificar Git
check_git() {
    log "Verificando Git..."
    
    if command -v git &> /dev/null; then
        local version=$(git --version | grep -o '[0-9]\+\.[0-9]\+\.[0-9]\+')
        check_version "Git" "2.0.0" "$version"
    else
        warning "Git não encontrado"
        echo "  Instale com: sudo apt install git (Ubuntu/Debian)"
    fi
}

# Verificar Curl
check_curl() {
    log "Verificando Curl..."
    
    if command -v curl &> /dev/null; then
        local version=$(curl --version | head -1 | grep -o '[0-9]\+\.[0-9]\+\.[0-9]\+' | head -1)
        check_version "Curl" "7.0.0" "$version"
    else
        warning "Curl não encontrado"
        echo "  Instale com: sudo apt install curl"
    fi
}

# Verificar sistema operacional
check_system() {
    log "Verificando sistema operacional..."
    
    local os=$(uname -s)
    local arch=$(uname -m)
    
    success "Sistema: $os $arch"
    
    if [ "$os" = "Linux" ]; then
        if [ -f "/etc/os-release" ]; then
            local distro=$(grep "^NAME=" /etc/os-release | cut -d'"' -f2)
            success "Distribuição: $distro"
        fi
    elif [ "$os" = "Darwin" ]; then
        success "Sistema: macOS"
    else
        warning "Sistema não testado: $os"
    fi
}

# Verificar portas disponíveis
check_ports() {
    log "Verificando portas necessárias..."
    
    local ports=(4566 4571 3000 5432 80)
    local issues=0
    
    for port in "${ports[@]}"; do
        if command -v netstat &> /dev/null; then
            if netstat -ln | grep -q ":$port "; then
                warning "Porta $port em uso"
                issues=$((issues + 1))
            else
                success "Porta $port disponível"
            fi
        elif command -v ss &> /dev/null; then
            if ss -ln | grep -q ":$port "; then
                warning "Porta $port em uso"
                issues=$((issues + 1))
            else
                success "Porta $port disponível"
            fi
        else
            warning "Não foi possível verificar porta $port"
        fi
    done
    
    if [ $issues -gt 0 ]; then
        warning "$issues porta(s) em uso. Pode haver conflitos."
    fi
}

# Função principal
main() {
    echo ""
    echo "=== VERIFICAÇÃO DE DEPENDÊNCIAS - FINCHECK LOCALSTACK ==="
    echo ""
    
    local failed=0
    
    # Verificações obrigatórias
    check_system
    check_docker || failed=$((failed + 1))
    check_aws_cli || failed=$((failed + 1))
    check_aws_local || failed=$((failed + 1))
    check_terraform || failed=$((failed + 1))
    check_bun || failed=$((failed + 1))
    
    echo ""
    echo "=== VERIFICAÇÕES OPCIONAIS ==="
    
    # Verificações opcionais
    check_node
    check_git
    check_curl
    check_ports
    
    echo ""
    echo "=== RESUMO ==="
    
    if [ $failed -eq 0 ]; then
        success "Todas as dependências obrigatórias estão instaladas!"
        echo ""
        echo "Próximo passo:"
        echo "  ./infra/scripts/setup-localstack.sh"
    else
        error "$failed dependência(s) obrigatória(s) faltando!"
        echo ""
        echo "Instale as dependências faltantes e execute novamente:"
        echo "  ./infra/scripts/check-dependencies.sh"
        exit 1
    fi
}

# Executar função principal
main "$@"