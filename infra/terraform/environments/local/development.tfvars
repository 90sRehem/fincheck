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
