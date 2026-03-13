---
name: infrastructure-as-code-architect
description: Translates local database and cache requirements (e.g. docker-compose setup with Postgres, Redis, Elasticsearch) into production-ready Infrastructure as Code using Terraform, Pulumi, or Bicep for AWS, Azure, or GCP. Use when a user wants to deploy their application or data platform to the cloud.
---

# Infrastructure as Code Architect

Translate local development setups (like a loaded `docker-compose.yml`) into enterprise-ready, production infrastructure deployments using Terraform, Pulumi, or Bicep.

## 🎯 When to Use
- After a data platform is generated using the `business-to-data-platform` skill.
- When the user asks "How do I deploy this?" or "Can you write the Terraform for this?"
- When migrating from a local Docker environment to managed cloud services (e.g., AWS RDS, Azure Cache for Redis).
- When standing up fresh environments (staging, production).

## 🛠️ Step-by-Step Workflow

### 1. Identify Existing Requirements
1. Scan the current project for `docker-compose.yml`, `.env.example`, and package files.
2. Identify the core components:
   - Database (PostgreSQL, MySQL, etc.)
   - Cache/Message Queue (Redis, RabbitMQ)
   - Search/Analytics (Elasticsearch, OpenSearch)
   - Application Runtimes (Node.js, Python FastAPI, .NET)

### 2. Determine the Target Cloud and Tool
Ask the user if they have a preference for:
- **Cloud Provider:** AWS, Azure, or GCP?
- **Tool:** Terraform, Pulumi, or Bicep (Azure only)?

If they don't have a preference, default to **Terraform** on **AWS**.

### 3. Generate Infrastructure Code
Create the necessary IaC files (Terraform, Pulumi, or Bicep). 

**Container Mandate:**
- **Docker**: Always generate a production-ready `Dockerfile` for each application component. Implement multi-stage builds for smaller images and security scan points.
- **Kubernetes (K8s)**: For production-grade platforms, map local `docker-compose` services to **K8s Manifests** or **Helm Charts**. 

| Local Component | Managed K8s Equivalent | AWS RDS/ElastiCache Equivalent |
| :--- | :--- | :--- |
| PostgreSQL | EKS / AKS / GKE (via StatefulSet) | Amazon RDS |
| Redis | EKS / AKS / GKE | Amazon ElastiCache |
| App Container | K8s Deployment + Service | App Runner / Container Apps |

### 4. Implement CI/CD (GitHub Actions Mandate)
**MANDATORY:** Provide a complete `.github/workflows/deploy.yml` file that:
1. **Builds and Pushes Docker Images**: Uses `docker/build-push-action` to push to ECR, ACR, or GCR.
2. **Scans for Vulnerabilities**: Integrates Snyk or Trivy scans within the pipeline.
3. **Applies Infrastructure**: Automatically runs IaC plan/apply from the pipeline.
4. **Deploys to K8s**: Updates K8s deployments with the new image tag.

### 5. Infrastructure Best Practices
- **Security**: Private subnets only. No public IPs for DBs/Caches. Use Managed Identities/IAM Roles.
- **State Management**: Use remote backends (S3/Blob/GCS) with locking.
- **Observability**: Include basic monitoring/logging resources (CloudWatch, Azure Monitor).
