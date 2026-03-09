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
