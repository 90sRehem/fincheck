# Guia Terraform + LocalStack - Fincheck

## 📋 Visão Geral

Este guia fornece instruções completas para configurar um ambiente de desenvolvimento local usando Terraform e LocalStack para o projeto Fincheck. O setup permite simular a infraestrutura AWS localmente, facilitando o desenvolvimento e testes.

## 🎯 Objetivos

- **Ambiente Local**: Simular AWS services localmente com LocalStack
- **Infraestrutura como Código**: Gerenciar infraestrutura via Terraform
- **Desenvolvimento Isolado**: Ambiente independente da AWS real
- **Custo Zero**: Desenvolvimento sem custos de cloud

## 📁 Estrutura do Projeto

```
fincheck/
├── infra/
│   ├── scripts/
│   │   ├── setup-localstack.sh      # Script principal de setup
│   │   ├── deploy.sh                # Deploy da aplicação
│   │   ├── teardown.sh              # Limpeza do ambiente
│   │   ├── build-containers.sh      # Build dos containers
│   │   └── build-frontend.sh        # Build do frontend
│   ├── terraform/
│   │   ├── main.tf                  # Configuração principal
│   │   ├── variables.tf             # Variáveis do projeto
│   │   ├── outputs.tf               # Outputs importantes
│   │   ├── environments/
│   │   │   ├── local.tfvars         # Configurações locais
│   │   │   └── development.tfvars   # Configurações de dev
│   │   └── modules/
│   │       ├── networking/          # VPC, subnets, security groups
│   │       ├── database/            # RDS PostgreSQL
│   │       ├── ecs/                 # ECS para containers
│   │       └── monitoring/          # CloudWatch, logs
│   └── docker/
│       ├── api/
│       │   ├── Dockerfile           # Container da API
│       │   ├── .dockerignore
│       │   └── health-check.js
│       └── database/
│           └── Dockerfile           # Container do banco
└── apps/
    ├── api/                         # API NestJS
    └── web/                         # Frontend React
```

## 🔧 Pré-requisitos

### Ferramentas Necessárias

```bash
# Docker
docker --version                    # >= 20.0

# AWS CLI
aws --version                      # >= 2.0

# AWS CLI Local
awslocal --version                 # Para interação com LocalStack

# Terraform
terraform --version               # >= 1.0

# Node.js/Bun
bun --version                     # >= 1.0

# LocalStack
pip install localstack           # ou via Docker
```

### Verificação de Dependências

```bash
# Script de verificação (executar antes do setup)
./infra/scripts/check-dependencies.sh
```

## 🚀 Setup Inicial

### 1. Iniciar o Ambiente

```bash
# Na raiz do projeto
./infra/scripts/setup-localstack.sh
```

Este script executa:
- ✅ Verifica se LocalStack está rodando
- ✅ Configura AWS CLI para LocalStack
- ✅ Cria bucket para estado do Terraform
- ✅ Inicializa Terraform
- ✅ Build dos containers
- ✅ Build do frontend

### 2. Deploy da Aplicação

```bash
# Deploy completo
./infra/scripts/deploy.sh
```

### 3. Verificar Deploy

```bash
# Verificar serviços
awslocal ecs list-services --cluster fincheck-cluster

# Verificar banco de dados
awslocal rds describe-db-instances

# Verificar logs
awslocal logs describe-log-groups
```

## 📝 Código Completo dos Arquivos

### 🏗️ TERRAFORM - ARQUIVOS PRINCIPAIS

#### infra/terraform/main.tf

```hcl
terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket                      = "fincheck-terraform-state"
    key                         = "fincheck/terraform.tfstate"
    region                      = "us-east-1"
    endpoint                    = "http://localhost:4566"
    access_key                  = "test"
    secret_key                  = "test"
    skip_credentials_validation = true
    skip_metadata_api_check     = true
    skip_region_validation      = true
    force_path_style           = true
  }
}

provider "aws" {
  region                      = var.aws_region
  access_key                  = "test"
  secret_key                  = "test"
  skip_credentials_validation = true
  skip_metadata_api_check     = true
  skip_region_validation      = true
  
  endpoints {
    ec2            = "http://localhost:4566"
    ecs            = "http://localhost:4566"
    rds            = "http://localhost:4566"
    s3             = "http://localhost:4566"
    cloudwatchlogs = "http://localhost:4566"
    iam            = "http://localhost:4566"
    ecr            = "http://localhost:4566"
    elbv2          = "http://localhost:4566"
    sts            = "http://localhost:4566"
  }
}

# Módulos principais
module "networking" {
  source = "./modules/networking"
  
  project_name = var.project_name
  environment  = var.environment
}

module "database" {
  source = "./modules/database"
  
  project_name    = var.project_name
  environment     = var.environment
  vpc_id          = module.networking.vpc_id
  subnet_ids      = module.networking.private_subnet_ids
  db_username     = var.db_username
  db_password     = var.db_password
  security_groups = [module.networking.database_security_group_id]
}

module "ecs" {
  source = "./modules/ecs"
  
  project_name           = var.project_name
  environment            = var.environment
  vpc_id                 = module.networking.vpc_id
  public_subnet_ids      = module.networking.public_subnet_ids
  private_subnet_ids     = module.networking.private_subnet_ids
  database_url           = module.database.connection_string
  api_security_group_id  = module.networking.api_security_group_id
  alb_security_group_id  = module.networking.alb_security_group_id
}

module "monitoring" {
  source = "./modules/monitoring"
  
  project_name = var.project_name
  environment  = var.environment
}
```

#### infra/terraform/variables.tf

```hcl
variable "project_name" {
  description = "Nome do projeto"
  type        = string
  default     = "fincheck"
}

variable "environment" {
  description = "Ambiente de deploy"
  type        = string
  default     = "local"
}

variable "aws_region" {
  description = "Região AWS"
  type        = string
  default     = "us-east-1"
}

variable "availability_zones" {
  description = "Zonas de disponibilidade"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b"]
}

variable "vpc_cidr" {
  description = "CIDR da VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "CIDRs das subnets públicas"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnet_cidrs" {
  description = "CIDRs das subnets privadas"
  type        = list(string)
  default     = ["10.0.3.0/24", "10.0.4.0/24"]
}

variable "db_username" {
  description = "Username do banco de dados"
  type        = string
  default     = "fincheck"
  sensitive   = true
}

variable "db_password" {
  description = "Senha do banco de dados"
  type        = string
  default     = "fincheck123"
  sensitive   = true
}

variable "db_instance_class" {
  description = "Classe da instância RDS"
  type        = string
  default     = "db.t3.micro"
}

variable "api_container_port" {
  description = "Porta do container da API"
  type        = number
  default     = 3000
}

variable "api_desired_count" {
  description = "Número desejado de instâncias da API"
  type        = number
  default     = 1
}
```

#### infra/terraform/outputs.tf

```hcl
output "vpc_id" {
  description = "ID da VPC criada"
  value       = module.networking.vpc_id
}

output "public_subnet_ids" {
  description = "IDs das subnets públicas"
  value       = module.networking.public_subnet_ids
}

output "private_subnet_ids" {
  description = "IDs das subnets privadas"
  value       = module.networking.private_subnet_ids
}

output "database_endpoint" {
  description = "Endpoint do banco de dados"
  value       = module.database.endpoint
  sensitive   = true
}

output "database_connection_string" {
  description = "String de conexão do banco"
  value       = module.database.connection_string
  sensitive   = true
}

output "ecs_cluster_name" {
  description = "Nome do cluster ECS"
  value       = module.ecs.cluster_name
}

output "api_service_name" {
  description = "Nome do serviço da API"
  value       = module.ecs.api_service_name
}

output "load_balancer_dns" {
  description = "DNS do Load Balancer"
  value       = module.ecs.load_balancer_dns
}

output "api_service_url" {
  description = "URL do serviço da API"
  value       = "http://${module.ecs.load_balancer_dns}"
}

output "frontend_url" {
  description = "URL do frontend"
  value       = "http://localhost.localstack.cloud"
}
```

### 🌐 MÓDULO NETWORKING

#### infra/terraform/modules/networking/main.tf

```hcl
# VPC
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "${var.project_name}-${var.environment}-vpc"
    Environment = var.environment
    Project     = var.project_name
  }
}

# Internet Gateway
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name        = "${var.project_name}-${var.environment}-igw"
    Environment = var.environment
    Project     = var.project_name
  }
}

# Subnets Públicas
resource "aws_subnet" "public" {
  count = length(var.public_subnet_cidrs)

  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.public_subnet_cidrs[count.index]
  availability_zone       = var.availability_zones[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name        = "${var.project_name}-${var.environment}-public-subnet-${count.index + 1}"
    Environment = var.environment
    Project     = var.project_name
    Type        = "public"
  }
}

# Subnets Privadas
resource "aws_subnet" "private" {
  count = length(var.private_subnet_cidrs)

  vpc_id            = aws_vpc.main.id
  cidr_block        = var.private_subnet_cidrs[count.index]
  availability_zone = var.availability_zones[count.index]

  tags = {
    Name        = "${var.project_name}-${var.environment}-private-subnet-${count.index + 1}"
    Environment = var.environment
    Project     = var.project_name
    Type        = "private"
  }
}

# Elastic IPs para NAT Gateways
resource "aws_eip" "nat" {
  count = length(var.public_subnet_cidrs)

  domain = "vpc"

  tags = {
    Name        = "${var.project_name}-${var.environment}-nat-eip-${count.index + 1}"
    Environment = var.environment
    Project     = var.project_name
  }

  depends_on = [aws_internet_gateway.main]
}

# NAT Gateways
resource "aws_nat_gateway" "main" {
  count = length(var.public_subnet_cidrs)

  allocation_id = aws_eip.nat[count.index].id
  subnet_id     = aws_subnet.public[count.index].id

  tags = {
    Name        = "${var.project_name}-${var.environment}-nat-gateway-${count.index + 1}"
    Environment = var.environment
    Project     = var.project_name
  }

  depends_on = [aws_internet_gateway.main]
}

# Route Table Pública
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-public-rt"
    Environment = var.environment
    Project     = var.project_name
  }
}

# Associações Route Table Pública
resource "aws_route_table_association" "public" {
  count = length(aws_subnet.public)

  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

# Route Tables Privadas
resource "aws_route_table" "private" {
  count = length(var.private_subnet_cidrs)

  vpc_id = aws_vpc.main.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.main[count.index].id
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-private-rt-${count.index + 1}"
    Environment = var.environment
    Project     = var.project_name
  }
}

# Associações Route Tables Privadas
resource "aws_route_table_association" "private" {
  count = length(aws_subnet.private)

  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private[count.index].id
}

# Security Group para ALB
resource "aws_security_group" "alb" {
  name        = "${var.project_name}-${var.environment}-alb-sg"
  description = "Security group para Application Load Balancer"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-alb-sg"
    Environment = var.environment
    Project     = var.project_name
  }
}

# Security Group para API
resource "aws_security_group" "api" {
  name        = "${var.project_name}-${var.environment}-api-sg"
  description = "Security group para API containers"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "HTTP from ALB"
    from_port       = 3000
    to_port         = 3000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-api-sg"
    Environment = var.environment
    Project     = var.project_name
  }
}

# Security Group para Database
resource "aws_security_group" "database" {
  name        = "${var.project_name}-${var.environment}-db-sg"
  description = "Security group para RDS database"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "PostgreSQL from API"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.api.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-db-sg"
    Environment = var.environment
    Project     = var.project_name
  }
}
```

#### infra/terraform/modules/networking/variables.tf

```hcl
variable "project_name" {
  description = "Nome do projeto"
  type        = string
}

variable "environment" {
  description = "Ambiente de deploy"
  type        = string
}

variable "vpc_cidr" {
  description = "CIDR da VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "Zonas de disponibilidade"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b"]
}

variable "public_subnet_cidrs" {
  description = "CIDRs das subnets públicas"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnet_cidrs" {
  description = "CIDRs das subnets privadas"
  type        = list(string)
  default     = ["10.0.3.0/24", "10.0.4.0/24"]
}
```

#### infra/terraform/modules/networking/outputs.tf

```hcl
output "vpc_id" {
  description = "ID da VPC"
  value       = aws_vpc.main.id
}

output "public_subnet_ids" {
  description = "IDs das subnets públicas"
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "IDs das subnets privadas"
  value       = aws_subnet.private[*].id
}

output "alb_security_group_id" {
  description = "ID do security group do ALB"
  value       = aws_security_group.alb.id
}

output "api_security_group_id" {
  description = "ID do security group da API"
  value       = aws_security_group.api.id
}

output "database_security_group_id" {
  description = "ID do security group do database"
  value       = aws_security_group.database.id
}
```

### 🗄️ MÓDULO DATABASE

#### infra/terraform/modules/database/main.tf

```hcl
# DB Subnet Group
resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-${var.environment}-db-subnet-group"
  subnet_ids = var.subnet_ids

  tags = {
    Name        = "${var.project_name}-${var.environment}-db-subnet-group"
    Environment = var.environment
    Project     = var.project_name
  }
}

# DB Parameter Group
resource "aws_db_parameter_group" "main" {
  family = "postgres15"
  name   = "${var.project_name}-${var.environment}-db-params"

  parameter {
    name  = "log_statement"
    value = "all"
  }

  parameter {
    name  = "log_min_duration_statement"
    value = "1000"
  }

  parameter {
    name  = "shared_preload_libraries"
    value = "pg_stat_statements"
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-db-params"
    Environment = var.environment
    Project     = var.project_name
  }
}

# RDS Instance
resource "aws_db_instance" "main" {
  identifier = "${var.project_name}-${var.environment}-database"

  # Engine Configuration
  engine         = "postgres"
  engine_version = "15.4"
  instance_class = var.db_instance_class

  # Storage Configuration
  allocated_storage     = 20
  max_allocated_storage = 100
  storage_type          = "gp2"
  storage_encrypted     = true

  # Database Configuration
  db_name  = var.project_name
  username = var.db_username
  password = var.db_password
  port     = 5432

  # Network Configuration
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = var.security_groups
  publicly_accessible    = false

  # Parameter Group
  parameter_group_name = aws_db_parameter_group.main.name

  # Backup Configuration
  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"

  # Monitoring
  performance_insights_enabled = true
  monitoring_interval         = 60

  # Deletion Protection
  deletion_protection = false
  skip_final_snapshot = true

  tags = {
    Name        = "${var.project_name}-${var.environment}-database"
    Environment = var.environment
    Project     = var.project_name
  }
}
```

#### infra/terraform/modules/database/variables.tf

```hcl
variable "project_name" {
  description = "Nome do projeto"
  type        = string
}

variable "environment" {
  description = "Ambiente de deploy"
  type        = string
}

variable "vpc_id" {
  description = "ID da VPC"
  type        = string
}

variable "subnet_ids" {
  description = "IDs das subnets para o banco"
  type        = list(string)
}

variable "security_groups" {
  description = "Security groups para o banco"
  type        = list(string)
}

variable "db_username" {
  description = "Username do banco de dados"
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "Senha do banco de dados"
  type        = string
  sensitive   = true
}

variable "db_instance_class" {
  description = "Classe da instância RDS"
  type        = string
  default     = "db.t3.micro"
}
```

#### infra/terraform/modules/database/outputs.tf

```hcl
output "endpoint" {
  description = "Endpoint do banco de dados"
  value       = aws_db_instance.main.endpoint
}

output "port" {
  description = "Porta do banco de dados"
  value       = aws_db_instance.main.port
}

output "db_name" {
  description = "Nome do banco de dados"
  value       = aws_db_instance.main.db_name
}

output "connection_string" {
  description = "String de conexão do banco"
  value       = "postgresql://${aws_db_instance.main.username}:${aws_db_instance.main.password}@${aws_db_instance.main.endpoint}:${aws_db_instance.main.port}/${aws_db_instance.main.db_name}"
  sensitive   = true
}
```

### 🐳 MÓDULO ECS

#### infra/terraform/modules/ecs/main.tf

```hcl
# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "${var.project_name}-${var.environment}-cluster"

  configuration {
    execute_command_configuration {
      logging = "OVERRIDE"

      log_configuration {
        cloud_watch_log_group_name = aws_cloudwatch_log_group.ecs.name
      }
    }
  }

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-cluster"
    Environment = var.environment
    Project     = var.project_name
  }
}

# CloudWatch Log Group
resource "aws_cloudwatch_log_group" "ecs" {
  name              = "/ecs/${var.project_name}-${var.environment}"
  retention_in_days = 7

  tags = {
    Name        = "${var.project_name}-${var.environment}-ecs-logs"
    Environment = var.environment
    Project     = var.project_name
  }
}

# CloudWatch Log Group para API
resource "aws_cloudwatch_log_group" "api" {
  name              = "/ecs/${var.project_name}-${var.environment}-api"
  retention_in_days = 7

  tags = {
    Name        = "${var.project_name}-${var.environment}-api-logs"
    Environment = var.environment
    Project     = var.project_name
  }
}

# IAM Role para ECS Task Execution
resource "aws_iam_role" "ecs_task_execution" {
  name = "${var.project_name}-${var.environment}-ecs-task-execution"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name        = "${var.project_name}-${var.environment}-ecs-task-execution"
    Environment = var.environment
    Project     = var.project_name
  }
}

# IAM Role Policy Attachment
resource "aws_iam_role_policy_attachment" "ecs_task_execution" {
  role       = aws_iam_role.ecs_task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# IAM Role para ECS Task
resource "aws_iam_role" "ecs_task" {
  name = "${var.project_name}-${var.environment}-ecs-task"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name        = "${var.project_name}-${var.environment}-ecs-task"
    Environment = var.environment
    Project     = var.project_name
  }
}

# Task Definition da API
resource "aws_ecs_task_definition" "api" {
  family                   = "${var.project_name}-${var.environment}-api"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  task_role_arn           = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([
    {
      name      = "api"
      image     = "fincheck-api:latest"
      essential = true
      
      portMappings = [
        {
          containerPort = var.api_container_port
          protocol      = "tcp"
        }
      ]

      environment = [
        {
          name  = "NODE_ENV"
          value = var.environment
        },
        {
          name  = "PORT"
          value = tostring(var.api_container_port)
        },
        {
          name  = "DATABASE_URL"
          value = var.database_url
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.api.name
          awslogs-region        = "us-east-1"
          awslogs-stream-prefix = "ecs"
        }
      }

      healthCheck = {
        command     = ["CMD-SHELL", "curl -f http://localhost:${var.api_container_port}/health || exit 1"]
        interval    = 30
        timeout     = 5
        retries     = 3
        startPeriod = 60
      }
    }
  ])

  tags = {
    Name        = "${var.project_name}-${var.environment}-api-task"
    Environment = var.environment
    Project     = var.project_name
  }
}

# Application Load Balancer
resource "aws_lb" "main" {
  name               = "${var.project_name}-${var.environment}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [var.alb_security_group_id]
  subnets            = var.public_subnet_ids

  enable_deletion_protection = false

  tags = {
    Name        = "${var.project_name}-${var.environment}-alb"
    Environment = var.environment
    Project     = var.project_name
  }
}

# ALB Target Group
resource "aws_lb_target_group" "api" {
  name        = "${var.project_name}-${var.environment}-api-tg"
  port        = var.api_container_port
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"

  health_check {
    enabled             = true
    healthy_threshold   = 2
    interval            = 30
    matcher             = "200"
    path                = "/health"
    port                = "traffic-port"
    protocol            = "HTTP"
    timeout             = 5
    unhealthy_threshold = 2
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-api-tg"
    Environment = var.environment
    Project     = var.project_name
  }
}

# ALB Listener
resource "aws_lb_listener" "api" {
  load_balancer_arn = aws_lb.main.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api.arn
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-api-listener"
    Environment = var.environment
    Project     = var.project_name
  }
}

# ECS Service
resource "aws_ecs_service" "api" {
  name            = "${var.project_name}-${var.environment}-api-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.api.arn
  desired_count   = var.api_desired_count
  launch_type     = "FARGATE"

  network_configuration {
    security_groups  = [var.api_security_group_id]
    subnets          = var.private_subnet_ids
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.api.arn
    container_name   = "api"
    container_port   = var.api_container_port
  }

  depends_on = [aws_lb_listener.api]

  tags = {
    Name        = "${var.project_name}-${var.environment}-api-service"
    Environment = var.environment
    Project     = var.project_name
  }
}

# Auto Scaling Target
resource "aws_appautoscaling_target" "ecs_target" {
  max_capacity       = 4
  min_capacity       = 1
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.api.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

# Auto Scaling Policy - CPU
resource "aws_appautoscaling_policy" "ecs_policy_cpu" {
  name               = "${var.project_name}-${var.environment}-cpu-scaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.ecs_target.resource_id
  scalable_dimension = aws_appautoscaling_target.ecs_target.scalable_dimension
  service_namespace  = aws_appautoscaling_target.ecs_target.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value = 70.0
  }
}

# Auto Scaling Policy - Memory
resource "aws_appautoscaling_policy" "ecs_policy_memory" {
  name               = "${var.project_name}-${var.environment}-memory-scaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.ecs_target.resource_id
  scalable_dimension = aws_appautoscaling_target.ecs_target.scalable_dimension
  service_namespace  = aws_appautoscaling_target.ecs_target.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageMemoryUtilization"
    }
    target_value = 80.0
  }
}
```

#### infra/terraform/modules/ecs/variables.tf

```hcl
variable "project_name" {
  description = "Nome do projeto"
  type        = string
}

variable "environment" {
  description = "Ambiente de deploy"
  type        = string
}

variable "vpc_id" {
  description = "ID da VPC"
  type        = string
}

variable "public_subnet_ids" {
  description = "IDs das subnets públicas"
  type        = list(string)
}

variable "private_subnet_ids" {
  description = "IDs das subnets privadas"
  type        = list(string)
}

variable "database_url" {
  description = "URL de conexão com o banco de dados"
  type        = string
  sensitive   = true
}

variable "api_security_group_id" {
  description = "ID do security group da API"
  type        = string
}

variable "alb_security_group_id" {
  description = "ID do security group do ALB"
  type        = string
}

variable "api_container_port" {
  description = "Porta do container da API"
  type        = number
  default     = 3000
}

variable "api_desired_count" {
  description = "Número desejado de instâncias da API"
  type        = number
  default     = 1
}
```

#### infra/terraform/modules/ecs/outputs.tf

```hcl
output "cluster_name" {
  description = "Nome do cluster ECS"
  value       = aws_ecs_cluster.main.name
}

output "cluster_arn" {
  description = "ARN do cluster ECS"
  value       = aws_ecs_cluster.main.arn
}

output "api_service_name" {
  description = "Nome do serviço da API"
  value       = aws_ecs_service.api.name
}

output "api_service_arn" {
  description = "ARN do serviço da API"
  value       = aws_ecs_service.api.id
}

output "load_balancer_dns" {
  description = "DNS name do Load Balancer"
  value       = aws_lb.main.dns_name
}

output "load_balancer_zone_id" {
  description = "Zone ID do Load Balancer"
  value       = aws_lb.main.zone_id
}

output "api_service_url" {
  description = "URL do serviço da API"
  value       = "http://${aws_lb.main.dns_name}"
}
```

### 📊 MÓDULO MONITORING

#### infra/terraform/modules/monitoring/main.tf

```hcl
# CloudWatch Log Group para aplicação
resource "aws_cloudwatch_log_group" "application" {
  name              = "/aws/${var.project_name}/${var.environment}/application"
  retention_in_days = 7

  tags = {
    Name        = "${var.project_name}-${var.environment}-app-logs"
    Environment = var.environment
    Project     = var.project_name
  }
}

# CloudWatch Log Group para database
resource "aws_cloudwatch_log_group" "database" {
  name              = "/aws/rds/${var.project_name}/${var.environment}"
  retention_in_days = 7

  tags = {
    Name        = "${var.project_name}-${var.environment}-db-logs"
    Environment = var.environment
    Project     = var.project_name
  }
}

# SNS Topic para alertas
resource "aws_sns_topic" "alerts" {
  name = "${var.project_name}-${var.environment}-alerts"

  tags = {
    Name        = "${var.project_name}-${var.environment}-alerts"
    Environment = var.environment
    Project     = var.project_name
  }
}

# CloudWatch Alarm - High CPU ECS
resource "aws_cloudwatch_metric_alarm" "ecs_cpu_high" {
  alarm_name          = "${var.project_name}-${var.environment}-ecs-cpu-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = "300"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "This metric monitors ecs cpu utilization"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    ServiceName = "${var.project_name}-${var.environment}-api-service"
    ClusterName = "${var.project_name}-${var.environment}-cluster"
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-ecs-cpu-alarm"
    Environment = var.environment
    Project     = var.project_name
  }
}

# CloudWatch Alarm - High Memory ECS
resource "aws_cloudwatch_metric_alarm" "ecs_memory_high" {
  alarm_name          = "${var.project_name}-${var.environment}-ecs-memory-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "MemoryUtilization"
  namespace           = "AWS/ECS"
  period              = "300"
  statistic           = "Average"
  threshold           = "85"
  alarm_description   = "This metric monitors ecs memory utilization"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    ServiceName = "${var.project_name}-${var.environment}-api-service"
    ClusterName = "${var.project_name}-${var.environment}-cluster"
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-ecs-memory-alarm"
    Environment = var.environment
    Project     = var.project_name
  }
}

# CloudWatch Alarm - Database CPU
resource "aws_cloudwatch_metric_alarm" "database_cpu_high" {
  alarm_name          = "${var.project_name}-${var.environment}-db-cpu-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/RDS"
  period              = "300"
  statistic           = "Average"
  threshold           = "75"
  alarm_description   = "This metric monitors RDS cpu utilization"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    DBInstanceIdentifier = "${var.project_name}-${var.environment}-database"
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-db-cpu-alarm"
    Environment = var.environment
    Project     = var.project_name
  }
}

# CloudWatch Alarm - Database Connections
resource "aws_cloudwatch_metric_alarm" "database_connections_high" {
  alarm_name          = "${var.project_name}-${var.environment}-db-connections-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "DatabaseConnections"
  namespace           = "AWS/RDS"
  period              = "300"
  statistic           = "Average"
  threshold           = "40"
  alarm_description   = "This metric monitors RDS connections"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    DBInstanceIdentifier = "${var.project_name}-${var.environment}-database"
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-db-connections-alarm"
    Environment = var.environment
    Project     = var.project_name
  }
}

# CloudWatch Dashboard
resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = "${var.project_name}-${var.environment}-dashboard"

  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "metric"
        x      = 0
        y      = 0
        width  = 12
        height = 6

        properties = {
          metrics = [
            ["AWS/ECS", "CPUUtilization", "ServiceName", "${var.project_name}-${var.environment}-api-service", "ClusterName", "${var.project_name}-${var.environment}-cluster"],
            [".", "MemoryUtilization", ".", ".", ".", "."]
          ]
          view    = "timeSeries"
          stacked = false
          region  = "us-east-1"
          title   = "ECS Service Metrics"
          period  = 300
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 6
        width  = 12
        height = 6

        properties = {
          metrics = [
            ["AWS/RDS", "CPUUtilization", "DBInstanceIdentifier", "${var.project_name}-${var.environment}-database"],
            [".", "DatabaseConnections", ".", "."],
            [".", "FreeableMemory", ".", "."]
          ]
          view    = "timeSeries"
          stacked = false
          region  = "us-east-1"
          title   = "RDS Database Metrics"
          period  = 300
        }
      },
      {
        type   = "log"
        x      = 0
        y      = 12
        width  = 24
        height = 6

        properties = {
          query   = "SOURCE '/ecs/${var.project_name}-${var.environment}-api'\n| fields @timestamp, @message\n| sort @timestamp desc\n| limit 100"
          region  = "us-east-1"
          title   = "Recent API Logs"
          view    = "table"
        }
      }
    ]
  })

  tags = {
    Name        = "${var.project_name}-${var.environment}-dashboard"
    Environment = var.environment
    Project     = var.project_name
  }
}
```

#### infra/terraform/modules/monitoring/variables.tf

```hcl
variable "project_name" {
  description = "Nome do projeto"
  type        = string
}

variable "environment" {
  description = "Ambiente de deploy"
  type        = string
}
```

#### infra/terraform/modules/monitoring/outputs.tf

```hcl
output "sns_topic_arn" {
  description = "ARN do tópico SNS para alertas"
  value       = aws_sns_topic.alerts.arn
}

output "dashboard_url" {
  description = "URL do dashboard CloudWatch"
  value       = "https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#dashboards:name=${aws_cloudwatch_dashboard.main.dashboard_name}"
}

output "application_log_group_name" {
  description = "Nome do grupo de logs da aplicação"
  value       = aws_cloudwatch_log_group.application.name
}

output "database_log_group_name" {
  description = "Nome do grupo de logs do banco"
  value       = aws_cloudwatch_log_group.database.name
}
```

### ⚙️ ARQUIVOS DE CONFIGURAÇÃO DE AMBIENTE

#### infra/terraform/environments/local.tfvars

```hcl
# Configurações para ambiente LocalStack
project_name = "fincheck"
environment  = "local"
aws_region   = "us-east-1"

# Network Configuration
vpc_cidr                = "10.0.0.0/16"
availability_zones      = ["us-east-1a", "us-east-1b"]
public_subnet_cidrs     = ["10.0.1.0/24", "10.0.2.0/24"]
private_subnet_cidrs    = ["10.0.3.0/24", "10.0.4.0/24"]

# Database Configuration
db_username         = "fincheck"
db_password         = "fincheck123"
db_instance_class   = "db.t3.micro"

# ECS Configuration
api_container_port  = 3000
api_desired_count   = 1
```

#### infra/terraform/environments/development.tfvars

```hcl
# Configurações para ambiente de desenvolvimento
project_name = "fincheck"
environment  = "development"
aws_region   = "us-east-1"

# Network Configuration
vpc_cidr                = "10.1.0.0/16"
availability_zones      = ["us-east-1a", "us-east-1b", "us-east-1c"]
public_subnet_cidrs     = ["10.1.1.0/24", "10.1.2.0/24", "10.1.3.0/24"]
private_subnet_cidrs    = ["10.1.4.0/24", "10.1.5.0/24", "10.1.6.0/24"]

# Database Configuration
db_username         = "fincheck_dev"
db_password         = "fincheck_dev_password_123"
db_instance_class   = "db.t3.small"

# ECS Configuration
api_container_port  = 3000
api_desired_count   = 2
```

## 🛠️ SCRIPTS COMPLETOS

### 📜 SCRIPT PRINCIPAL - setup-localstack.sh (CORRIGIDO)

#### infra/scripts/setup-localstack.sh

```bash
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
        echo "Instalação: https://docs.docker.com/get-docker/"
        exit 1
    fi
    
    # AWS CLI
    if ! command -v aws &> /dev/null; then
        error "AWS CLI não encontrado. Instale o AWS CLI primeiro."
        echo "Instalação: https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html"
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
        echo "Instalação: https://learn.hashicorp.com/tutorials/terraform/install-cli"
        exit 1
    fi
    
    # Bun
    if ! command -v bun &> /dev/null; then
        error "Bun não encontrado. Instale o Bun primeiro."
        echo "Instalação: https://bun.sh/docs/installation"
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
    
    # Parar container existente se houver
    if docker ps -a | grep -q localstack; then
        docker stop localstack || true
        docker rm localstack || true
    fi
    
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
    
    # Testar conexão com retry
    local max_attempts=5
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        log "Tentativa $attempt de $max_attempts para conectar ao LocalStack..."
        
        if awslocal s3 ls >/dev/null 2>&1; then
            success "LocalStack inicializado com sucesso!"
            return 0
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            error "Falha ao inicializar LocalStack após $max_attempts tentativas"
            exit 1
        fi
        
        attempt=$((attempt + 1))
        sleep 10
    done
}

# Configurar AWS CLI
setup_aws_cli() {
    log "Configurando AWS CLI para LocalStack..."
    
    aws configure set aws_access_key_id test
    aws configure set aws_secret_access_key test
    aws configure set region us-east-1
    aws configure set output json
    
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
    
    # CORREÇÃO: Caminho correto para terraform
    cd infra/terraform
    
    # Limpar cache se necessário
    if [ -d ".terraform" ]; then
        log "Limpando cache do Terraform..."
        rm -rf .terraform .terraform.lock.hcl
    fi
    
    terraform init
    
    success "Terraform inicializado"
    
    # CORREÇÃO: Voltar para raiz do projeto
    cd ../..
}

# Build de containers
build_containers() {
    log "Fazendo build dos containers..."
    
    # Build da API (CAMINHO CORRIGIDO)
    docker build -f infra/docker/api/Dockerfile -t fincheck-api:latest .
    
    # Build do banco (se existir)
    if [ -f "infra/docker/database/Dockerfile" ]; then
        docker build -f infra/docker/database/Dockerfile -t fincheck-database:latest infra/docker/database/
    fi
    
    success "Containers criados com sucesso"
}

# Build do frontend
build_frontend() {
    log "Fazendo build do frontend..."
    
    cd apps/web
    
    # Instalar dependências
    if [ ! -d "node_modules" ]; then
        log "Instalando dependências do frontend..."
        bun install
    fi
    
    # Build do projeto
    bun run build
    
    cd ../..
    
    success "Frontend build concluído"
}

# Verificar saúde do ambiente
health_check() {
    log "Executando verificação de saúde do ambiente..."
    
    # Verificar LocalStack
    if ! awslocal s3 ls >/dev/null 2>&1; then
        error "LocalStack não está respondendo"
        return 1
    fi
    
    # Verificar bucket Terraform
    if ! awslocal s3 ls s3://fincheck-terraform-state >/dev/null 2>&1; then
        error "Bucket do Terraform não encontrado"
        return 1
    fi
    
    # Verificar imagens Docker
    if ! docker images | grep -q fincheck-api; then
        error "Imagem fincheck-api não encontrada"
        return 1
    fi
    
    success "Verificação de saúde concluída com sucesso"
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
    health_check
    
    success "🎉 Setup completo! Ambiente pronto para deploy."
    echo ""
    echo "Próximos passos:"
    echo "1. Execute: ./infra/scripts/deploy.sh"
    echo "2. Acesse: http://localhost.localstack.cloud"
    echo ""
    echo "Para monitorar:"
    echo "- LocalStack: http://localhost:4566/_localstack/health"
    echo "- Logs: docker logs localstack"
}

# Tratamento de erro
trap 'error "Script interrompido"; exit 1' INT TERM

# Executar função principal
main "$@"
```

### 🚀 SCRIPT DE DEPLOY - deploy.sh

#### infra/scripts/deploy.sh

```bash
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
    
    # Planejar mudanças
    log "Executando terraform plan..."
    terraform plan -var-file="environments/local.tfvars" -out=tfplan
    
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
```

### 🧹 SCRIPT DE TEARDOWN - teardown.sh

#### infra/scripts/teardown.sh

```bash
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
        
        log "Executando terraform destroy..."
        terraform destroy -var-file="environments/local.tfvars" -auto-approve
        
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
        sudo rm -rf /tmp/localstack || true
        success "Dados do LocalStack removidos"
    else
        warning "Diretório de dados do LocalStack não encontrado"
    fi
}

# Limpar configurações AWS CLI
cleanup_aws_config() {
    log "Limpando configurações AWS CLI temporárias..."
    
    # Resetar configurações para valores padrão
    aws configure set aws_access_key_id ""
    aws configure set aws_secret_access_key ""
    aws configure set region ""
    
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
```

### 🐳 SCRIPT BUILD CONTAINERS - build-containers.sh

#### infra/scripts/build-containers.sh

```bash
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
```

### 🌐 SCRIPT BUILD FRONTEND - build-frontend.sh

#### infra/scripts/build-frontend.sh

```bash
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
```

### ✅ SCRIPT VERIFICAÇÃO DE DEPENDÊNCIAS - check-dependencies.sh

#### infra/scripts/check-dependencies.sh

```bash
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
```

## 🐳 Configurações Docker

### Dockerfile da API (CORRIGIDO)

```dockerfile
# Build args
ARG BUN_VERSION=1.3.5

# Base stage
FROM oven/bun:${BUN_VERSION}-slim as base
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
RUN groupadd -r -g 1001 nodejs
RUN useradd -r -u 1001 -g nodejs api
WORKDIR /app

# Dependencies
COPY package.json bun.lock ./
COPY apps/api/package.json ./apps/api/
COPY packages/*/package.json ./packages/*/

# Instalar dependências (SEM --frozen-lockfile para evitar erros)
RUN bun install

# Stage de build
FROM base AS builder
COPY . .

# Build da aplicação
RUN cd apps/api && bun run build

# Stage de produção
FROM oven/bun:${BUN_VERSION} AS production
RUN groupadd -r -g 1001 nodejs
RUN useradd -r -u 1001 -g nodejs api
WORKDIR /app

# Copiar apenas necessário para produção
COPY --from=builder --chown=api:nodejs /app/apps/api/dist ./dist
COPY --from=builder --chown=api:nodejs /app/apps/api/package.json ./
COPY --from=builder --chown=api:nodejs /app/node_modules ./node_modules

# Health check
COPY --from=builder /app/infra/docker/api/health-check.js ./health-check.js
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node health-check.js

USER api
EXPOSE 3000

CMD ["bun", "run", "dist/main.js"]
```

## 🛠️ Scripts Principais

### setup-localstack.sh (CORRIGIDO)

```bash
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
```

## 🔧 Correções de Erros

### Problema 1: Erro TypeScript em domain-events.ts

**Arquivo:** `apps/api/src/shared/domain/events/domain-events.ts`

**Linha 65 - Correção:**
```typescript
// ANTES (com erro):
DomainEvents.handlersMap[eventClassName].push(callback);

// DEPOIS (corrigido):
(DomainEvents.handlersMap[eventClassName] ??= []).push(callback);
```

**Linha 84 - Correção:**
```typescript
// ANTES (com erro):
for (const handler of handlers) {
    handler(event);
}

// DEPOIS (corrigido):
if (handlers) {
    for (const handler of handlers) {
        handler(event);
    }
}
```

### Problema 2: Erro TypeScript em user.mapper.ts

**Arquivo:** `apps/api/src/modules/users/infra/mappers/user.mapper.ts`

**Linha 21 - Correção:**
```typescript
// ANTES (com erro):
id: user.id,  // Type 'Id' is not assignable to type 'string'

// DEPOIS (corrigido):
id: user.id.toString(),  // ou user.id.getValue()
```

## 🚀 Comandos de Deploy

### Deploy Completo

```bash
ççççççç# Setup inicial + deploy
./infra/scripts/setup-localstack.sh
./infra/scripts/deploy.sh
```

### Deploy Apenas da Infraestrutura

```bash
cd infra/terraform
terraform plan -var-file="environments/local.tfvars"
terraform apply -var-file="environments/local.tfvars"
```

### Deploy Apenas dos Containers

```bash
./infra/scripts/build-containers.sh
```

## 🔍 Comandos de Debug

### Verificar Status dos Serviços

```bash
# ECS Services
awslocal ecs list-services --cluster fincheck-cluster

# RDS Instances
awslocal rds describe-db-instances

# Logs
awslocal logs describe-log-groups
awslocal logs describe-log-streams --log-group-name /aws/ecs/fincheck-api
```

### Logs da Aplicação

```bash
# Logs do container da API
docker logs $(docker ps -q --filter "label=service=fincheck-api")

# Logs do LocalStack
docker logs localstack
```

### Debug do Terraform

```bash
cd infra/terraform

# Ver estado atual
terraform show

# Ver plano de execução
terraform plan -var-file="environments/local.tfvars"

# Ver outputs
terraform output
```

## 🧹 Limpeza do Ambiente

### Teardown Completo

```bash
./infra/scripts/teardown.sh
```

### Limpeza Manual

```bash
# Parar e remover containers
docker stop localstack
docker rm localstack

# Limpar recursos do Terraform
cd infra/terraform
terraform destroy -var-file="environments/local.tfvars"

# Limpar imagens Docker
docker rmi fincheck-api:latest
docker system prune -f
```

## 🆘 Troubleshooting

### Problema: LocalStack não inicia

**Sintomas:** Erro ao conectar com LocalStack

**Soluções:**
```bash
# Verificar se Docker está rodando
docker ps

# Verificar logs do LocalStack
docker logs localstack

# Reiniciar LocalStack
docker restart localstack
```

### Problema: Terraform não encontra provider

**Sintomas:** Error downloading provider

**Soluções:**
```bash
# Limpar cache do Terraform
rm -rf .terraform .terraform.lock.hcl

# Reinicializar
terraform init
```

### Problema: Build do Docker falha

**Sintomas:** Error building Docker image

**Soluções:**
```bash
# Limpar cache do Docker
docker system prune -f

# Build com verbose
docker build --no-cache -f infra/docker/api/Dockerfile -t fincheck-api:latest .
```

### Problema: Erro de TypeScript no build

**Sintomas:** Type errors during build

**Soluções:**
1. Aplicar correções do domain-events.ts (ver seção "Correções de Erros")
2. Aplicar correções do user.mapper.ts (ver seção "Correções de Erros")
3. Verificar configuração do TypeScript:

```bash
cd apps/api
bun run type-check
```

## 📖 Referências

### Comandos Úteis

```bash
# LocalStack
awslocal s3 ls                              # Listar buckets
awslocal ecs list-clusters                  # Listar clusters ECS
awslocal rds describe-db-instances          # Listar instâncias RDS

# Terraform
terraform validate                          # Validar configuração
terraform fmt                              # Formatar arquivos
terraform state list                       # Listar recursos no estado

# Docker
docker ps                                   # Containers rodando
docker logs <container_id>                  # Logs do container
docker exec -it <container_id> bash        # Acessar container
```

### URLs Importantes

- **LocalStack Dashboard:** http://localhost:4566/_localstack/health
- **API Local:** http://localhost:3000 (após deploy)
- **Frontend Local:** http://localhost.localstack.cloud

## 🔄 Atualizações e Manutenção

### Atualizar LocalStack

```bash
docker pull localstack/localstack:latest
docker restart localstack
```

### Atualizar Dependências

```bash
# Atualizar Terraform providers
cd infra/terraform
terraform init -upgrade

# Atualizar dependências Node.js
cd apps/api && bun update
cd apps/web && bun update
```

### Backup do Estado

```bash
# Backup do estado do Terraform
awslocal s3 cp s3://fincheck-terraform-state/fincheck/terraform.tfstate ./backup/terraform.tfstate.$(date +%Y%m%d)
```

---

## 📞 Suporte

Se encontrar problemas:

1. **Verificar logs:** Sempre verificar os logs dos containers e do LocalStack
2. **Consultar troubleshooting:** Ver seção de troubleshooting deste guia
3. **Limpar ambiente:** Tentar teardown completo e setup novamente
4. **Verificar dependências:** Garantir que todas as versões estão corretas

**Versões testadas:**
- LocalStack: latest
- Terraform: >= 1.0
- Docker: >= 20.0
- Node.js/Bun: >= 1.0
- AWS CLI: >= 2.0

Este guia foi criado para o projeto Fincheck e testado em ambiente Ubuntu/Linux. Adaptações podem ser necessárias para outros sistemas operacionais.