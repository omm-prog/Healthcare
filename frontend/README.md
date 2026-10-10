# CarePulse — Healthcare Management Frontend UI

A modern, production-grade clinical administration dashboard built with **React 18/19**, **TypeScript**, **Vite**, **Tailwind CSS**, **React Router**, **Axios**, and **Lucide React**.

This frontend integrates seamlessly with the existing Django REST Framework backend, supporting JWT authentication, multi-tenant patient record isolation, doctor directories, and patient-doctor relationship mapping.

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Technology Stack](#technology-stack)
3. [Quick Start & Development Setup](#quick-start--development-setup)
4. [Environment Variables](#environment-variables)
5. [Backend URL & CORS Configuration](#backend-url--cors-configuration)
6. [Application Architecture & Routes](#application-architecture--routes)
7. [Features & Workflow Guide](#features--workflow-guide)
8. [Common API Integration Troubleshooting](#common-api-integration-troubleshooting)

---

## 1. Prerequisites

- **Node.js**: `v18.0.0` or higher (`v20.x` or `v22.x` recommended).
- **npm**: `v9.0.0` or higher (tested with `npm 11.7.0`).
- **Running Backend**: The Django REST API must be running on `http://127.0.0.1:8000`.

---

## 2. Technology Stack

- **Framework**: React with Vite & TypeScript
- **Styling**: Tailwind CSS with custom medical theme tokens
- **Routing**: React Router (`react-router-dom`)
- **HTTP Client**: Axios with automatic JWT Bearer interceptor & refresh token queue
- **Icons**: Lucide React
- **Form Handling**: Accessible inputs with validation and error formatting

---

## 3. Quick Start & Development Setup

### 1. Navigate to the frontend directory
```bash
cd frontend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Copy `.env.example` to `.env`:
```bash
# On Windows PowerShell:
Copy-Item .env.example .env

# On Linux/macOS:
cp .env.example .env
```

### 4. Start the development server
```bash
npm run dev
```

The frontend will start at:  
👉 **`http://localhost:5173/`**

### 5. Production Build & TypeScript Verification
```bash
npm run build
```
Generates a minified production bundle in `dist/` with full type safety.

---

## 4. Environment Variables

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `/api` | Base path for API calls. Using `/api` proxies requests through Vite to `http://127.0.0.1:8000/api` without cross-origin complications. |

To connect directly cross-origin, set:
```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

---

## 5. Backend URL & CORS Configuration

### Vite Reverse Proxy (Recommended for local dev)
In `vite.config.ts`, Vite proxies `/api` requests directly to `http://127.0.0.1:8000`:
```ts
server: {
  port: 5173,
  proxy: {
    '/api': {
      target: 'http://127.0.0.1:8000',
      changeOrigin: true,
    },
  },
}
```

### Django CORS Configuration
If accessing the API cross-origin directly, ensure `django-cors-headers` is active in the backend `.env`:
```env
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000
```

---

## 6. Application Architecture & Routes

```text
frontend/
├── src/
│   ├── api/
│   │   ├── client.ts         # Centralized Axios client, JWT interceptor, refresh queue
│   │   ├── auth.ts           # Register, Login, Refresh token calls
│   │   ├── patients.ts       # Patient CRUD operations
│   │   ├── doctors.ts        # Doctor directory CRUD operations
│   │   └── mappings.ts       # Patient-Doctor mapping operations
│   ├── context/
│   │   ├── AuthContext.tsx   # Global authentication provider and state
│   │   └── useAuth.ts        # Custom authentication hook
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx # Main responsive portal shell
│   │   │   ├── Sidebar.tsx   # Sidebar navigation with active route highlights
│   │   │   └── TopNavbar.tsx # Session indicator, user badge, and logout
│   │   ├── ui/
│   │   │   ├── Button.tsx    # Styled buttons with loading spinner
│   │   │   ├── Input.tsx     # Inputs with password show/hide and validation errors
│   │   │   ├── Select.tsx    # Dropdown select
│   │   │   ├── Modal.tsx     # Accessible dialog modal
│   │   │   ├── ConfirmModal.tsx # Confirmation for destructive actions
│   │   │   ├── Badge.tsx     # Colored status badges
│   │   │   ├── Spinner.tsx   # Loading spinner
│   │   │   ├── Alert.tsx     # Notification banners
│   │   │   └── EmptyState.tsx# Empty state graphics and call-to-actions
│   │   └── forms/
│   │       ├── PatientForm.tsx   # Add/Edit patient modal form
│   │       ├── DoctorForm.tsx    # Add/Edit doctor modal form
│   │       └── AssignDoctorForm.tsx # Assign doctor to patient modal form
│   ├── pages/
│   │   ├── Login.tsx         # User authentication page
│   │   ├── Register.tsx      # Staff registration page
│   │   ├── Dashboard.tsx     # Metrics, quick actions, and recent records
│   │   ├── Patients.tsx      # Patient directory, search, CRUD, and assigned doctors
│   │   ├── Doctors.tsx       # Doctor directory, search, and CRUD
│   │   ├── Assignments.tsx   # Doctor-patient relational mappings & removal
│   │   └── NotFound.tsx      # 404 handler
│   ├── types/
│   │   └── index.ts          # TypeScript interfaces for all models and payloads
│   ├── App.tsx               # Route definitions and route guards
│   ├── main.tsx              # React DOM root
│   └── index.css             # Tailwind base and custom scrollbar
```

### Portal Routes:
- `/login`: Public login page
- `/register`: Public staff registration page
- `/`: Protected clinical dashboard (redirects to `/login` if unauthenticated)
- `/patients`: Protected patient management
- `/doctors`: Protected medical doctor directory
- `/assignments`: Protected patient-doctor mapping manager
- `*`: 404 Not Found page

---

## 7. Features & Workflow Guide

### Authentication Flow
1. **Register**: New staff register with name, email, and password (validated for length and complexity).
2. **Auto-Login**: Successful registration immediately logs the user in and redirects to the dashboard.
3. **Session Persistence**: JWT access and refresh tokens are stored in `localStorage`.
4. **Token Refresh**: When access token expires (401 response), Axios automatically attempts silent refresh via `POST /api/auth/token/refresh/` and retries the original request.

### Patient Record Isolation
- Patients registered by your account belong strictly to you.
- Multi-tenant isolation ensures other accounts receive `404 Not Found` if attempting to view or delete your records.

### Doctor-Patient Mapping Semantics
- **Assign Doctor**: `POST /api/mappings/` with `{ patient: <id>, doctor: <id> }`. Rejects duplicate assignments with clean validation feedback.
- **View Assigned Doctors**: `GET /api/mappings/<patient_id>/` lists all doctors assigned to a specific patient.
- **Remove Assignment**: `DELETE /api/mappings/<mapping_id>/` removes the assignment by its **mapping record ID** (not patient ID).

---

## 8. Common API Integration Troubleshooting

1. **"Network error: Unable to reach the healthcare backend server"**:
   - Ensure the Django server is running: `python manage.py runserver` on port `8000`.
   - Verify `VITE_API_BASE_URL=/api` in `frontend/.env`.

2. **"401 Unauthorized / Token expired"**:
   - The token will auto-refresh. If the refresh token also expires, you will be redirected to `/login` to re-authenticate.

3. **"This doctor is already assigned to this patient"**:
   - The database and serializer enforce a unique composite constraint. A doctor cannot be mapped to the same patient more than once.
