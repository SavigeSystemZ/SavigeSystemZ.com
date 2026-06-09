# Postgres Production Implementation Guide

This guide walks through moving SavigeSystemZ.com from local SQLite development to production PostgreSQL hosting.

## Status

- **Current:** Local dev uses SQLite (optional) or Docker Postgres; CI runs Postgres service container
- **Schema:** `apps/web/prisma/schema.prisma` is already configured with `provider = "postgresql"`
- **Migrations:** All migrations are Postgres-native (since 2026-04-07)

## Phase 1: Local Postgres Environment (5 minutes)

If you haven't already, run Postgres locally to verify schema and migrations:

```bash
# Start Postgres container (one-off or via compose)
docker run --name ssz-pg \
  -e POSTGRES_PASSWORD=dev \
  -e POSTGRES_USER=ssz \
  -e POSTGRES_DB=savige \
  -p 5433:5432 -d postgres:16

# Verify connection
docker exec ssz-pg psql -U ssz -d savige -c "SELECT version();"

# Or use compose (persistent volume)
docker compose -f docker-compose.postgres.yml up -d
```

Configure development environment:

```bash
# Update apps/web/.env.local
cat >> apps/web/.env.local <<EOF
DATABASE_URL="postgresql://ssz:dev@127.0.0.1:5433/savige?schema=public"
EOF

# Apply migrations
cd apps/web
pnpm exec prisma migrate deploy

# Verify Prisma client
pnpm exec prisma generate

# Seed with demo data (optional)
pnpm exec prisma db seed
```

Verify locally:

```bash
# Start dev server
pnpm dev:web

# Test at http://127.0.0.1:43907
# - Click "Owner" → login (set OWNER_ACCESS_CODE and OWNER_LOGIN_SECRET first)
# - Browse applications, archive
# - Try admin flow if logged in
```

## Phase 2: Staging Postgres Setup (15 minutes)

Choose a managed Postgres provider (Neon, RDS, Supabase, etc.):

### Option A: AWS RDS

```bash
# Create security group (allow port 5432 inbound)
aws ec2 create-security-group \
  --group-name savige-db-sg \
  --description "SavigeSystemZ Postgres"

# Create DB instance
aws rds create-db-instance \
  --db-instance-identifier savige-staging \
  --db-instance-class db.t4g.micro \
  --engine postgres \
  --engine-version 16.3 \
  --master-username ssz_staging \
  --master-user-password "$(openssl rand -base64 32)" \
  --allocated-storage 20 \
  --storage-type gp3 \
  --backup-retention-period 7 \
  --enable-encryption \
  --kms-key-id "$(aws kms describe-key --key-id alias/aws/rds --query 'KeyMetadata.KeyId' --output text)" \
  --publicly-accessible false \
  --vpc-security-group-ids sg-xxxxxxxx

# Wait for instance to be ready (~10 minutes)
aws rds describe-db-instances \
  --db-instance-identifier savige-staging \
  --query 'DBInstances[0].DBInstanceStatus'
```

### Option B: Neon (simpler, no EC2 SSH):

```bash
# Create free Neon project at https://console.neon.tech
# Get connection string: postgresql://user:password@host/dbname
```

### Create app user (least privilege)

```bash
# Connect to your Postgres instance
psql postgresql://admin:password@host:5432/postgres

-- Create app user
CREATE USER ssz_app WITH PASSWORD 'long_random_password';
CREATE DATABASE savige WITH OWNER ssz_app;

-- Grant minimal permissions
GRANT CONNECT ON DATABASE savige TO ssz_app;
GRANT USAGE ON SCHEMA public TO ssz_app;
GRANT CREATE ON SCHEMA public TO ssz_app;
```

## Phase 3: Staging Deployment (20 minutes)

Set environment in secrets manager (AWS Secrets Manager, GitHub Actions secrets, HashiCorp Vault, etc.):

```bash
# Save to ~/.env.staging or secrets manager
DATABASE_URL="postgresql://ssz_app:password@host.region.rds.amazonaws.com:5432/savige?sslmode=require"
OWNER_LOGIN_SECRET="$(openssl rand -hex 32)"
VAULT_ENCRYPTION_KEY="$(openssl rand -hex 32)"
STRIPE_SECRET_KEY="sk_test_..."  # from Stripe dashboard
STRIPE_WEBHOOK_SECRET="whsec_..."
DOWNLOAD_SIGNING_SECRET="$(openssl rand -hex 32)"
AWS_S3_PRESIGN_ENABLED=1
AWS_S3_RELEASE_BUCKET=savige-releases-staging
AWS_S3_MEDIA_BUCKET=savige-media-staging
AWS_REGION=us-east-1
```

Deploy to staging:

```bash
# If using a container / CI:
# 1. Update .github/workflows/deploy-staging.yml with new DATABASE_URL
# 2. Push to staging branch
# 3. CI runs: pnpm exec prisma migrate deploy, pnpm build:web, deploy image

# If using manual SSH:
ssh deploy@staging.internal
cd /app
git pull
export $(cat .env.staging | xargs)
pnpm install --prod
cd apps/web
pnpm exec prisma migrate deploy
pnpm exec prisma db seed
cd ../..
pnpm build:web
systemctl restart savige-web
```

Verify staging:

```bash
curl -s https://staging.savigesystemz.com/api/health | jq .
curl -s https://staging.savigesystemz.com/ | grep "SavigeSystemZ" | head -1
```

## Phase 4: Production Postgres (30 minutes)

### Provision production database

```bash
# AWS RDS (or your chosen provider)
aws rds create-db-instance \
  --db-instance-identifier savige-prod \
  --db-instance-class db.t4g.small \  # upgrade from staging
  --engine postgres \
  --engine-version 16.3 \
  --master-username admin \
  --master-user-password "$(aws secretsmanager get-random-password --query SecretString --output text)" \
  --allocated-storage 100 \
  --storage-type gp3 \
  --iops 3000 \
  --backup-retention-period 30 \
  --enable-encryption \
  --storage-encrypted \
  --enable-cloudwatch-logs-exports '["postgresql"]' \
  --enable-iam-database-authentication \
  --publicly-accessible false
```

### Create production app user

```bash
# Connect as master user
psql postgresql://admin:password@prod-host/postgres

CREATE USER ssz_prod WITH PASSWORD 'very_long_random_password_32+chars';
CREATE DATABASE savige WITH OWNER ssz_prod;

-- Enable RLS and other hardening
ALTER SYSTEM SET password_encryption = 'scram-sha-256';
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements,pgaudit';

-- Apply settings
SELECT pg_reload_conf();

-- Grant minimal permissions
REVOKE ALL ON DATABASE savige FROM public;
GRANT CONNECT ON DATABASE savige TO ssz_prod;
GRANT USAGE ON SCHEMA public TO ssz_prod;
GRANT CREATE ON SCHEMA public TO ssz_prod;
```

### Run production migrations

```bash
# On a secure build machine or via CI:
export DATABASE_URL="postgresql://ssz_prod:password@prod-host:5432/savige?sslmode=require"
cd apps/web

# Always backup first!
# Your RDS instance has automated backups enabled

pnpm exec prisma migrate deploy

# Verify schema
pnpm exec prisma db execute --stdin < /dev/null  # connect test

# DO NOT seed production with demo data
# (unless you want it; seed is opt-in and usually skipped)
```

### Enable monitoring and alerting

```bash
# AWS RDS CloudWatch alarms
aws cloudwatch put-metric-alarm \
  --alarm-name savige-db-cpu \
  --alarm-description "Postgres CPU > 70%" \
  --metric-name CPUUtilization \
  --namespace AWS/RDS \
  --statistic Average \
  --period 300 \
  --threshold 70 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=DBInstanceIdentifier,Value=savige-prod

aws cloudwatch put-metric-alarm \
  --alarm-name savige-db-disk \
  --alarm-description "Postgres disk > 80%" \
  --metric-name FreeStorageSpace \
  --namespace AWS/RDS \
  --statistic Average \
  --period 300 \
  --threshold 20  # percent of total
  --comparison-operator LessThanThreshold
```

## Phase 5: Cutover (1-2 hours)

### Maintenance window

1. Announce maintenance: "Scheduled database upgrade 2:00–3:00 AM UTC"
2. Stop app servers (or set read-only mode)
3. Backup production database (RDS auto-backup + manual snapshot)
4. Verify no active connections

```bash
SELECT pid, usename, application_name, state
FROM pg_stat_activity
WHERE datname = 'savige' AND pid != pg_backend_pid();
```

### Switch app traffic

Update production app servers to point at new Postgres:

```bash
# On each prod server:
export DATABASE_URL="postgresql://ssz_prod:password@prod-host:5432/savige?sslmode=require&connect_timeout=10"

# Restart app
systemctl restart savige-web
systemctl status savige-web

# Health check
curl -f http://localhost:43907/api/health || exit 1
```

### Verify cutover

```bash
curl https://savigesystemz.com/api/health | jq .
curl https://savigesystemz.com/ | head -20
curl -X POST https://savigesystemz.com/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","subject":"Feedback","message":"Test cutover"}' | jq .
```

### Rollback plan (if needed)

```bash
# If something fails:

# 1. Revert to previous app version
docker pull myregistry/savige-web:previous
docker run ... (your previous version)

# 2. RDS has automated backups — restore from snapshot if data corruption
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier savige-prod-rollback \
  --db-snapshot-identifier savige-prod-snapshot-before-cutover

# 3. Update DNS or load balancer to point to rollback
# (your deployment depends on your infra)
```

## Phase 6: Post-Cutover Operations

### Monitor for 24 hours

```bash
# Watch logs
tail -f /var/log/savige-web/app.log

# Check query performance
psql postgresql://ssz_prod@prod-host/savige -c "SELECT query, calls, mean_exec_time FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;"

# Verify backups are running
aws rds describe-db-snapshots --db-instance-identifier savige-prod | jq '.DBSnapshots[0]'
```

### Document for future reference

1. Create runbook with:
   - Connection string (redacted)
   - Backup restore procedure
   - Failover procedure (if using multi-AZ)
   - Emergency contacts

2. Update `RUNBOOK.md` with:
   - Database maintenance schedule
   - Query slow-log analysis process
   - Disaster recovery steps

3. Enable monitoring dashboard:
   - CPU, memory, disk, connections
   - Query latency percentiles
   - Replication lag (if using read replicas)

## See Also

- `docs/DATABASE.md` — Schema and migration overview
- `docs/DB_MIGRATION_PLAN.md` — Detailed data migration strategy
- `docs/CI_POSTGRES.md` — GitHub Actions Postgres service setup
- `docs/POSTGRES_CUTOVER_CHECKLIST.md` — Quick reference checklist
- `docs/POSTGRES_LOCAL.md` — Local dev Postgres
- `docs/RUNBOOK.md` — Production operations runbook
