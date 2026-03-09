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

# Confirmar destruição
confirm_destruction() {
    echo ""
    warning "⚠️  ATENÇÃO: Esta operação irá destruir TODOS os recursos!"
    echo ""
    echo "Recursos que serão removidos:"
    echo "- Cluster ECS e serviços"
    echo "- Instância RDS (banco de dados)"
    echo "- Load Balancer"
    echo "- VPC e recursos de rede"
    echo "- CloudWatch logs e alarmes"
    echo "- LocalStack container"
    echo "- Imagens Docker locais"
    echo ""
    
    read -p "Tem certeza que deseja continuar? (digite 'yes' para confirmar): " confirmation
    
    if [ "$confirmation" != "yes" ]; then
        log "Operação cancelada pelo usuário"
        exit 0
    fi
}

# Destruir infraestrutura com Terraform
destroy_infrastructure() {
    log "Destruindo infraestrutura com Terraform..."
    
    if [ -d "infra/terraform/.terraform" ]; then
        cd infra/terraform
        
        # Verificar se existe arquivo de ambiente
        if [ -f "environments/local/terraform.tfvars" ]; then
            log "Executando terraform destroy..."
            terraform destroy -var-file="environments/local/terraform.tfvars" -auto-approve
        else
            warning "Arquivo terraform.tfvars não encontrado, tentando destroy sem variáveis..."
            terraform destroy -auto-approve || true
        fi
        
        # Limpar arquivos do Terraform
        rm -rf .terraform .terraform.lock.hcl terraform.tfstate terraform.tfstate.backup tfplan
        
        cd ../..
        success "Infraestrutura destruída"
    else
        warning "Terraform não inicializado, pulando destruição da infraestrutura"
    fi
}

# Parar e remover LocalStack
stop_localstack() {
    log "Parando LocalStack..."
    
    if docker ps | grep -q localstack; then
        docker stop localstack
        success "LocalStack parado"
    else
        warning "LocalStack não estava rodando"
    fi
    
    if docker ps -a | grep -q localstack; then
        docker rm localstack
        success "Container LocalStack removido"
    fi
}

# Limpar imagens Docker
cleanup_docker_images() {
    log "Limpando imagens Docker..."
    
    # Remover imagens da aplicação
    if docker images | grep -q fincheck-api; then
        docker rmi fincheck-api:latest || true
        success "Imagem fincheck-api removida"
    fi
    
    if docker images | grep -q fincheck-database; then
        docker rmi fincheck-database:latest || true
        success "Imagem fincheck-database removida"
    fi
    
    # Limpar imagens órfãs
    log "Removendo imagens órfãs..."
    docker image prune -f || true
    
    success "Limpeza de imagens Docker concluída"
}

# Limpar volumes e redes Docker
cleanup_docker_resources() {
    log "Limpando volumes e redes Docker..."
    
    # Remover volumes não utilizados
    docker volume prune -f || true
    
    # Remover redes não utilizadas
    docker network prune -f || true
    
    success "Recursos Docker limpos"
}

# Limpar dados do LocalStack
cleanup_localstack_data() {
    log "Limpando dados do LocalStack..."
    
    if [ -d "/tmp/localstack" ]; then
        sudo rm -rf /tmp/localstack || rm -rf /tmp/localstack || true
        success "Dados do LocalStack removidos"
    else
        warning "Diretório de dados do LocalStack não encontrado"
    fi
}

# Limpar configurações AWS CLI
cleanup_aws_config() {
    log "Limpando configurações AWS CLI temporárias..."
    
    # Resetar configurações para valores padrão
    aws configure set aws_access_key_id "" || true
    aws configure set aws_secret_access_key "" || true
    aws configure set region "" || true
    
    success "Configurações AWS CLI resetadas"
}

# Verificar limpeza
verify_cleanup() {
    log "Verificando limpeza..."
    
    local issues=0
    
    # Verificar se LocalStack ainda está rodando
    if docker ps | grep -q localstack; then
        error "LocalStack ainda está rodando"
        issues=$((issues + 1))
    fi
    
    # Verificar imagens restantes
    if docker images | grep -q fincheck; then
        warning "Algumas imagens fincheck ainda existem"
        docker images | grep fincheck
    fi
    
    # Verificar se há recursos Terraform restantes
    if [ -f "infra/terraform/terraform.tfstate" ]; then
        if [ -s "infra/terraform/terraform.tfstate" ]; then
            warning "Arquivo de estado Terraform não está vazio"
            issues=$((issues + 1))
        fi
    fi
    
    if [ $issues -eq 0 ]; then
        success "Limpeza verificada - nenhum problema encontrado"
    else
        warning "$issues problema(s) encontrado(s) durante a verificação"
    fi
    
    return $issues
}

# Função principal
main() {
    log "🧹 Iniciando teardown do ambiente Fincheck"
    
    confirm_destruction
    
    destroy_infrastructure
    stop_localstack
    cleanup_docker_images
    cleanup_docker_resources
    cleanup_localstack_data
    cleanup_aws_config
    verify_cleanup
    
    echo ""
    success "🎉 Teardown concluído!"
    echo ""
    echo "Ambiente completamente limpo. Para recriar:"
    echo "1. Execute: ./infra/scripts/setup-localstack.sh"
    echo "2. Execute: ./infra/scripts/deploy.sh"
}

# Tratamento de erro
trap 'error "Teardown interrompido"; exit 1' INT TERM

# Executar função principal
main "$@"