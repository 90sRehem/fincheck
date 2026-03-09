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
