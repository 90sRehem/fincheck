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
    log "Verificando pré-requisitos para deploy..."
    
    # Verificar se LocalStack está rodando
    if ! docker ps | grep -q localstack; then
        error "LocalStack não está rodando. Execute primeiro: ./infra/scripts/setup-localstack.sh"
        exit 1
    fi
    
    # Verificar conectividade LocalStack
    if ! awslocal s3 ls >/dev/null 2>&1; then
        error "LocalStack não está respondendo"
        exit 1
    fi
    
    # Verificar se Terraform está inicializado
    if [ ! -d "infra/terraform/.terraform" ]; then
        error "Terraform não inicializado. Execute: ./infra/scripts/setup-localstack.sh"
        exit 1
    fi
    
    # Verificar imagem Docker
    if ! docker images | grep -q fincheck-api; then
        warning "Imagem fincheck-api não encontrada. Fazendo build..."
        build_containers
    fi
    
    success "Pré-requisitos verificados"
}

# Build dos containers se necessário
build_containers() {
    log "Fazendo build dos containers..."
    docker build -f infra/docker/api/Dockerfile -t fincheck-api:latest .
    success "Build dos containers concluído"
}

# Deploy da infraestrutura com Terraform
deploy_infrastructure() {
    log "Fazendo deploy da infraestrutura..."
    
    cd infra/terraform
    
    # Verificar se existe arquivo de ambiente
    if [ ! -f "environments/local/terraform.tfvars" ]; then
        error "Arquivo terraform.tfvars não encontrado em environments/local/"
        exit 1
    fi
    
    # Planejar mudanças
    log "Executando terraform plan..."
    terraform plan -var-file="environments/local/terraform.tfvars" -out=tfplan
    
    # Aplicar mudanças
    log "Executando terraform apply..."
    terraform apply tfplan
    
    # Limpar arquivo de plano
    rm -f tfplan
    
    success "Deploy da infraestrutura concluído"
    cd ../..
}

# Aguardar serviços ficarem saudáveis
wait_for_services() {
    log "Aguardando serviços ficarem saudáveis..."
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        log "Verificação $attempt de $max_attempts..."
        
        # Verificar se o cluster existe
        if awslocal ecs describe-clusters --clusters fincheck-local-cluster >/dev/null 2>&1; then
            
            # Verificar se o serviço está rodando
            local service_status=$(awslocal ecs describe-services \
                --cluster fincheck-local-cluster \
                --services fincheck-local-api-service \
                --query 'services[0].runningCount' --output text 2>/dev/null || echo "0")
            
            if [ "$service_status" -gt 0 ]; then
                success "Serviços estão saudáveis!"
                return 0
            fi
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            error "Timeout aguardando serviços ficarem saudáveis"
            return 1
        fi
        
        attempt=$((attempt + 1))
        sleep 10
    done
}

# Obter informações do deploy
get_deployment_info() {
    log "Obtendo informações do deployment..."
    
    cd infra/terraform
    
    echo ""
    echo "=== INFORMAÇÕES DO DEPLOYMENT ==="
    echo ""
    
    # Outputs do Terraform
    terraform output
    
    echo ""
    echo "=== STATUS DOS SERVIÇOS ==="
    echo ""
    
    # Status do ECS
    awslocal ecs describe-services \
        --cluster fincheck-local-cluster \
        --services fincheck-local-api-service \
        --query 'services[0].{ServiceName:serviceName,Status:status,Running:runningCount,Desired:desiredCount}' \
        --output table || true
    
    echo ""
    echo "=== ENDPOINTS DISPONÍVEIS ==="
    echo ""
    
    local alb_dns=$(terraform output -raw load_balancer_dns 2>/dev/null || echo "N/A")
    echo "API URL: http://$alb_dns"
    echo "Frontend URL: http://localhost.localstack.cloud"
    echo "LocalStack Health: http://localhost:4566/_localstack/health"
    
    cd ../..
    
    success "Deploy concluído com sucesso!"
}

# Função principal
main() {
    log "🚀 Iniciando deploy da aplicação Fincheck"
    
    check_prerequisites
    deploy_infrastructure
    wait_for_services
    get_deployment_info
    
    echo ""
    echo "🎉 Deploy concluído! Acesse:"
    echo "   API: http://$(cd infra/terraform && terraform output -raw load_balancer_dns 2>/dev/null || echo 'localhost')"
    echo "   Frontend: http://localhost.localstack.cloud"
}

# Tratamento de erro
trap 'error "Deploy interrompido"; exit 1' INT TERM

# Executar função principal
main "$@"