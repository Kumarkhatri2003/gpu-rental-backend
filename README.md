# ⚡ SSH-Based GPU Resource Provisioning and Allocation System

> A production-oriented platform for **GPU resource allocation, automated provisioning, and secure SSH-based remote access**.

The **SSH-Based GPU Resource Provisioning and Allocation System** is a backend and infrastructure-focused platform designed to allow users to **rent GPU compute resources and access their assigned environments remotely through SSH**.

The system manages the complete GPU rental lifecycle — from **GPU node registration and resource discovery** to **allocation, environment provisioning, SSH authentication, monitoring, and resource cleanup**.

---

## 🎯 Problem Statement

GPU computing resources are expensive and often underutilized. Individuals and organizations may have unused GPU capacity while developers and researchers need temporary access to GPUs for machine learning, deep learning, scientific computing, and other compute-intensive workloads.

This project aims to build a system that connects these two sides by providing a controlled platform where:

* GPU providers can register and manage GPU nodes.
* Renters can discover available GPU resources.
* The system automatically allocates suitable resources.
* User environments are provisioned automatically.
* Renters receive secure SSH-based access.
* Resources are monitored throughout the rental.
* Access and resources are cleaned up when the rental ends.

---

## 🏗️ System Architecture

```text
                         ┌─────────────────────┐
                         │       RENTER        │
                         │                     │
                         │  Web / CLI / SSH    │
                         └──────────┬──────────┘
                                    │
                                    │ REST API
                                    ▼
                    ┌────────────────────────────┐
                    │       FastAPI Backend      │
                    │                            │
                    │  Authentication            │
                    │  Rental Management         │
                    │  GPU Allocation            │
                    │  Provisioning              │
                    │  SSH Key Management        │
                    │  Resource Monitoring       │
                    └──────────────┬─────────────┘
                                   │
                     ┌─────────────┴─────────────┐
                     │                           │
                     ▼                           ▼
             ┌──────────────┐          ┌─────────────────┐
             │  PostgreSQL  │          │   GPU Manager   │
             │              │          │                 │
             │ Users        │          │ Node Discovery  │
             │ GPU Nodes    │          │ Allocation      │
             │ Rentals      │          │ Provisioning    │
             │ Resources    │          │ Monitoring      │
             └──────────────┘          └────────┬────────┘
                                                │
                                     SSH / Docker / NVIDIA
                                                │
                         ┌──────────────────────┴──────────────────┐
                         │                                         │
                  ┌──────▼──────┐                           ┌──────▼──────┐
                  │   GPU Node  │                           │   GPU Node  │
                  │             │                           │             │
                  │ NVIDIA GPU  │                           │ NVIDIA GPU  │
                  │ Docker      │                           │ Docker      │
                  │ OpenSSH     │                           │ OpenSSH     │
                  └─────────────┘                           └─────────────┘
```

---

## 🔄 Core Workflow

### 1. GPU Provider Registers a Node

A provider registers a GPU machine with information such as:

```text
GPU Model
GPU Count
VRAM
CPU Cores
RAM
Storage
Operating System
Network Information
Node Status
```

### 2. System Detects GPU Resources

The platform communicates with the GPU node and collects information using NVIDIA tooling such as:

```bash
nvidia-smi
```

The system can determine:

* GPU model
* GPU memory
* GPU utilization
* GPU temperature
* Available GPUs
* Running processes
* Node health

### 3. Renter Requests a GPU

A renter selects the required resources:

```text
GPU: RTX 4090
GPU Count: 1
CPU: 8 cores
RAM: 32 GB
Storage: 100 GB
Duration: 6 hours
```

### 4. Resource Allocation

The allocation engine searches for a suitable available resource.

```text
Requested:
    1 × RTX 4090
    8 CPU cores
    32 GB RAM

             ↓

Available Nodes

Node A → RTX 3090 → unavailable
Node B → RTX 4090 → available
Node C → A100      → available

             ↓

Allocated:
Node B → GPU #0
```

### 5. Environment Provisioning

After allocation, the system prepares the renter's environment.

Provisioning may include:

```text
Create isolated environment
        ↓
Configure GPU access
        ↓
Configure CPU / RAM limits
        ↓
Configure storage
        ↓
Create SSH user
        ↓
Install SSH public key
        ↓
Start container
        ↓
Verify environment
```

### 6. SSH Access

The renter receives connection information:

```bash
ssh gpu-user@gpu-node.example.com -p 2222
```

Once connected, the renter can run GPU workloads:

```bash
nvidia-smi

python train.py

docker ps
```

### 7. Rental Expiration

When the rental expires, the system performs cleanup:

```text
Disable SSH access
        ↓
Stop environment
        ↓
Release GPU
        ↓
Remove temporary credentials
        ↓
Clean temporary resources
        ↓
Mark GPU as available
```

---

# 🔐 Security Model

Security is a core part of the system because renters execute arbitrary workloads on remote compute infrastructure.

The system is designed around:

* SSH public-key authentication
* No password-based SSH access
* User authentication and authorization
* Rental-based access control
* Isolated execution environments
* Container-based resource isolation
* Resource limits
* Controlled SSH access
* Automatic credential cleanup
* Provider/renter role separation
* API authentication using JWT

The long-term architecture is designed to minimize direct access between renters and the underlying host system.

---

# 🧩 Core Components

## Authentication & Authorization

Handles:

* User registration
* Login
* JWT authentication
* Password hashing
* Role-based access control
* Provider permissions
* Renter permissions

Example roles:

```text
ADMIN
PROVIDER
RENTER
```

---

## GPU Node Management

Responsible for:

* Registering GPU nodes
* Node health checks
* GPU discovery
* GPU status
* Resource availability
* Node heartbeat
* GPU utilization monitoring

---

## Resource Allocation Engine

Responsible for deciding **which GPU resource should be assigned to a rental request**.

Possible allocation factors:

```text
GPU model
VRAM
GPU availability
CPU availability
RAM availability
Storage availability
Node status
Rental duration
Resource utilization
```

---

## Provisioning Engine

The provisioning layer converts an allocated resource into a usable environment.

Responsibilities may include:

```text
SSH user creation
SSH key installation
Docker container creation
GPU assignment
CPU limits
Memory limits
Storage configuration
Environment variables
Container lifecycle
```

---

## Rental Management

Manages the complete rental lifecycle:

```text
PENDING
   ↓
ALLOCATED
   ↓
PROVISIONING
   ↓
ACTIVE
   ↓
EXPIRING
   ↓
COMPLETED
```

Possible failure state:

```text
PROVISIONING_FAILED
```

---

# 🗄️ Initial Data Model

A simplified database design:

```text
User
 ├── id
 ├── email
 ├── password_hash
 └── role

GPUNode
 ├── id
 ├── hostname
 ├── ip_address
 ├── status
 └── provider_id

GPU
 ├── id
 ├── node_id
 ├── model
 ├── memory
 ├── status
 └── utilization

Rental
 ├── id
 ├── renter_id
 ├── gpu_id
 ├── start_time
 ├── end_time
 └── status

SSHCredential
 ├── id
 ├── rental_id
 ├── username
 ├── public_key
 └── status
```

The data model will evolve as the scheduling, billing, monitoring, and isolation requirements become more sophisticated.

---

# 🛠️ Technology Stack

| Layer             | Technology                               |
| ----------------- | ---------------------------------------- |
| Language          | Python                                   |
| API               | FastAPI                                  |
| ORM               | SQLAlchemy / SQLModel                    |
| Database          | PostgreSQL                               |
| Authentication    | JWT                                      |
| Migrations        | Alembic                                  |
| Remote Access     | OpenSSH                                  |
| Containerization  | Docker                                   |
| GPU Management    | NVIDIA Driver / NVIDIA Container Toolkit |
| API Documentation | OpenAPI / Swagger                        |
| Testing           | Pytest                                   |
| Version Control   | Git                                      |
| Deployment        | Linux / Docker                           |

---

# 📁 Project Structure

The project is organized to keep application logic, infrastructure, and domain logic separated.

```text
ssh-gpu-resource-provisioning/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── repositories/
│   │   └── main.py
│   │
│   └── tests/
│
├── infrastructure/
│   ├── docker/
│   ├── scripts/
│   └── gpu-node/
│
├── docs/
│   ├── architecture/
│   ├── api/
│   └── decisions/
│
├── .env.example
├── .gitignore
├── docker-compose.yml
├── README.md
└── LICENSE
```

---



