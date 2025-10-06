#!/bin/bash

# Pizza Ordering System Deployment Script
# This script handles the deployment process for the backend

set -e

echo "🚀 Starting Pizza Ordering System Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
NODE_ENV=${NODE_ENV:-production}
PORT=${PORT:-5000}

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required environment variables are set
check_env_vars() {
    print_status "Checking environment variables..."
    
    required_vars=("MONGODB_URI" "JWT_SECRET")
    missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var}" ]]; then
            missing_vars+=("$var")
        fi
    done
    
    if [[ ${#missing_vars[@]} -ne 0 ]]; then
        print_error "Missing required environment variables:"
        for var in "${missing_vars[@]}"; do
            echo "  - $var"
        done
        exit 1
    fi
    
    print_status "Environment variables check passed ✅"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    npm ci --only=production
    print_status "Dependencies installed ✅"
}

# Run database seeding if needed
seed_database() {
    if [[ "$1" == "--seed" ]]; then
        print_status "Seeding database..."
        npm run seed
        print_status "Database seeded ✅"
    fi
}

# Run tests
run_tests() {
    if [[ "$NODE_ENV" != "production" ]]; then
        print_status "Running tests..."
        npm install --only=dev
        npm test
        print_status "Tests passed ✅"
    else
        print_warning "Skipping tests in production mode"
    fi
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    mkdir -p logs
    mkdir -p uploads
    print_status "Directories created ✅"
}

# Set proper file permissions
set_permissions() {
    print_status "Setting file permissions..."
    chmod +x scripts/*.sh
    chmod 755 logs uploads
    print_status "Permissions set ✅"
}

# Start the application
start_application() {
    print_status "Starting the application..."
    
    if [[ "$NODE_ENV" == "production" ]]; then
        # In production, use PM2 or similar process manager
        if command -v pm2 &> /dev/null; then
            pm2 start ecosystem.config.js --env production
            print_status "Application started with PM2 ✅"
        else
            print_warning "PM2 not found, starting with npm start"
            npm start
        fi
    else
        # In development
        npm run dev
    fi
}

# Health check
health_check() {
    print_status "Performing health check..."
    
    # Wait for application to start
    sleep 5
    
    # Check if the application is responding
    if curl -f http://localhost:${PORT}/api/health &>/dev/null; then
        print_status "Health check passed ✅"
    else
        print_error "Health check failed ❌"
        exit 1
    fi
}

# Main deployment process
main() {
    print_status "Starting deployment process..."
    print_status "Environment: $NODE_ENV"
    print_status "Port: $PORT"
    
    check_env_vars
    create_directories
    install_dependencies
    run_tests
    seed_database "$@"
    set_permissions
    start_application
    
    if [[ "$1" != "--no-health-check" ]]; then
        health_check
    fi
    
    print_status "🎉 Deployment completed successfully!"
}

# Handle command line arguments
case "$1" in
    --help)
        echo "Pizza Ordering System Deployment Script"
        echo ""
        echo "Usage: $0 [OPTIONS]"
        echo ""
        echo "Options:"
        echo "  --seed              Seed the database with initial data"
        echo "  --no-health-check   Skip health check after deployment"
        echo "  --help              Show this help message"
        echo ""
        echo "Environment Variables:"
        echo "  NODE_ENV           Environment (development/production)"
        echo "  PORT               Port to run the application on"
        echo "  MONGODB_URI        MongoDB connection string"
        echo "  JWT_SECRET         JWT secret key"
        ;;
    *)
        main "$@"
        ;;
esac