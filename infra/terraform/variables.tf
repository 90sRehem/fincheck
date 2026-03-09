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
