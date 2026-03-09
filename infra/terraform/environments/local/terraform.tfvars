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
