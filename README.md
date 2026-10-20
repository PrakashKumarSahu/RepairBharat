<div align="center">

<img src="https://img.shields.io/badge/RepairBharat-Repair%20OS-00288e?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0xMyAydi43bDIgMlYyaDZ2MmgtNnYxLjdsLTIgMlYySDN2MmgxMFYySDN6Ii8+PC9zdmc+" alt="RepairBharat" />

# RepairBharat

**India's Multi-Franchise Repair Operating System**

_Track, manage, and monetize electronics repairs — for customers, shop owners, and technicians_

[![Live Demo](https://img.shields.io/badge/Live%20Demo-quikx.live-00288e?style=flat-square&logo=vercel)](https://quikx.live/login)
[![Django](https://img.shields.io/badge/Django-6.0-092E20?style=flat-square&logo=django)](https://docs.djangoproject.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite)](https://vite.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169E1?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker)](https://docs.docker.com/compose/)
[![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=flat-square&logo=pwa)](https://web.dev/progressive-web-apps/)

</div>

---

## Overview

RepairBharat is a production-grade **Repair Operating System** for India's multi-billion-dollar electronics repair market. It serves three user roles across a unified platform:

| Role | What they do |
|------|-------------|
| **Customer** | Book repairs at nearby workshops, track live repair stages, view QR ticket, manage registered devices |
| **Shop Owner** | ERP dashboard — manage technicians, inventory, billing (GST-compliant), analytics & reporting |
| **Technician** | Job queue, diagnostics form, stage transitions, incentive tracker, join-request to workshops |

---

## Architecture

```
                          ┌─────────────────────────────────────────┐
                          │        React 19 + Vite 8 (PWA)          │
                          │  ┌─────────┐  ┌──────────┐  ┌────────┐ │
      Browser / App ─────▶│  Customer │  │  Owner   │  │  Tech  │ │
                          │  Dashboard│  │  ERP+ERP │  │  Queue │ │
                          └──────────────────────────────────┬──────┘
                                                             │ REST + JWT
                          ┌──────────────────────────────────▼──────┐
                          │          Django 6 + DRF API              │
                          │  accounts │ repairs  │ billing │ workflow │
                          │  orgs     │ inventory│ devices │ providers│
                          │  notifications │ analytics │ core audit  │
                          └──────────────────────────────────┬──────┘
                                                             │
                          ┌──────────────────────────────────▼──────┐
                          │            PostgreSQL 17                 │
                          └─────────────────────────────────────────┘
```

---

## Features

### For Customers
- 📍 **Workshop Radar** — proximity-based branch discovery with GPS/manual location
- 🔖 **QR Ticket Booking** — book repairs online; receive scannable QR ticket
- 📊 **Live Repair Tracker** — progress bar across all Kanban stages
- 📱 **Device Management** — register and track devices by brand/model/serial/IMEI
- 🔔 **Push Notifications** — SMS + in-app alerts on every stage change

### For Shop Owners
- 🏭 **ERP Dashboard** — repair order table with stage control, technician assignment, invoice button
- 🔧 **Inventory Management** — spare parts catalog with low-stock threshold alerts
- 🧾 **GST Billing** — CGST/SGST compliant invoices with print preview; manual itemized invoices
- 📈 **Analytics & Reporting** — revenue charts, ticket donut, technician performance leaderboard
- 🏪 **Multi-Branch** — manage multiple physical branches under one organization
- 👷 **Join Request System** — approve/reject technician applications

### For Technicians
- 📋 **Job Queue** — active repairs with expandable repair history
- 🔬 **Diagnostics Form** — log notes, advance stages, attach findings
- 💰 **Incentive Tracker** — auto-calculated per-ticket earnings
- 🔗 **Shop Discovery** — search and request to join repair workshops

### Platform-Wide
- 🔐 **JWT Authentication** — access + refresh tokens via SimpleJWT
- 📡 **Real-time Polling** — ticket state refreshes every 10 seconds
- 🕵️ **Audit Trail** — every ticket/invoice action logged with IP address
- 📲 **PWA** — installable on Android/iOS; offline job queue via service worker

---

## Tech Stack

### Backend
| Package | Version | Purpose |
|---------|---------|---------|
| Django | 6.0.5 | Web framework |
| Django REST Framework | 3.17.1 | REST API |
| SimpleJWT | 5.5.1 | JWT auth |
| django-cors-headers | 4.9.0 | CORS policy |
| psycopg2-binary | 2.9.12 | PostgreSQL driver |
| Gunicorn | 23.0.0 | Production WSGI server |

### Frontend
| Package | Version | Purpose |
|---------|---------|---------|
| React | 19 | UI framework |
| Vite | 8 | Build tool + dev server |
| React Router DOM | 7 | Client-side routing |
| Axios | 1.x | HTTP client with JWT interceptor |
| react-hot-toast | 2.x | Toast notifications |
| Tailwind CSS | 3 (CDN) | Utility-first styling |

### Infrastructure
| Tool | Purpose |
|------|---------|
| Docker Compose | Multi-container orchestration |
| PostgreSQL 17 | Primary database |
| Nginx | Reverse proxy + static file serving (inside frontend container) |

---

## Project Structure

```
RepairBharat/
├── backend/
│   ├── RepairBharat/          # Django settings, root URL config
│   ├── accounts/              # CustomUser model, auth (register/login), profiles
│   ├── organizations/         # Organization + Branch models, Google Places integration
│   ├── providers/             # Technician registry, join requests, skill matrix
│   ├── devices/               # Customer device metadata (brand, model, serial, IMEI)
│   ├── workflow/              # WorkflowStage — database-driven Kanban stages
│   ├── repairs/               # RepairOrder lifecycle, history log, stage transitions
│   ├── inventory/             # InventoryItem — spares catalog + low-stock thresholds
│   ├── billing/               # GSTInvoice — CGST/SGST invoices, manual items
│   ├── notifications/         # Notification model, Fast2SMS service, signals
│   ├── analytics/             # Analytics API — revenue, KPIs, tech performance
│   ├── core/                  # Shared base models, permissions, ActivityLog audit trail
│   ├── seed_data.py           # Seed DB with demo workshops, stages, users
│   └── requirements.txt
│
├── frontend/
│   ├── public/
│   │   ├── manifest.json      # PWA manifest
│   │   ├── sw.js              # Service worker (offline cache)
│   │   └── icons/             # App icons (192×192, 512×512)
│   └── src/
│       ├── components/
│       │   ├── ui/            # Modal, Spinner, StatusBadge, EmptyState
│       │   ├── layout/        # Navbar (with notification bell), Sidebar
│       │   ├── tickets/       # QrSuccessModal, StageTransitionModal, WalkinModal
│       │   ├── branches/      # BookingModal, CreateBranchModal
│       │   ├── billing/       # CreateInvoiceModal, InvoicePrintView
│       │   ├── inventory/     # AddInventoryModal
│       │   └── analytics/     # AnalyticsDashboard (charts, KPIs, tech table)
│       ├── pages/
│       │   ├── dashboard/
│       │   │   ├── index.jsx            # Role router
│       │   │   ├── CustomerDashboard.jsx
│       │   │   ├── ShopOwnerDashboard.jsx
│       │   │   └── TechnicianDashboard.jsx
│       │   ├── DeviceManagement.jsx     # /devices — customer device registry
│       │   ├── login.jsx
│       │   ├── Signup.jsx
│       │   └── TrackTicket.jsx          # Public QR ticket tracker
│       ├── hooks/
│       │   └── usePolling.js            # Polling hook (10s ticket refresh)
│       ├── services/
│       │   ├── api.jsx                  # All API calls + Axios instance
│       │   ├── contexts.jsx             # UserContext (auth state)
│       │   └── index.js
│       ├── utils/
│       │   └── status.js                # getStatusLabelAndColor, formatRupee
│       └── App.jsx                      # Router + ProtectedRoute
│
├── docker-compose.yml
├── DEPLOYMENT.md
└── README.md
```

---

## API Reference

### Authentication (`/accounts/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/accounts/register/` | Register (customer / shop_owner / technician) |
| `POST` | `/accounts/login/` | Login → returns `access` + `refresh` JWT |
| `POST` | `/api/token/refresh/` | Refresh access token |

### Repairs (`/api/repairs/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/repairs/` | List tickets (role-filtered) |
| `POST` | `/api/repairs/` | Create repair order |
| `PATCH` | `/api/repairs/{id}/` | Update stage / assign technician |
| `GET` | `/api/repairs/track/{ticket_number}/` | Public QR tracker (no auth) |

### Organizations & Branches (`/api/orgs/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/orgs/branches/` | List branches (supports `?lat=&lng=&repair_type=`) |
| `POST` | `/api/orgs/branches/` | Create branch (shop_owner) |

### Inventory (`/api/inventory/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/inventory/` | List items (branch-filtered) |
| `POST` | `/api/inventory/` | Add item |
| `PATCH` | `/api/inventory/{id}/` | Update stock |

### Billing (`/api/billing/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/billing/` | List GST invoices |
| `POST` | `/api/billing/` | Create invoice |
| `GET` | `/api/billing/{id}/` | Invoice detail |

### Providers (`/api/providers/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/providers/technicians/` | List technicians |
| `POST` | `/api/providers/join-requests/` | Submit join request |
| `PATCH` | `/api/providers/join-requests/{id}/` | Approve / reject |

### Notifications (`/api/notifications/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/notifications/` | List 50 latest notifications |
| `GET` | `/api/notifications/unread-count/` | `{ count: N }` |
| `POST` | `/api/notifications/mark-read/` | Mark all as read |

### Analytics (`/api/analytics/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/analytics/kpis/` | High-level KPI summary (shop_owner) |
| `GET` | `/api/analytics/revenue/?range=30d` | Daily paid revenue (30d / 90d) |
| `GET` | `/api/analytics/tickets/status-summary/` | Ticket counts by status |
| `GET` | `/api/analytics/technicians/performance/` | Closed tickets per technician |
| `GET` | `/api/analytics/inventory/low-stock/` | Items below reorder threshold |

### Audit Log (`/api/audit-log/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/audit-log/` | Last 200 audit entries (shop_owner) |

---

## Quick Start (Docker — Recommended)

### Prerequisites
- Docker Engine v24+ and Docker Compose v2+
- Git

### 1. Clone the repository
```bash
git clone https://github.com/PrakashKumarSahu/RepairBharat.git
cd RepairBharat
```

### 2. Configure environment variables
```bash
cp backend/.env.prod.example backend/.env.prod   # if example exists
nano backend/.env.prod
```

Minimum required settings in `backend/.env.prod`:
```ini
DEBUG=False
DJANGO_SECRET_KEY=your-secret-key-at-least-50-chars
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
DJANGO_CSRF_TRUSTED_ORIGINS=http://localhost:8001

DATABASE_ENGINE=postgresql
DATABASE_NAME=repairbharatdb
DATABASE_USERNAME=repair_admin
DATABASE_PASSWORD=strong_password_here
DATABASE_HOST=db
DATABASE_PORT=5432

POSTGRES_DB=repairbharatdb
POSTGRES_USER=repair_admin
POSTGRES_PASSWORD=strong_password_here

# Optional — enables SMS notifications via Fast2SMS
FAST2SMS_API_KEY=
```

### 3. Start all services
```bash
docker-compose up --build -d
```

### 4. Run migrations & seed data
```bash
docker-compose exec backend python manage.py makemigrations
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser  # optional
docker-compose exec backend python seed_data.py               # demo data
```

### 5. Open the app
```
http://localhost:8001
```

---

## Local Development (No Docker)

### Backend
```bash
cd backend/
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Set minimal env vars
export DJANGO_SECRET_KEY="dev-secret-key"
export DEBUG=True

python manage.py makemigrations
python manage.py migrate
python seed_data.py
python manage.py runserver
```

### Frontend
```bash
cd frontend/
npm install
npm run dev         # Dev server at http://localhost:3000
```

> The Vite dev server proxies `/api/` and `/accounts/` to `http://localhost:8000` automatically.

---

## Sandbox Test Credentials

After running `seed_data.py`, use these accounts:

| Username | Password | Role | Access |
|----------|----------|------|--------|
| `customer1` | `password123` | Customer | Browse workshops, book repairs, track tickets |
| `owner1` | `password123` | Shop Owner | Full ERP — inventory, billing, analytics, technician management |
| `tech1` | `password123` | Technician | Job queue, diagnostics, stage transitions, incentives |

---

## SMS Notifications Setup

RepairBharat integrates with [Fast2SMS](https://www.fast2sms.com/) for customer SMS alerts.

1. Create a free Fast2SMS account
2. Copy your API key from the dashboard
3. Add to your environment:
   ```bash
   FAST2SMS_API_KEY=your_fast2sms_api_key
   ```
4. Restart the backend container

Notifications are triggered automatically on every repair stage change via Django signals.

---

## Production Deployment

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for the full VPS deployment guide including:
- Nginx SSL/TLS setup with Let's Encrypt
- Docker Compose production configuration
- Static files with shared volume
- Environment hardening

**Live instance**: [quikx.live](https://quikx.live/login)

---

## User Roles & Permissions

| Resource | Customer | Technician | Shop Owner |
|----------|----------|------------|------------|
| View own tickets | ✅ | ✅ (assigned/branch) | ✅ (all branches) |
| Create ticket | ✅ | ✅ (walk-in) | ✅ (walk-in) |
| Update ticket stage | ❌ | ✅ | ✅ |
| Manage inventory | ❌ | ❌ | ✅ |
| Generate invoice | ❌ | ✅ | ✅ |
| View analytics | ❌ | ❌ | ✅ |
| Approve join requests | ❌ | ❌ | ✅ |
| View audit log | ❌ | ❌ | ✅ |

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit with conventional commits: `git commit -m "feat(billing): add UPI QR code to invoices"`
4. Push and open a Pull Request against `main`

---

## License

This project is proprietary software. All rights reserved © RepairBharat / PrakashKumarSahu.

---

<div align="center">
Made with ❤️ for India's repair ecosystem
</div>
