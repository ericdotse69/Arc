# Arc - Docker Deployment Guide

Complete containerized deployment for Arc (Deep Work Quantification System) using Docker and Docker Compose.

## 📋 Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- Git

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Arc
```

### 2. Configure Environment Variables
Create a `.env` file from the example:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
DB_USER=postgres
DB_PASSWORD=your-secure-password
DB_NAME=arc_db
JWT_SECRET=your-very-secure-jwt-secret
NODE_ENV=production
```

### 3. Build and Run
```bash
docker-compose up -d
```

The application will be available at:
- **Frontend**: http://localhost (or configured port)
- **Backend API**: http://localhost:3000
- **Database**: localhost:5432 (internal access via `db` hostname)

## 🛑 Stop Services
```bash
docker-compose down
```

To also remove persistent data:
```bash
docker-compose down -v
```

## 📦 Service Architecture

### Services

#### `db` - PostgreSQL Database
- **Image**: postgres:15-alpine
- **Port**: 5432 (internal), configurable externally
- **Volume**: `arc_db_data` (persistent)
- **Health Check**: Enabled

#### `server` - Express Backend
- **Build**: Multi-stage Docker build
- **Port**: 3000 (configurable)
- **Environment**: Production-ready
- **Features**:
  - TypeScript compilation in build stage
  - Non-root user execution
  - Database migrations support
  - Health checks enabled
- **Dependencies**: Waits for PostgreSQL startup

#### `client` - React Frontend
- **Build**: Multi-stage with Nginx
- **Port**: 80 (configurable)
- **Server**: Nginx with gzip compression
- **Features**:
  - SPA routing with Nginx fallback
  - Asset caching optimization
  - Security headers
  - Health checks enabled
- **Dependencies**: Waits for server startup

### Network
- All services connected via `arc_network` bridge network
- Internal DNS resolution: use service names (`db`, `server`, `client`)

## 🔧 Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_USER` | postgres | PostgreSQL username |
| `DB_PASSWORD` | password | PostgreSQL password (CHANGE IN PRODUCTION) |
| `DB_NAME` | arc_db | Database name |
| `DB_PORT` | 5432 | PostgreSQL external port |
| `NODE_ENV` | production | Node environment |
| `SERVER_PORT` | 3000 | Server port |
| `JWT_SECRET` | (required) | JWT signing secret |
| `CLIENT_PORT` | 80 | Frontend port |
| `VITE_API_URL` | http://localhost:3000 | API base URL for client |

### Server Dockerfile

**Multi-stage build**:
1. **Builder stage**: Compiles TypeScript, installs all dependencies
2. **Production stage**: Copies only production artifacts, smaller image size

**Security**:
- Non-root user (UID 1001)
- dumb-init for signal handling
- Minimal base image (Alpine)

### Client Dockerfile

**Multi-stage build**:
1. **Builder stage**: React app with Vite build process
2. **Production stage**: Nginx serving static files

**Optimization**:
- Gzip compression enabled
- Asset versioning with caching
- SPA routing via Nginx
- Health checks

### Nginx Configuration

Located in `client/nginx.conf`:
- GZip compression
- SPA routing (404 → index.html)
- Static file caching (365 days for /assets/)
- Security: blocks hidden files and backups

## 📊 Database Management

### Access Database from Host
```bash
# Using psql
psql -h localhost -U postgres -d arc_db

# Or with Docker
docker-compose exec db psql -U postgres -d arc_db
```

### Run Prisma Migrations
Migrations run automatically during server startup via health check. To manually run:

```bash
docker-compose exec server npm run prisma:migrate
```

### Access Prisma Studio
```bash
docker-compose exec server npm run prisma:studio
# Visit http://localhost:5555
```

## 🔍 Monitoring and Debugging

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f server
docker-compose logs -f client
docker-compose logs -f db
```

### Health Status
```bash
docker-compose ps
```

### Access Container Shell
```bash
docker-compose exec server sh
docker-compose exec client sh
docker-compose exec db psql -U postgres
```

## 🔐 Security Considerations

### Production Checklist
- [ ] Change `DB_PASSWORD` to strong password
- [ ] Change `JWT_SECRET` to long random string (min 32 characters)
- [ ] Set `NODE_ENV=production`
- [ ] Use environment file instead of .env in compose
- [ ] Setup SSL/TLS termination (reverse proxy)
- [ ] Configure CORS appropriately
- [ ] Setup secrets management (Docker Secrets, Vault, etc.)
- [ ] Regular database backups
- [ ] Monitor container resource usage

### Environment File in Production
```bash
# Use --env-file instead of .env
docker-compose --env-file /etc/arc/.env up -d
```

## 🔄 Scaling

### Horizontal Scaling
Multiple server instances with load balancer:

```bash
docker-compose up -d --scale server=3
```

Configure with reverse proxy (nginx, traefik, etc.)

### Resource Limits
Edit docker-compose.yml:

```yaml
services:
  server:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

## 🐛 Troubleshooting

### Services won't start
```bash
# Check logs
docker-compose logs

# Verify ports aren't in use
netstat -tuln | grep 3000
netstat -tuln | grep 5432

# Rebuild images
docker-compose build --no-cache
```

### Database connection fails
```bash
# Verify database is running
docker-compose exec db pg_isready

# Check DATABASE_URL format
# postgresql://user:password@db:5432/database_name
```

### Frontend can't reach API
```bash
# Verify API URL in client environment
# Should be: VITE_API_URL=http://localhost:3000
# For internal: http://server:3000
```

### Permission denied errors
```bash
# Rebuild with fresh images
docker-compose build --no-cache
docker-compose down -v
docker-compose up -d
```

## 📈 Performance Optimization

### Database Optimization
- Add database indexes for frequent queries
- Regular VACUUM and ANALYZE
- Monitor slow queries

### Server Optimization
- Enable Redis caching (optional)
- Implement request rate limiting
- Use CDN for static assets

### Client Optimization
- Nginx gzip already enabled
- Asset versioning for cache busting
- Lazy load components

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)
- [Node.js Docker Best Practices](https://www.docker.com/blog/how-to-use-the-official-node-docker-image/)
- [Nginx Docker Image](https://hub.docker.com/_/nginx)

## 🤝 Support

For issues or questions:
1. Check logs: `docker-compose logs -f`
2. Verify environment variables: `docker-compose config`
3. Review this documentation
4. Check service health: `docker-compose ps`

## License

Arc is built with the deep work philosophy in mind.
