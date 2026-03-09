output "vpc_id" {
  description = "ID da VPC criada"
  value       = aws_vpc.main.id
}

output "public_subnet_ids" {
  description = "IDs das subnets públicas"
  value       = aws_subnet.public.*.id
}

output "private_subnet_ids" {
  description = "IDs das subnets privadas"
  value       = aws_subnet.private.*.id
}

output "frontend_url" {
  description = "URL do frontend"
  value       = "http://localhost.localstack.cloud"
  # value       = "http://${aws_lb.main.dns_name}"
  # value       = "http://localhost.localstack.cloud"
  # value       = "http://${aws_lb.main.dns_name}"
  # value       = "http://localhost.localstack.cloud"
    
}

output "api_security_group_id" {
  description = "ID do security group da API"
  value       = aws_security_group.api.id
}

output "alb_security_group_id" {
  description = "ID do security group do ALB"
  value       = aws_security_group.alb.id
}

output "database_security_group_id" {
  description = "ID do security group do database"
  value       = aws_security_group.database.id
}
