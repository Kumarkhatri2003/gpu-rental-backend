# 🖥️ SSH-Based GPU Resource Provisioning Backend Server

This is the backend coordination and authentication API server for the **SSH-Based GPU Resource Provisioning and Allocation System**. It is built with **Python 3.10+**, **Django 5.x**, **Django REST Framework (DRF)**, **Simple JWT** (JSON Web Tokens), and **PostgreSQL** (configured for Supabase DB).

The backend handles user authentication, host registrations, API key generation for compute host nodes, heartbeat monitoring, and administrative controls.

---

## 📋 Table of Contents

- [Prerequisites](#-prerequisites)
- [Project Architecture](#-project-architecture)
- [Local Setup & Installation](#-local-setup--installation)
  - [1. Clone and Navigate](#1-clone-and-navigate)
  - [2. Virtual Environment Setup](#2-virtual-environment-setup)
  - [3. Install Dependencies](#3-install-dependencies)
  - [4. Environment Variables Configuration](#4-environment-variables-configuration)
  - [5. Database Migrations](#5-database-migrations)
  - [6. Create a Superuser](#6-create-a-superuser)
- [Running the Server](#%EF%B8%8F-running-the-server)
- [API Documentation & Testing](#-api-documentation--testing)
  - [OpenAPI & Swagger Documentation](#openapi--swagger-documentation)
  - [Django Administration Panel](#django-administration-panel)
  - [Running Tests](#running-tests)
- [Core Endpoints Reference](#-core-endpoints-reference)

---

## 🛠️ Prerequisites

Ensure you have the following installed on your local machine:
- **Python 3.10+** (Verify with `python --version`)
- **PostgreSQL** database (or access to a remote Supabase Postgres instance)
- **Pip** (Python package installer)

---

## 🏗️ Project Architecture

Within the `server` directory:
- [**`config/`**](file:///c:/Users/DELL/Projects/SSH-Based-GPU-Resource-Provisioning-and-Allocation-System/server/config/): Standard Django configuration files including URL routing (`urls.py`) and global settings (`settings.py`).
- [**`users/`**](file:///c:/Users/DELL/Projects/SSH-Based-GPU-Resource-Provisioning-and-Allocation-System/server/users/): Core application containing authentication models, serializers, permissions, views, and business logic for Users and Host Profiles.
- [**`manage.py`**](file:///c:/Users/DELL/Projects/SSH-Based-GPU-Resource-Provisioning-and-Allocation-System/server/manage.py): Django command-line utility for administrative tasks.

---

## 🚀 Local Setup & Installation

Follow these step-by-step instructions to get the backend running locally:

### 1. Clone and Navigate
Navigate into the server directory of the project:
```bash
cd server
```

### 2. Virtual Environment Setup
It is highly recommended to use a virtual environment to manage dependencies:

- **On Windows (Command Prompt / PowerShell):**
  ```powershell
  # Create a virtual environment named 'venv' in the server directory
  python -m venv venv
  
  # Activate the virtual environment
  .\venv\Scripts\activate
  ```

- **On macOS / Linux:**
  ```bash
  # Create a virtual environment
  python3 -m venv venv
  
  # Activate the virtual environment
  source venv/bin/activate
  ```

### 3. Install Dependencies
Install all required Python packages:
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### 4. Environment Variables Configuration
1. Copy the sample environment file to create your own configuration file:
   - **Command Prompt (Windows):** `copy .env.example .env`
   - **PowerShell (Windows):** `Copy-Item .env.example .env`
   - **Bash (macOS/Linux):** `cp .env.example .env`
2. Open `.env` and fill in the required values:
   - **`SECRET_KEY`**: Set a secure key for production (a default key is provided for development).
   - **`DEBUG`**: Set to `True` for development, `False` for production.
   - **`DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`**: Configure your connection to a local PostgreSQL instance or a remote database (e.g. Supabase).
   - Configure additional Supabase Auth keys, relay ports, or timeouts as necessary.

### 5. Database Migrations
Apply the database migrations to set up the database tables:
```bash
python manage.py makemigrations
python manage.py migrate
```

### 6. Create a Superuser
To access the Django Admin panel, create an administrator user:
```bash
python manage.py createsuperuser
```
Follow the interactive prompts to provide a username/email and password.

---

## ⚡ Running the Server

Start the Django development server:
```bash
python manage.py runserver
```
The server will start running on **`http://127.0.0.1:8000/`**.

---

## 📖 API Documentation & Testing

### OpenAPI & Swagger Documentation
The server automatically generates OpenAPI 3.0 schema documentation using `drf-spectacular`. When the server is running, you can explore and test endpoints interactive at:
- **Swagger UI**: [http://127.0.0.1:8000/api/schema/swagger-ui/](http://127.0.0.1:8000/api/schema/swagger-ui/)
- **Redoc UI**: [http://127.0.0.1:8000/api/schema/redoc/](http://127.0.0.1:8000/api/schema/redoc/)
- **Raw OpenAPI Schema (JSON)**: [http://127.0.0.1:8000/api/schema/](http://127.0.0.1:8000/api/schema/)

### Django Administration Panel
Access the default administrative panel to view and modify users, host profiles, and tokens:
- **Admin Panel**: [http://127.0.0.1:8000/admin/](http://127.0.0.1:8000/admin/)

### Running Tests
To run the test suite:
```bash
python manage.py test
```

---

## 🔑 Core Endpoints Reference

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| **POST** | `/api/auth/register/` | Register a new user | No |
| **POST** | `/api/auth/login/` | Log in and receive JWT Access/Refresh tokens | No |
| **POST** | `/api/auth/logout/` | Log out and blacklist the token | Yes (JWT) |
| **POST** | `/api/auth/refresh/` | Refresh the access token | No |
| **GET** | `/api/auth/me/` | Fetch current user details | Yes (JWT) |
| **POST** | `/api/auth/change-password/` | Change the user's password | Yes (JWT) |
| **POST** | `/api/auth/forgot-password/` | Send a password reset email | No |
| **POST** | `/api/auth/reset-password/` | Reset password using token | No |
| **POST** | `/api/auth/host/api-key/` | Generate API key for a Host node | Yes (Host/Admin) |
| **POST** | `/api/auth/host/api-key/validate/` | Validate an existing Host API key | No |
| **GET/PUT/PATCH** | `/api/auth/host/profile/` | Manage Host specifications and resources | Yes (Host) |
| **POST** | `/api/auth/host/heartbeat/` | Send status heartbeat from a Host | Yes (Host) |
| **GET** | `/api/auth/host/status/` | Check active status of hosts | Yes (JWT) |
| **GET** | `/api/auth/admin/users/` | List all users (Admin only) | Yes (Admin) |
| **GET/DELETE** | `/api/auth/admin/users/<uuid>/` | Manage specific user profile (Admin only) | Yes (Admin) |
