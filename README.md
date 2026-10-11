# Healthcare Management System — Full-Stack Clinical Portal

[![Frontend on Vercel](https://img.shields.io/badge/Frontend-Vercel%20Live-black?style=for-the-badge&logo=vercel)](https://healthcare-flax-beta.vercel.app/)
[![Backend on Render](https://img.shields.io/badge/Backend-Render%20Live-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://healthcare-wjvl.onrender.com/api/docs/)
[![Database Neon](https://img.shields.io/badge/Database-Neon%20PostgreSQL-00E599?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Django](https://img.shields.io/badge/Django-5.2%20LTS-092E20?style=for-the-badge&logo=django&logoColor=white)](https://www.djangoproject.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/Tests-44%2F44%20Passing-brightgreen?style=for-the-badge&logo=pytest)](https://docs.djangoproject.com/en/5.1/topics/testing/)

A production-grade, secure, and fully tested Healthcare Management System featuring:
1. **Django REST Framework Backend**: Python 3.12, Django 5.2 LTS, Neon Serverless PostgreSQL / SQLite, stateless JWT Authentication (`djangorestframework-simplejwt`), Gunicorn, WhiteNoise, and OpenAPI 3.0 (`drf-spectacular`).
2. **Modern React Clinical Dashboard**: React 19, TypeScript, Vite, Tailwind CSS, and React Router, delivering a responsive interface for managing patients, certified doctors, and clinical assignment mappings.
3. **Multi-Tenant Data Isolation**: Strict user-level isolation on patient records with anti-enumeration protection and database-level unique relational constraints.

---

## 🌐 Live Production Deployments

The full-stack application is deployed live on cloud infrastructure and ready for immediate evaluation:

| Service | Hosting Platform | Live URL | Description |
| :--- | :--- | :--- | :--- |
| **Frontend Web App** | **Vercel** | [https://healthcare-flax-beta.vercel.app/](https://healthcare-flax-beta.vercel.app/) | Complete React clinical dashboard (Auth, Patients, Doctors, Mappings) |
| **Interactive API Docs** | **Render** | [https://healthcare-wjvl.onrender.com/api/docs/](https://healthcare-wjvl.onrender.com/api/docs/) | OpenAPI 3.0 / Swagger UI to test every REST API directly in browser |
| **Backend REST API** | **Render** | [https://healthcare-wjvl.onrender.com/api/](https://healthcare-wjvl.onrender.com/api/) | Live Django API served via Gunicorn and WhiteNoise |
| **Production Database** | **Neon** | Serverless PostgreSQL (`AWS us-east-2`) | Managed PostgreSQL with connection pooling & SSL enforcement |

> **Note on Cold Starts**: Render's free tier spins down the backend web service after 15 minutes of inactivity. If the first page load takes ~30 seconds, the backend container is spinning up. Subsequent requests respond instantly.

---

## Quick Evaluation Guide (For Reviewers)

| Evaluation Method | Command / URL | What It Verifies |
| :--- | :--- | :--- |
| **1. Live Web Portal** | [https://healthcare-flax-beta.vercel.app/](https://healthcare-flax-beta.vercel.app/) | Test live registration, login, patient isolation, doctor directory, and assignments. |
| **2. Live Swagger API** | [https://healthcare-wjvl.onrender.com/api/docs/](https://healthcare-wjvl.onrender.com/api/docs/) | Test all endpoints interactively with Bearer JWT tokens in browser. |
| **3. Automated Test Suite** | `python manage.py test tests -v 2` | Executes all **44 test cases** (auth, tenancy isolation, doctor CRUD, relational constraints). **100% PASS**. |
| **4. Local React Portal** | `cd frontend && npm run dev` &rarr; [http://localhost:5173/](http://localhost:5173/) | Run the local Vite dev server (connected to either local or cloud backend). |
| **5. Postman Collection** | Import `postman/healthcare_api.postman_collection.json` | 20+ automated API test requests with auto-token extraction and negative test scenarios. |
| **6. Django Admin Panel** | [http://127.0.0.1:8000/admin/](http://127.0.0.1:8000/admin/) or [https://healthcare-wjvl.onrender.com/admin/](https://healthcare-wjvl.onrender.com/admin/) | Visual database browser with search, filters, and relationship inspection. |

---

## Table of Contents

1. [Live Production Deployments](#-live-production-deployments)
2. [Quick Evaluation Guide](#quick-evaluation-guide-for-reviewers)
3. [System Architecture](#system-architecture)
4. [Key Features](#key-features)
5. [Technology Stack](#technology-stack)
6. [Project Directory Structure](#project-directory-structure)
7. [Cloud Deployment Architecture](#cloud-deployment-architecture)
8. [Local Backend Setup & Execution](#local-backend-setup--execution)
9. [Local Frontend Setup & Execution](#local-frontend-setup--execution)
10. [Database Configuration (Neon Postgres & SQLite)](#database-configuration-neon-postgres--sqlite)
11. [Comprehensive Verification & Test Report](#comprehensive-verification--test-report)
12. [API Endpoint Reference](#api-endpoint-reference)
13. [Route Architecture & Disambiguation](#route-architecture--disambiguation)
14. [Security & Isolation Architecture](#security--isolation-architecture)
15. [Postman Collection Instructions](#postman-collection-instructions)
16. [Troubleshooting Guide](#troubleshooting-guide)

---

## System Architecture

```text
               ┌────────────────────────────────────────────────────────┐
               │              React 19 Clinical Frontend                │
               │            (Hosted on Vercel Global CDN)              │
               │       https://healthcare-flax-beta.vercel.app/         │
               └──────────────────────────┬─────────────────────────────┘
                                          │  HTTPS / JWT Authorization
                                          ▼
               ┌────────────────────────────────────────────────────────┐
               │           Django REST Framework API Backend            │
               │         (Hosted on Render Cloud Web Service)           │
               │         https://healthcare-wjvl.onrender.com/          │
               │                                                        │
               │  ┌───────────────┐ ┌────────────────┐ ┌─────────────┐  │
               │  │ accounts/     │ │ patients/      │ │ doctors/    │  │
               │  │ Custom User & │ │ Tenant-Isolated│ │ Directory & │  │
               │  │ JWT Lifecycle │ │ Patient CRUD   │ │ Specialisms │  │
               │  └───────────────┘ └────────────────┘ └─────────────┘  │
               │  ┌──────────────────────────────────────────────────┐  │
               │  │ mappings/  Atomic Patient-Doctor Relationships   │  │
               │  └──────────────────────────────────────────────────┘  │
               │  ┌──────────────────────────────────────────────────┐  │
               │  │ WhiteNoise (Static Assets) & OpenAPI/Swagger UI │  │
               │  └──────────────────────────────────────────────────┘  │
               └──────────────────────────┬─────────────────────────────┘
                                          │  Encrypted TLS / SSL
                                          ▼
               ┌────────────────────────────────────────────────────────┐
               │           Neon Serverless PostgreSQL Database          │
               │          (AWS us-east-2 with Pooled Connections)       │
               └────────────────────────────────────────────────────────┘
```

---

## Key Features

### Backend Architecture
- **Custom Email-Based User Model**: Uses `email` as the unique `USERNAME_FIELD` rather than legacy usernames, utilizing Django's PBKDF2 password hashing.
- **Stateless JWT Authentication**: Access and refresh token lifecycle management via `djangorestframework-simplejwt` with automated token refresh.
- **Multi-Tenant Patient Isolation**: Patient records are automatically bound to the authenticated user (`owner`). All queries strictly filter by caller, returning HTTP `404 Not Found` for records owned by other users (preventing ID enumeration).
- **Certified Doctor Directory**: Authenticated users can list, create, view, update, and delete doctor profiles.
- **Atomic Doctor-Patient Assignments**: Associates doctors with patients with database-level uniqueness constraints (`UniqueConstraint(fields=['patient', 'doctor'])`) and validation preventing duplicate assignments.
- **Auto-Generated OpenAPI 3.0 Docs**: Interactive Swagger UI with Bearer JWT integration via `drf-spectacular`.
- **CORS Support**: Integrated `django-cors-headers` with automatic whitespace sanitization supporting local development and production Vercel domains.
- **Production Asset Serving**: `whitenoise` compression and caching for serving static files without requiring third-party storage.

### Frontend Dashboard Features
- **Clean Clinical UI**: Professional light theme with subtle slate backgrounds and sky/teal medical accents.
- **Authentication**: Registration and login with show/hide password toggle and automated JWT token refresh queue with Axios interceptors.
- **Dashboard Overview**: Real-time metrics calculated from actual backend queries (total patients, doctors, assignments, and recent activity).
- **Patient Management**: Patient directory, instant search, detail drawer, registration modal, and edit/delete actions with confirmation dialogs.
- **Doctor Directory**: Searchable list of doctors and medical specializations with full CRUD modals.
- **Patient–Doctor Mapping Manager**: View assigned doctors for specific patients, create atomic assignments, and remove assignments.
- **SPA Client-Side Routing**: Configured with `vercel.json` rewrite rules to prevent 404 errors on deep route reloads.

---

## Technology Stack

| Layer | Component | Technology | Version |
| :--- | :--- | :--- | :--- |
| **Backend** | Language | Python | 3.10+ / 3.12+ |
| | Web Framework | Django | 5.2 LTS |
| | API Framework | Django REST Framework (DRF) | 3.15+ |
| | Production Server | Gunicorn | 23.0+ |
| | Static File Server | WhiteNoise | 6.12+ |
| | Production DB | Neon Serverless PostgreSQL | 16+ |
| | Local DB Engine | SQLite (Zero-Setup) / PostgreSQL | 3.x / 14+ |
| | Authentication | Simple JWT (`djangorestframework-simplejwt`) | 5.4+ |
| | Documentation | OpenAPI 3.0 / `drf-spectacular` | 0.28+ |
| | CORS Management | `django-cors-headers` | 4.9+ |
| **Frontend** | Framework | React | 19.0+ |
| | Language | TypeScript | 5.x / 6.x |
| | Build Tool & Bundler | Vite | 6.x / 8.x |
| | Styling | Tailwind CSS | 3.4+ |
| | Routing | React Router (`react-router-dom`) | 7.x |
| | HTTP Client | Axios (with JWT interceptors) | 1.7+ |
| | Icons | Lucide React | Latest |
| **Deployment** | Backend Host | Render (Web Service) | Free Tier |
| | Frontend Host | Vercel (Global Edge Network) | Free Tier |
| | Database Host | Neon.tech (Managed Postgres) | Free Tier |

---

## Project Directory Structure

```text
healthcare-backend/
├── config/                      # Django core configuration & settings
│   ├── settings.py              # Environment settings, CORS, REST Framework, JWT, WhiteNoise
│   ├── urls.py                  # Root URL routing, Swagger UI, app inclusion
│   ├── exceptions.py            # Centralized exception handler
│   ├── asgi.py & wsgi.py
│├── accounts/                    # Custom User model & JWT authentication
│   ├── models.py                # User with email as unique USERNAME_FIELD
│   ├── managers.py              # CustomUserManager with email normalization
│   ├── serializers.py           # Registration, login, and user summary serializers
│   ├── views.py                 # Registration, login, and token refresh views
│   ├── admin.py                 # Django admin registration
│   └── urls.py
├── patients/                    # Patient records & multi-tenant isolation
│   ├── models.py                # Patient model with composite indexes
│   ├── serializers.py           # PatientSerializer with ownership protection
│   ├── views.py                 # Patient CRUD views with user-filtered querysets
│   ├── admin.py                 # Django admin registration
│   └── urls.py
├── doctors/                     # Doctor directory management
│   ├── models.py                # Doctor model
│   ├── serializers.py           # DoctorSerializer with field validation
│   ├── views.py                 # Doctor CRUD views
│   ├── admin.py                 # Django admin registration
│   └── urls.py
├── mappings/                    # Patient-Doctor relationships
│   ├── models.py                # PatientDoctor with database UniqueConstraint
│   ├── serializers.py           # Mapping serializers with duplicate validation
│   ├── views.py                 # Disambiguated GET (<patient_id>) & DELETE (<mapping_id>)
│   ├── admin.py                 # Django admin registration
│   └── urls.py
├── tests/                       # Automated test suite (44 test cases)
│   ├── test_auth.py             # Authentication & JWT test cases
│   ├── test_patients.py         # Patient isolation & CRUD test cases
│   ├── test_doctors.py          # Doctor CRUD test cases
│   └── test_mappings.py         # Mapping assignment & constraint test cases
├── frontend/                    # Complete React + Vite + TypeScript dashboard
│   ├── src/
│   │   ├── api/                 # Centralized Axios client, auth, patients, doctors, mappings
│   │   ├── components/          # UI components (Button, Modal, Input, Badge, etc.) & Layout
│   │   ├── context/             # AuthContext with token refresh and session restore
│   │   ├── pages/               # Login, Register, Dashboard, Patients, Doctors, Assignments
│   │   ├── types/               # TypeScript interfaces
│   │   ├── App.tsx & main.tsx
│   │   └── index.css            # Tailwind directives
│   ├── vercel.json              # Client-side SPA routing rewrites for Vercel
│   ├── package.json
│   ├── vite.config.ts           # Reverse proxy (/api -> :8000)
│   └── README.md
├── postman/
│   └── healthcare_api.postman_collection.json # Exportable Postman collection
├── build.sh                     # Render deployment build script (install, collectstatic, migrate)
├── manage.py
├── requirements.txt
├── .env & .env.example
├── db.sqlite3                   # Out-of-the-box local SQLite database
└── README.md
```

---

## Cloud Deployment Architecture

The application is deployed across three services to maintain high availability and zero hosting costs:

### 1. Backend on Render (`healthcare-wjvl.onrender.com`)
- **Runtime**: Python 3.12 with Gunicorn WSGI.
- **Build Command**: `./build.sh` (executes dependency installation, `collectstatic`, and database migrations).
- **Static Assets**: Handled by WhiteNoise (`CompressedManifestStaticFilesStorage`).
- **Environment Configuration**:
  - `DEBUG=False`
  - `ALLOWED_HOSTS=.onrender.com,localhost,127.0.0.1`
  - `DATABASE_URL=postgresql://neondb_owner:***@ep-nameless-violet-b50zglon-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require`
  - `CORS_ALLOWED_ORIGINS=https://healthcare-flax-beta.vercel.app,http://localhost:5173,http://localhost:3000`

### 2. Frontend on Vercel (`healthcare-flax-beta.vercel.app`)
- **Framework**: Vite + React 19 + TypeScript.
- **Routing**: `vercel.json` rewrites all requests to `/index.html` to prevent 404 errors on deep linking.
- **Environment Configuration**:
  - `VITE_API_BASE_URL=https://healthcare-wjvl.onrender.com/api`

### 3. Database on Neon (`neon.tech`)
- **Engine**: Managed PostgreSQL 16 (AWS `us-east-2`).
- **Connection Mode**: Pooled endpoint with SSL requirement to manage concurrency smoothly without dropping connections.

---

## Local Backend Setup & Execution

### 1. Activate the Virtual Environment

```bash
# On Windows PowerShell:
.venv\Scripts\Activate.ps1

# On Windows Command Prompt (CMD):
.venv\Scripts\activate.bat

# On Linux/macOS:
source .venv/bin/activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Apply Database Migrations
```bash
python manage.py migrate
```

### 4. Run the Automated Test Suite (Verify 100% Integrity)
```bash
python manage.py test tests -v 2
```
Expected output:
```text
Ran 44 tests in ~24s
OK
```

### 5. Start the Development Server
```bash
python manage.py runserver
```
The backend API will be available at:
👉 **`http://127.0.0.1:8000/`**
- **Swagger UI Interactive Interface**: [http://127.0.0.1:8000/api/docs/](http://127.0.0.1:8000/api/docs/)
- **Django Admin Interface**: [http://127.0.0.1:8000/admin/](http://127.0.0.1:8000/admin/)

---

## Local Frontend Setup & Execution

The frontend is located in the `frontend/` folder.

### 1. Open a new terminal and navigate to `frontend/`:
```bash
cd frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Vite Development Server
```bash
npm run dev
```

The portal will be available at:  
👉 **`http://localhost:5173/`**

### 4. Build for Production (TypeScript Type-Check)
```bash
npm run build
```
Generates a fully typed, minified production bundle in `frontend/dist/`.

---

## Database Configuration (Neon Postgres & SQLite)

The backend seamlessly supports Neon Cloud PostgreSQL, local PostgreSQL, and zero-setup SQLite.

### Option A: Neon Cloud PostgreSQL (Production)
In your cloud dashboard or `.env`:
```env
DATABASE_URL=postgresql://neondb_owner:***@ep-nameless-violet-b50zglon-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require
```

### Option B: Local SQLite (Zero-Setup Default)
In `.env`:
```env
DB_ENGINE=django.db.backends.sqlite3
USE_SQLITE_FOR_TESTS=True
```
No external database software or configuration is required. All data is saved directly in `db.sqlite3`.

### Option C: Local PostgreSQL
```env
DB_ENGINE=django.db.backends.postgresql
DB_NAME=healthcare_db
DB_USER=healthcare_user
DB_PASSWORD=secure_password_here
DB_HOST=localhost
DB_PORT=5432
```

---

## Comprehensive Verification & Test Report

All system capabilities were rigorously tested across two test suites:
1. **Django Automated Test Suite**: 44 test cases covering models, serializers, views, permissions, and database constraints.
2. **Live HTTP API Verification**: 24 end-to-end integration requests executed against the active HTTP server.

**Result: 68 / 68 CHECKS PASSED (100% SUCCESS)**

### Summary Table

| Category | Tests | Status | Key Verifications |
| :--- | :---: | :---: | :--- |
| **Authentication & JWT** | 11 | **PASS** | Email uniqueness, case normalization, password validation, token refresh, unauthenticated blocks. |
| **Patient Isolation** | 12 | **PASS** | Automatic ownership binding, owner-only list queries, cross-user isolation (`404 Not Found`), client-spoof protection. |
| **Doctor Directory** | 8 | **PASS** | Full CRUD, mandatory field validations, unauthenticated access prevention. |
| **Patient-Doctor Mapping** | 13 | **PASS** | Relational assignments, duplicate assignment rejection, database `UniqueConstraint`, route disambiguation. |
| **Live HTTP Integration** | 24 | **PASS** | Real client requests for registration, login, doctor CRUD, patient CRUD, mapping, and removal. |
| **Total** | **68** | **100% PASS** | Zero errors, zero failures. |

---

## API Endpoint Reference

All protected endpoints require the HTTP Authorization header:
```http
Authorization: Bearer <your_jwt_access_token>
```

### 1. Authentication Endpoints

| Method | Endpoint | Description | Auth Required | Expected Status |
| :--- | :--- | :--- | :---: | :--- |
| `POST` | `/api/auth/register/` | Register new user account (`name`, `email`, `password`) | No | `201 Created` / `400 Bad Request` |
| `POST` | `/api/auth/login/` | Authenticate with credentials and receive JWT tokens | No | `200 OK` / `400 Bad Request` |
| `POST` | `/api/auth/token/refresh/` | Obtain a new access token using a valid refresh token | No | `200 OK` / `401 Unauthorized` |

#### Registration Payload Example (`POST /api/auth/register/`)
```json
{
  "name": "Dr. Sarah Connor",
  "email": "sarah.connor@hospital.org",
  "password": "StrongPassword123!"
}
```

#### Login Response Example (`POST /api/auth/login/`)
```json
{
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Dr. Sarah Connor",
    "email": "sarah.connor@hospital.org"
  }
}
```

---

### 2. Patient Management Endpoints

| Method | Endpoint | Description | Auth Required | Expected Status |
| :--- | :--- | :--- | :---: | :--- |
| `POST` | `/api/patients/` | Create a patient (caller becomes owner automatically) | Yes | `201 Created` / `400 Bad Request` |
| `GET` | `/api/patients/` | List all patient records owned by the authenticated user | Yes | `200 OK` |
| `GET` | `/api/patients/<id>/` | Retrieve owned patient record by ID | Yes | `200 OK` / `404 Not Found` |
| `PUT` | `/api/patients/<id>/` | Completely update owned patient record | Yes | `200 OK` / `404 Not Found` |
| `PATCH` | `/api/patients/<id>/` | Partially update owned patient record | Yes | `200 OK` / `404 Not Found` |
| `DELETE` | `/api/patients/<id>/` | Delete owned patient record | Yes | `204 No Content` / `404 Not Found` |

#### Patient Creation Payload Example (`POST /api/patients/`)
```json
{
  "name": "John Doe",
  "age": 42,
  "gender": "Male",
  "email": "john.doe@example.com",
  "phone": "+1-555-0144",
  "address": "452 Elm Street, Springfield"
}
```

---

### 3. Doctor Management Endpoints

| Method | Endpoint | Description | Auth Required | Expected Status |
| :--- | :--- | :--- | :---: | :--- |
| `POST` | `/api/doctors/` | Create doctor profile in directory | Yes | `201 Created` / `400 Bad Request` |
| `GET` | `/api/doctors/` | List all doctors in directory | Yes | `200 OK` |
| `GET` | `/api/doctors/<id>/` | Retrieve doctor details by ID | Yes | `200 OK` / `404 Not Found` |
| `PUT` | `/api/doctors/<id>/` | Completely update doctor profile | Yes | `200 OK` / `404 Not Found` |
| `PATCH` | `/api/doctors/<id>/` | Partially update doctor profile | Yes | `200 OK` / `404 Not Found` |
| `DELETE` | `/api/doctors/<id>/` | Delete doctor profile | Yes | `204 No Content` / `404 Not Found` |

#### Doctor Creation Payload Example (`POST /api/doctors/`)
```json
{
  "name": "Gregory House",
  "specialization": "Diagnostic Medicine",
  "email": "house@hospital.org",
  "phone": "+1-555-0988",
  "clinic_address": "Diagnostic Department, Suite 400"
}
```

---

### 4. Patient–Doctor Mapping Endpoints

| Method | Endpoint | Description | Auth Required | Expected Status |
| :--- | :--- | :--- | :---: | :--- |
| `POST` | `/api/mappings/` | Assign doctor to owned patient | Yes | `201 Created` / `400 Bad Request` |
| `GET` | `/api/mappings/` | List all mappings for owned patients | Yes | `200 OK` |
| `GET` | `/api/mappings/<patient_id>/` | List all doctors assigned to a specific owned patient | Yes | `200 OK` / `404 Not Found` |
| `DELETE` | `/api/mappings/<mapping_id>/` | Remove doctor assignment by mapping ID | Yes | `204 No Content` / `404 Not Found` |

#### Assignment Payload Example (`POST /api/mappings/`)
```json
{
  "patient": 1,
  "doctor": 1
}
```

---

## Route Architecture & Disambiguation

The requirements specify:
- `GET /api/mappings/<patient_id>/` to list doctors assigned to a specific owned patient.
- `DELETE /api/mappings/<id>/` to remove a doctor assignment by its mapping record ID.

### Architectural Solution
Both operations share the path pattern `/api/mappings/<int:pk>/`. To prevent collision and ensure semantic correctness:
1. **`GET /api/mappings/<pk>/` treats `pk` as `patient_id`**: The view verifies that the patient exists and belongs to `request.user`. If valid, it returns the doctors assigned to that patient; if the patient belongs to another user or does not exist, it returns `404 Not Found`.
2. **`DELETE /api/mappings/<pk>/` treats `pk` as `mapping_id`**: The view resolves the mapping restricted strictly to `patient__owner=request.user`. If found, it deletes the assignment and returns `204 No Content`; otherwise, it returns `404 Not Found`.

---

## Security & Isolation Architecture

1. **Email-Based Custom User Model**: Does not rely on legacy usernames; enforces case-insensitive email uniqueness.
2. **PBKDF2 Password Hashing**: Passwords are never stored in plaintext and never exposed in responses.
3. **Multi-Tenant Ownership Isolation**: All patient endpoints filter queries strictly by `request.user`. Attempting to access another user's patient returns `404 Not Found` rather than `403 Forbidden`, preventing resource existence disclosure.
4. **Client-Supplied Ownership Protection**: The `owner` field on `Patient` cannot be supplied or manipulated by the client (`read_only=True`). The backend assigns `request.user` automatically.
5. **Database-Level Integrity Constraints**: Patient-Doctor mappings enforce `UniqueConstraint(fields=['patient', 'doctor'])` to guarantee uniqueness even under concurrent race conditions.
6. **Stateless JWT Protection**: Authorization tokens are validated per-request without server-side session overhead.
7. **Error Masking Handler**: Unhandled exceptions and database integrity errors are intercepted by `custom_exception_handler` to prevent leaking SQL structures or stack traces to clients.

---

## Postman Collection Instructions

An exportable Postman collection is located at:
📁 **`postman/healthcare_api.postman_collection.json`**

### Import Instructions
1. Open **Postman** and click **Import** (top left).
2. Select the file `postman/healthcare_api.postman_collection.json`.
3. Set the collection variable `base_url` to:
   - For local: `http://127.0.0.1:8000`
   - For live cloud: `https://healthcare-wjvl.onrender.com`

### Automated Execution Sequence
The collection contains built-in test scripts that automatically capture tokens and IDs:
1. **1.1 Register User**: Creates a new user account.
2. **1.4 Login**: Automatically captures `access` and `refresh` tokens into collection variables.
3. **2.1 Create Patient**: Extracts `patient_id`.
4. **3.1 Create Doctor**: Extracts `doctor_id`.
5. **4.1 Assign Doctor to Patient**: Associates doctor with patient and extracts `mapping_id`.
6. **4.4 List Doctors for Patient**: Validates `GET /api/mappings/{{patient_id}}/`.
7. **4.5 Remove Doctor Assignment**: Validates `DELETE /api/mappings/{{mapping_id}}/`.
8. **Negative Test Cases**: Tests duplicate registration, short password, unauthorized access, negative age, and duplicate mapping rejection.

---

## Troubleshooting Guide

### 1. `ModuleNotFoundError: No module named 'django'`
Ensure you have activated the virtual environment before running commands:
```powershell
.venv\Scripts\Activate.ps1
```

### 2. Frontend Displays Network Error
Verify that the backend is active. If running locally, verify:
```powershell
python manage.py runserver
```
If connecting to the cloud backend, verify `VITE_API_BASE_URL` in `frontend/.env` is set to `https://healthcare-wjvl.onrender.com/api`.

### 3. Render Web Service Cold Start Delay
On the free Render tier, the web service spins down after 15 minutes of inactivity. When accessed again, the first request takes ~30 seconds to wake the service up.

---

## Submission Checklist

- [x] **Live Frontend Web App** deployed on Vercel: [https://healthcare-flax-beta.vercel.app/](https://healthcare-flax-beta.vercel.app/)
- [x] **Live Interactive Swagger Docs** deployed on Render: [https://healthcare-wjvl.onrender.com/api/docs/](https://healthcare-wjvl.onrender.com/api/docs/)
- [x] **Live Managed PostgreSQL Database** configured with Neon.
- [x] Django REST Framework backend with Gunicorn and WhiteNoise.
- [x] Custom User model with email authentication & PBKDF2 hashing.
- [x] Simple JWT authentication lifecycle (Register, Login, Refresh).
- [x] Multi-tenant patient record isolation (ownership enforcement).
- [x] Doctor management directory.
- [x] Patient-Doctor mapping with duplicate prevention (`UniqueConstraint`).
- [x] Route disambiguation for `/api/mappings/<pk>/` (GET `patient_id` vs DELETE `mapping_id`).
- [x] OpenAPI 3.0 / Swagger UI documentation at `/api/docs/`.
- [x] Automated test suite with **44/44 test cases passing**.
- [x] Complete React + TypeScript + Vite + Tailwind CSS frontend dashboard.
- [x] SPA client-side routing with `vercel.json`.
- [x] Postman collection included and documented.
- [x] Comprehensive setup guide for both local execution and cloud deployment.
