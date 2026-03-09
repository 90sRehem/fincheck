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
