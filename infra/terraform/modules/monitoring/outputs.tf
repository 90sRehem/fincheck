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
