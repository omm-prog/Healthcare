# Healthcare Management System

[![Frontend](https://img.shields.io/badge/Frontend-Vercel%20Live-black?style=for-the-badge&logo=vercel)](https://healthcare-flax-beta.vercel.app/)
[![Backend](https://img.shields.io/badge/Backend-Render%20Live-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://healthcare-wjvl.onrender.com/api/docs/)
[![Database](https://img.shields.io/badge/Database-Neon%20PostgreSQL-00E599?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech)
[![Tests](https://img.shields.io/badge/Tests-44%2F44%20Passing-brightgreen?style=for-the-badge&logo=pytest)](https://docs.djangoproject.com/en/5.1/topics/testing/)

A full-stack Healthcare Management System with a Django REST API backend and a React TypeScript frontend. Supports JWT authentication, multi-tenant patient isolation, doctor directory management, and patient-doctor assignment mappings.

---

## Live Deployment

| | URL |
| :--- | :--- |
| **Frontend** | https://healthcare-flax-beta.vercel.app |
| **API Docs (Swagger)** | https://healthcare-wjvl.onrender.com/api/docs |
| **REST API Base** | https://healthcare-wjvl.onrender.com/api |

> The backend runs on Render's free tier. If it hasn't been accessed recently, the first request may take ~30 seconds to wake up.

---

## Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Backend Framework** | Django 5.2 LTS + Django REST Framework |
| **Language** | Python 3.12 |
| **Authentication** | JWT via `djangorestframework-simplejwt` |
| **API Documentation** | OpenAPI 3.0 via `drf-spectacular` |
| **Production Server** | Gunicorn + WhiteNoise |
| **Database (Production)** | Neon Serverless PostgreSQL |
| **Database (Local)** | SQLite (zero-setup) |
| **Frontend Framework** | React 19 + TypeScript |
| **Build Tool** | Vite |
| **Styling** | Tailwind CSS 3.4 |
| **HTTP Client** | Axios with JWT interceptors |
| **Frontend Hosting** | Vercel |
| **Backend Hosting** | Render |

---

## Features

- **JWT Authentication** — Register, login, and token refresh. Email-based custom user model.
- **Patient Records** — Full CRUD. Each record is automatically bound to the creating user. Other users cannot read, modify, or detect records they don't own (returns `404`, not `403`).
- **Doctor Directory** — Create, list, update, and delete doctor profiles. Accessible to all authenticated users.
- **Patient-Doctor Mappings** — Assign doctors to patients. Database-level uniqueness constraint prevents duplicate assignments.
- **OpenAPI Docs** — Full Swagger UI with Bearer token support at `/api/docs/`.
- **44 Automated Tests** — Covering authentication, patient isolation, doctor CRUD, mapping constraints, and negative cases.

---

## Project Structure

```
├── config/             # Django settings, URLs, exception handler
├── accounts/           # Custom User model, JWT auth views & serializers
├── patients/           # Patient CRUD, multi-tenant ownership
├── doctors/            # Doctor directory CRUD
├── mappings/           # Patient-Doctor assignment model and views
├── tests/              # 44 automated test cases
├── frontend/           # React + TypeScript + Vite + Tailwind dashboard
│   ├── src/
│   │   ├── api/        # Axios client + API modules
│   │   ├── context/    # AuthContext with token refresh queue
│   │   ├── pages/      # Login, Register, Dashboard, Patients, Doctors, Assignments
│   │   └── components/ # Reusable UI components
│   └── vercel.json     # SPA routing rewrites
├── postman/            # Postman collection (20+ requests with auto token extraction)
├── build.sh            # Render deployment build script
├── requirements.txt
└── .env.example
```

---

## Local Setup

### Backend

```bash
# 1. Activate virtual environment
.venv\Scripts\Activate.ps1        # Windows PowerShell
source .venv/bin/activate          # macOS / Linux

# 2. Install dependencies
pip install -r requirements.txt

# 3. Apply migrations
python manage.py migrate

# 4. Run server
python manage.py runserver
```

Backend runs at `http://127.0.0.1:8000`
- Swagger UI: http://127.0.0.1:8000/api/docs/
- Admin: http://127.0.0.1:8000/admin/

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

By default the frontend proxies API requests to `http://127.0.0.1:8000`. To use the live cloud backend instead, set:
```env
# frontend/.env
VITE_API_BASE_URL=https://healthcare-wjvl.onrender.com/api
```

---

## Running Tests

```bash
python manage.py test tests -v 2
```

```
Ran 44 tests in ~24s
OK
```

---

## Database

### Local (SQLite — default, zero setup)
```env
DB_ENGINE=django.db.backends.sqlite3
```

### Local PostgreSQL
```env
DB_ENGINE=django.db.backends.postgresql
DB_NAME=healthcare_db
DB_USER=healthcare_user
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
```

### Cloud (Neon — used in production)
```env
DATABASE_URL=postgresql://<user>:<password>@<host>/neondb?sslmode=require
```

---

## API Reference

All protected endpoints require: `Authorization: Bearer <access_token>`

### Authentication

| Method | Endpoint | Auth | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/auth/register/` | No | Register with `name`, `email`, `password` |
| `POST` | `/api/auth/login/` | No | Returns `access` and `refresh` JWT tokens |
| `POST` | `/api/auth/token/refresh/` | No | Get a new access token from a refresh token |

### Patients

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/patients/` | List patients owned by the authenticated user |
| `POST` | `/api/patients/` | Create a patient (owner is set automatically) |
| `GET` | `/api/patients/<id>/` | Retrieve an owned patient |
| `PUT / PATCH` | `/api/patients/<id>/` | Update an owned patient |
| `DELETE` | `/api/patients/<id>/` | Delete an owned patient |

### Doctors

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/doctors/` | List all doctors |
| `POST` | `/api/doctors/` | Create a doctor |
| `GET` | `/api/doctors/<id>/` | Retrieve a doctor |
| `PUT / PATCH` | `/api/doctors/<id>/` | Update a doctor |
| `DELETE` | `/api/doctors/<id>/` | Delete a doctor |

### Mappings (Patient-Doctor Assignments)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/mappings/` | List all mappings for owned patients |
| `POST` | `/api/mappings/` | Assign a doctor to an owned patient |
| `GET` | `/api/mappings/<patient_id>/` | List doctors assigned to a specific patient |
| `DELETE` | `/api/mappings/<mapping_id>/` | Remove a doctor assignment |

> `GET` and `DELETE` on `/api/mappings/<pk>/` share the same path but interpret `pk` differently — `GET` treats it as a `patient_id`, `DELETE` as a `mapping_id`.

---

## Security

- Passwords hashed with PBKDF2-SHA256. Never stored in plaintext or returned in responses.
- Patient queries are always filtered by `request.user`. A request for another user's patient returns `404`, not `403`, to avoid existence disclosure.
- The `owner` field is `read_only` — it cannot be set by the client.
- Patient-Doctor mappings enforce a database-level `UniqueConstraint` on `(patient, doctor)`.
- Custom exception handler prevents stack traces and SQL errors from leaking in API responses.

---

## Postman Collection

Import `postman/healthcare_api.postman_collection.json` into Postman.

Set the `base_url` collection variable to:
- Local: `http://127.0.0.1:8000`
- Cloud: `https://healthcare-wjvl.onrender.com`

The collection auto-captures tokens and IDs across requests and includes negative test cases (duplicate email, weak password, unauthorized access, duplicate mapping).

---

## Deployment (Cloud)

| Service | Platform | Configuration |
| :--- | :--- | :--- |
| **Backend** | Render Web Service | Build: `./build.sh` · Start: `gunicorn config.wsgi:application` |
| **Frontend** | Vercel | Root: `frontend/` · Env: `VITE_API_BASE_URL` |
| **Database** | Neon | `DATABASE_URL` env var with `sslmode=require` |

`build.sh` runs `pip install`, `collectstatic`, and `migrate` on each deploy.
