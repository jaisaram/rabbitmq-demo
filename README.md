# 🚀 Scale System: High-Performance Multi-Tenant Microservices

Scale System is a premium, enterprise-grade administrative platform built for massive scalability, high-velocity data ingestion, and multi-tenant isolation. It leverages a modern microservices architecture to provide a seamless, branded experience for Super Admins and Tenants alike.

---

## 🏗️ System Architecture

The system is designed with a **decentralized microservices architecture**, ensuring that specialized workloads like authentication, user profile management, and high-scale batch processing are isolated and independently scalable.

### 🛰️ Service Topology
- **API Gateway**: The central nerve center. It handles SSL termination, JWT validation, and high-performance request routing via **gRPC**.
- **Auth Microservice**: Manages the platform's multi-tenant core, identity verification, and Role-Based Access Control (RBAC).
- **Users Microservice**: Stores organizational hierarchies and detailed user metadata, isolated from the core authentication engine.
- **Batch Microservice**: A high-scale ingestion engine capable of processing **1,000,000+ records** asynchronously using RabbitMQ workers and Redis atomic progress tracking.
- **Notifications Microservice**: Dispatches asynchronous organizational broadcasts.
- **Logs Microservice**: Orchestrates platform-wide observability and audit trails.

### 🔌 Communication Protocol
- **Internal**: High-speed binary communication using **gRPC** (Protobuf).
- **Asynchronous**: Robust message queuing via **RabbitMQ** for decoupling long-running jobs.
- **Caching**: Distributed, millisecond-fast caching and atomic state management using **Redis**.

---

## 📂 Database Structure

The system employs a **Hybrid Multi-Tenancy Strategy** for maximum stability and data integrity.

### 💾 Data Partitioning
1. **Infrastructure Isolation**: Each microservice manages its own dedicated PostgreSQL database, enforcing strict bounded contexts.
2. **Logical Multi-Tenancy**: Tenant-specific data is isolated within shared tables using globally unique `tenantId` (UUID) discriminators.

### 🗺️ Principal Entities
- **SystemAdmin**: Global entities with system-wide privileges, residing in the master Auth database.
- **Tenant (Organization)**: Contains metadata, slugs (vanity URLs), and custom branding settings.
- **User Identity**: A global unique record mapping emails to specific tenant contexts.
- **User Profile**: Extended metadata (names, avatars) stored separately to optimize query performance.

---

## ✨ Core Features

### 🏢 Multi-Tenant Management
- **Branded Dashboards**: Real-time dashboards for Tenants with organization-specific metrics.
- **Custom Vanity URLs**: Support for unique organization slugs (e.g., `app.scalesystem.com/acme-corp`).

### 🛡️ Enterprise Security
- **Role-Based Access Control (RBAC)**: Fine-grained permissions (SUPER_ADMIN, ADMIN, USER).
- **Secure Auth Flow**: JWT-based session management with strict cross-tenant isolation and correlation tracking.

### 🚀 High-Scale Batch Engine (10Lac+ Records)
- **High-Performance Ingestion**: Optimized for uploading and processing 1M+ records without system slowness.
- **Atomic Progress Tracking**: Real-time percentage tracking using Redis `HINCRBY`.
- **Distributed Processing**: Automatic workload distribution across RabbitMQ consumer clusters.

### 🎨 Premium User Experience
- **Vibrant Glassy UI**: Modern, state-of-the-art aesthetic using `backdrop-blur-2xl` and custom translucent color palettes.
- **Full-Width Workspace**: Expansive, optimized layout for data-intensive administrative tasks.

---

## 🛠️ Technology Stack

- **Backend**: NestJS (Node.js), TypeScript, gRPC, RabbitMQ, PostgreSQL, TypeORM, Redis.
- **Frontend**: Next.js 15+, Tailwind CSS, Lucide Icons.
- **Infrastructure**: Docker Compose, Microservice Watch Mode.

---

## 🚀 Quick Start (Development)

### 1. Prerequisites
- **PostgreSQL**: Running on port `5432`.
- **RabbitMQ**: Running on port `5672`.
- **Redis**: Running via Docker on port `6379`.

### 2. Infrastructure Setup
```bash
# Start Redis and other essential infrastructure
docker compose -f docker-compose.dev.yml up -d
```

### 3. Service Initialization
Run the following in separate terminal instances within the `backend` directory:
```bash
npm run start:dev gateway
npm run start:dev auth
npm run start:dev users
npm run start:dev batch
npm run start:dev notifications
npm run start:dev logs
```

### 4. Frontend Launch
```bash
cd frontend
npm run dev
```

---

## 📜 Proprietary Notice
© 2026 Scale System. All Rights Reserved. This software is proprietary and confidential. Unauthorized copying, modification, or distribution is strictly prohibited.
