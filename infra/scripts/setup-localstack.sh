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

# Verificar dependências
check_dependencies() {
    log "Verificando dependências..."
    
    # Docker
    if ! command -v docker &> /dev/null; then
        error "Docker não encontrado. Instale o Docker primeiro."
        exit 1
    fi
    
    # AWS CLI
    if ! command -v aws &> /dev/null; then
        error "AWS CLI não encontrado. Instale o AWS CLI primeiro."
        exit 1
    fi
    
    # AWS CLI Local
    if ! command -v awslocal &> /dev/null; then
        error "awslocal não encontrado. Instale com: pip install awscli-local"
        exit 1
    fi
    
    # Terraform
    if ! command -v terraform &> /dev/null; then
        error "Terraform não encontrado. Instale o Terraform primeiro."
        exit 1
    fi
    
    # Bun
    if ! command -v bun &> /dev/null; then
        error "Bun não encontrado. Instale o Bun primeiro."
        exit 1
    fi
    
    success "Todas as dependências verificadas"
}

# Verificar se o LocalStack está rodando
check_localstack() {
    log "Verificando se LocalStack está rodando..."
    
    if docker ps | grep -q localstack; then
        success "LocalStack está rodando"
    else
        warning "LocalStack não está rodando. Iniciando..."
        start_localstack
    fi
}

# Iniciar LocalStack
start_localstack() {
    log "Iniciando LocalStack..."
    
    docker run --rm -d \
        --name localstack \
        -p 4566:4566 \
        -p 4571:4571 \
        -e DEBUG=1 \
        -e SERVICES=s3,ec2,ecs,rds,cloudfront,logs,iam,ecr,elbv2,sts \
        -e DOCKER_HOST=unix:///var/run/docker.sock \
        -v /var/run/docker.sock:/var/run/docker.sock \
        -v /tmp/localstack:/var/lib/localstack \
        localstack/localstack:latest

    # Aguardar LocalStack ficar pronto
    log "Aguardando LocalStack inicializar..."
    sleep 30
    
    # Testar conexão
    if awslocal s3 ls >/dev/null 2>&1; then
        success "LocalStack inicializado com sucesso!"
    else
        error "Falha ao inicializar LocalStack"
        exit 1
    fi
}

# Configurar AWS CLI
setup_aws_cli() {
    log "Configurando AWS CLI para LocalStack..."
    
    aws configure set aws_access_key_id test
    aws configure set aws_secret_access_key test
    aws configure set region us-east-1
    
    success "AWS CLI configurado para LocalStack"
}

# Criar bucket para estado do Terraform
create_terraform_bucket() {
    log "Criando bucket para estado do Terraform..."
    
    if awslocal s3 ls s3://fincheck-terraform-state >/dev/null 2>&1; then
        warning "Bucket já existe"
    else
        awslocal s3 mb s3://fincheck-terraform-state
        success "Bucket criado: fincheck-terraform-state"
    fi
}

# Inicializar Terraform
init_terraform() {
    log "Inicializando Terraform..."
    
    cd infra/terraform
    terraform init
    
    success "Terraform inicializado"
    cd ../..
}

# Build de containers
build_containers() {
    log "Fazendo build dos containers..."
    
    # Build da API (CAMINHO CORRIGIDO)
    docker build -f infra/docker/api/Dockerfile -t fincheck-api:latest .
    
    success "Containers criados com sucesso"
}

# Build do frontend
build_frontend() {
    log "Fazendo build do frontend..."
    
    cd apps/web
    bun install
    bun run build
    cd ../..
    
    success "Frontend build concluído"
}

# Função principal
main() {
    log "🚀 Iniciando setup do ambiente Fincheck com LocalStack"
    
    check_dependencies
    check_localstack
    setup_aws_cli
    create_terraform_bucket
    init_terraform
    build_containers
    build_frontend
    
    success "🎉 Setup completo! Ambiente pronto para deploy."
    echo ""
    echo "Próximos passos:"
    echo "1. Execute: ./infra/scripts/deploy.sh"
    echo "2. Acesse: http://localhost.localstack.cloud"
}

# Executar função principal
main "$@"
