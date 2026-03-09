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

output "security_groups" {
  description = "Security groups para o banco"
  value       = aws_db_instance.main.vpc_security_group_ids
}
