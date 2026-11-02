# RepairBharat 🔧

> **B2B repair-shop management platform for India** — multi-branch ERP, GST-compliant invoicing, real-time ticket tracking, technician management, and spare-parts inventory; packaged as a self-hosted Docker stack.

---

## Table of Contents

1. [What it does](#what-it-does)
2. [Architecture overview](#architecture-overview)
3. [Tech stack](#tech-stack)
4. [Project structure](#project-structure)
5. [Prerequisites](#prerequisites)
6. [Quick start (development)](#quick-start-development)
7. [Production deployment](#production-deployment)
8. [Environment variables](#environment-variables)
9. [API reference](#api-reference)
10. [Frontend data layer](#frontend-data-layer)
11. [Key configuration files](#key-configuration-files)
12. [How to extend the system](#how-to-extend-the-system)

---

## What it does

RepairBharat serves three user roles from a single login:

| Role | Key capabilities |
|---|---|
| **Shop Owner** | Create branches, manage technicians, create walk-in tickets, assign work, GST billing, analytics dashboard |
| **Technician** | View repair queue, run diagnostics, advance pipeline stages, generate invoices |
| **Customer** | Discover nearby workshops, book a repair, scan QR code to track live status |

Notable features:
- **Repair pipeline** — configurable stage progression (Received → Diagnosing → In Repair → Testing → Ready → Delivered)
- **QR tracking** — every ticket gets a unique QR code; customers can track status without logging in at `/track/<ticket_number>`
- **GST invoicing** — B2B-compliant CGST/SGST line items, GSTIN fields, PDF print view
- **Analytics** — Recharts donut (status breakdown) + bar chart (revenue over time), technician performance table, low-stock alerts
- **Notifications** — in-app bell for job assignments, stage changes, and join-request approvals
- **Location-aware workshop discovery** — branches sorted by proximity using browser GPS

---

## Architecture overview

```
┌──────────────────────────────────────────────────────┐
│                   Docker Compose                      │
│                                                       │
│  ┌──────────────┐  ┌───────────────┐  ┌───────────┐  │
│  │   Postgres   │  │  Django REST  │  │   Nginx   │  │
│  │  (port 5432) │◄─│  (port 8000)  │◄─│  + React  │  │
│  │  postgres:17 │  │  Django 6     │  │ (port 80) │  │
│  └──────────────┘  └───────────────┘  └───────────┘  │
│                           ▲                           │
│                    WhiteNoise serves                  │
│                    /static/ assets                    │
└──────────────────────────────────────────────────────┘
```

**Request flow (production):**
1. Browser → Nginx (port 8001 by default, override with `PORT=`)
2. Nginx serves pre-built React `dist/` for all non-API paths
3. Nginx proxies `/api/*` and `/accounts/*` → Django Gunicorn (port 8000)
4. Django queries Postgres; WhiteNoise serves `/static/` directly from disk

**Frontend data flow:**
- `@tanstack/react-query` manages all server state with background polling, deduplication, and stale-while-revalidate
- `useShopOwnerData()` / `useTechnicianData()` hooks in `src/hooks/useRepairData.js` centralise all queries for each dashboard
- Forms use `react-hook-form` + `zod` — validated client-side before any network call

---

## Tech stack

### Backend

| Package | Version | Purpose |
|---|---|---|
| Django | 6.0.x | Web framework |
| Django REST Framework | 3.17.x | REST API |
| djangorestframework-simplejwt | 5.5.x | JWT auth (`/accounts/login/`, `/api/token/refresh/`) |
| django-cors-headers | 4.9.x | CORS for dev proxy |
| django-filter | ≥24.3 | Filterable querysets (`?status_code=`, `?branch=`, etc.) |
| drf-spectacular | ≥0.28 | OpenAPI 3 schema + Swagger UI |
| whitenoise[brotli] | ≥6.9 | Static file serving with Brotli/gzip compression |
| psycopg2-binary | 2.9.x | PostgreSQL adapter |
| gunicorn | 23.x | WSGI server |

### Frontend

| Package | Version | Purpose |
|---|---|---|
| React | 19 | UI framework |
| Vite | 8 | Build tool (manual chunks for optimal splitting) |
| `@tanstack/react-query` | v5 | Server state, caching, background polling |
| `react-hook-form` | v7 | Forms — spread `{...register('field')}` |
| `zod` + `@hookform/resolvers` | v3 | Schema validation (`z.coerce.number()` for numeric inputs) |
| `recharts` | v2 | Charts — always wrapped in `<ResponsiveContainer>` |
| `date-fns` | v4 | Date formatting (`format`, `parseISO`, `isValid`) |
| `react-qr-code` | latest | QR code generation for ticket tracking links |
| `lucide-react` | latest | Icon set (supplementary to Material Symbols) |
| `react-hot-toast` | latest | Toast notifications |
| `axios` | latest | HTTP client |
| `react-router-dom` | v7 | Client-side routing |

---

## Project structure

```
RepairBharat/
├── docker-compose.yml              # Production stack definition
├── backend/
│   ├── Dockerfile
│   ├── entrypoint.prod.sh          # Runs migrations + collectstatic + gunicorn
│   ├── requirements.txt
│   ├── .env.prod                   # ← create from .env.example (NOT committed)
│   ├── RepairBharat/
│   │   ├── settings.py             # All Django config (STORAGES, REST_FRAMEWORK, LOGGING)
│   │   └── urls.py                 # Root URL conf + health check + OpenAPI routes
│   ├── accounts/                   # User registration, login, JWT, profile, customer list
│   ├── repairs/                    # RepairOrder model, CRUD, public tracking, FilterSet
│   ├── billing/                    # GSTInvoice model, CRUD, FilterSet
│   ├── inventory/                  # InventoryItem model, CRUD, low-stock, FilterSet
│   ├── providers/                  # Technician profiles, skills, join requests
│   ├── organizations/              # Branch (shop location) management
│   ├── workflow/                   # Pipeline stages (configurable order + labels)
│   ├── notifications/              # In-app notification bell
│   ├── analytics/                  # KPI, revenue, status summary, tech performance
│   ├── devices/                    # Device catalogue
│   └── core/                       # ActivityLog / audit trail
└── frontend/
    ├── Dockerfile                  # Multi-stage: Vite build → Nginx
    ├── nginx.conf                  # Serves React SPA + proxies /api → backend
    ├── vite.config.js              # Manual chunk splitting, dev proxy
    ├── tailwind.config.js          # Design tokens (Material Design 3 colour system)
    ├── src/
    │   ├── main.jsx                # App root: QueryClientProvider + BrowserRouter + Toaster
    │   ├── App.jsx                 # Routes wrapped in ErrorBoundary; * → NotFound
    │   ├── index.css               # Base styles + @media print rules
    │   ├── services/
    │   │   ├── api.jsx             # All axios API calls; auto-attaches JWT header
    │   │   └── contexts.jsx        # useUserContext (global auth state)
    │   ├── hooks/
    │   │   ├── useRepairData.js    # useShopOwnerData() + useTechnicianData() React Query hooks
    │   │   └── usePolling.js       # Legacy polling hook (kept for CustomerDashboard)
    │   ├── utils/
    │   │   └── status.js           # getStatusLabelAndColor(), formatRupee()
    │   ├── components/
    │   │   ├── analytics/          # AnalyticsDashboard (Recharts)
    │   │   ├── billing/            # CreateInvoiceModal, InvoicePrintView
    │   │   ├── branches/           # CreateBranchModal, BookingModal
    │   │   ├── inventory/          # AddInventoryModal
    │   │   ├── layout/             # Navbar, Sidebar
    │   │   ├── technicians/        # Technician list/card
    │   │   ├── tickets/            # WalkinModal, QrSuccessModal, TicketCard, StageTransitionModal
    │   │   └── ui/                 # Modal, Spinner, Skeleton, Pagination, EmptyState, StatusBadge, ErrorBoundary
    │   └── pages/
    │       ├── auth/               # LoginPage, RegisterPage
    │       ├── dashboard/
    │       │   ├── ShopOwnerDashboard.jsx    # ERP, Inventory, Billing, Analytics tabs
    │       │   ├── TechnicianDashboard.jsx   # Queue, Diagnostics, Billing tabs
    │       │   └── CustomerDashboard.jsx     # My Repairs, Workshops tabs
    │       ├── tracking/           # PublicTrackingPage (no login required)
    │       └── NotFound.jsx
```

---

## Prerequisites

| Tool | Minimum version |
|---|---|
| Docker | 24+ |
| Docker Compose | v2 (plugin) |
| Node.js | 20 LTS (for local frontend dev only) |
| Python | 3.12 (for local backend dev only) |

---

## Quick start (development)

### 1 — Clone and configure

```bash
git clone https://github.com/PrakashKumarSahu/RepairBharat.git
cd RepairBharat
cp backend/.env.example backend/.env.prod   # edit with your values
```

### 2 — Start the full stack

```bash
docker compose up --build
```

The app is available at **http://localhost:8001** (override port with `PORT=80 docker compose up`).

Django admin: **http://localhost:8001/admin/** — create a superuser with:

```bash
docker compose exec backend python manage.py createsuperuser
```

Swagger UI (OpenAPI 3): **http://localhost:8001/api/docs/**

### 3 — Local frontend dev (hot reload)

```bash
cd frontend
npm install
npm run dev          # http://localhost:3000, proxies /api → :8000
```

The Vite dev proxy is configured in `vite.config.js` — backend must be running separately (via Docker or `python manage.py runserver`).

### 4 — Local backend dev

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
# Requires a running Postgres; set DATABASE_URL in your shell or .env
python manage.py migrate
python manage.py runserver
```

---

## Production deployment

```bash
# 1. Set secrets in backend/.env.prod (see Environment variables section)
# 2. Build and start
PORT=80 docker compose up -d --build

# View logs
docker compose logs -f

# Run migrations manually if needed
docker compose exec backend python manage.py migrate
```

`entrypoint.prod.sh` automatically runs `migrate`, `collectstatic`, then starts Gunicorn. Static files are served by WhiteNoise (Brotli + gzip compressed, long-lived cache headers).

---

## Environment variables

Create `backend/.env.prod` (never commit this file):

```env
# Django
SECRET_KEY=your-very-secret-key-here
DEBUG=False
ALLOWED_HOSTS=your-domain.com,localhost

# Database (Postgres)
DB_NAME=repairbharat
DB_USER=postgres
DB_PASSWORD=your-db-password
DB_HOST=db
DB_PORT=5432

# CORS (comma-separated origins for the frontend)
CORS_ALLOWED_ORIGINS=http://localhost:8001,https://your-domain.com

# Optional: override the base URL seen in QR codes
# VITE_API_URL=https://your-domain.com
```

Frontend env (optional — `frontend/.env.production`):

```env
VITE_API_URL=https://your-domain.com   # leave blank for relative paths (default)
```

---

## API reference

All endpoints except `/api/health/`, `/accounts/register/`, `/accounts/login/`, and `/api/repairs/public-track/<ticket>/` require a JWT `Authorization: Bearer <token>` header.

Paginated list endpoints return `{ count, next, previous, results[] }`. Use `?page=N` to paginate (default page size: 20).

### Authentication

| Method | Path | Description |
|---|---|---|
| `POST` | `/accounts/register/` | Create account (`role`: `customer`, `shop_owner`, `technician`) |
| `POST` | `/accounts/login/` | Returns `{ access, refresh }` JWT pair |
| `POST` | `/api/token/refresh/` | Refresh access token |
| `GET/PATCH` | `/accounts/profile/` | Current user profile |
| `GET` | `/accounts/customers/` | List customers (shop owner only) |
| `POST` | `/accounts/change-password/` | Change password |

### Repair Orders

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/repairs/` | List tickets (filtered by role automatically) |
| `POST` | `/api/repairs/` | Create walk-in ticket |
| `GET/PATCH` | `/api/repairs/<id>/` | Retrieve or update a ticket |
| `GET` | `/api/repairs/public-track/<ticket_number>/` | Public status (no auth) |

**Filter params** (`GET /api/repairs/`):

| Param | Example | Description |
|---|---|---|
| `status_code` | `?status_code=in_repair` | Filter by pipeline stage |
| `branch` | `?branch=3` | Filter by branch ID |
| `priority` | `?priority=high` | `low`, `medium`, `high` |
| `created_after` | `?created_after=2025-01-01` | ISO date |
| `created_before` | `?created_before=2025-12-31` | ISO date |
| `search` | `?search=iPhone` | Full-text search on brand/model |
| `ordering` | `?ordering=-created_at` | Sort (prefix `-` for desc) |

### Billing

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/billing/` | List GST invoices |
| `POST` | `/api/billing/` | Create invoice (linked to ticket or standalone) |
| `GET/PATCH` | `/api/billing/<id>/` | Retrieve or update invoice |

**Filter params**: `?payment_status=paid`, `?created_after=`, `?created_before=`

### Inventory

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/inventory/` | List spare parts |
| `POST` | `/api/inventory/` | Add part |
| `GET/PATCH/DELETE` | `/api/inventory/<id>/` | Part detail |

**Filter params**: `?branch=`, `?category=`, `?low_stock=true`, `?search=`, `?ordering=`

### Branches (Organizations)

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/orgs/branches/` | All branches (with distance if `?lat=&lng=`) |
| `POST` | `/api/orgs/branches/` | Create branch (shop owner only) |
| `GET/PATCH/DELETE` | `/api/orgs/branches/<id>/` | Branch detail |

### Providers (Technicians)

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/providers/technicians/` | List technicians |
| `PATCH` | `/api/providers/technicians/<id>/` | Update (verify, assign branch) |
| `GET` | `/api/providers/shops/` | Shop owner lookup (for join requests) |
| `GET/POST` | `/api/providers/join-requests/` | Join requests |
| `PATCH` | `/api/providers/join-requests/<id>/` | Approve / reject |
| `GET/POST` | `/api/providers/skills/` | Skill catalogue |

### Workflow

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/workflow/stages/` | Pipeline stage definitions |

### Notifications

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/notifications/` | List notifications (newest 50) |
| `POST` | `/api/notifications/mark-read/` | Mark all as read |
| `GET` | `/api/notifications/unread-count/` | Unread count |

### Analytics

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/analytics/kpis/` | Top-level KPIs (total tickets, revenue, avg turnaround) |
| `GET` | `/api/analytics/revenue/` | Revenue over time (`?range=7d|30d|90d`) |
| `GET` | `/api/analytics/tickets/status-summary/` | Ticket count by stage |
| `GET` | `/api/analytics/technicians/performance/` | Technician completion rates |
| `GET` | `/api/analytics/inventory/low-stock/` | Parts below threshold |

### Audit & Utility

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/audit-log/` | Activity log (admin) |
| `GET` | `/api/health/` | Liveness probe `{ status, db, timestamp }` |
| `GET` | `/api/schema/` | OpenAPI 3 YAML/JSON schema |
| `GET` | `/api/docs/` | Swagger UI |

---

## Frontend data layer

### React Query hooks (`src/hooks/useRepairData.js`)

```js
// In ShopOwnerDashboard
const {
    tickets, branches, stages, technicians,
    inventory, invoices, customers, joinRequests,
    isLoading, refreshAll,
} = useShopOwnerData();

// In TechnicianDashboard
const {
    tickets, stages, invoices, joinRequests,
    isLoading, refetchTickets, refetchInvoices, refetchAll,
} = useTechnicianData();
```

- Tickets refresh every **15 s** automatically (shop owner) / **10 s** (technician)
- Stages and customers have a **5 min** `staleTime` (rarely change)
- Call `refreshAll()` / `refetchAll()` after any mutation to instantly sync the UI

### Form validation (`react-hook-form` + `zod`)

Both `WalkinModal` and `CreateBranchModal` manage their own form state. The parent only provides `onSubmit(data)`:

```jsx
<WalkinModal
    open={showWalkinModal}
    onClose={() => setShowWalkinModal(false)}
    onSubmit={handleCreateWalkinSubmit}   // receives validated data object
    customers={customers}
    branches={branches}
/>
```

Numeric fields (e.g., `estimated_cost`) use `z.coerce.number()` to safely coerce HTML `<input type="number">` string values.

### Code-split chunks (Vite manual chunks)

| Chunk | Contents |
|---|---|
| `vendor-react` | React + ReactDOM |
| `vendor-charts` | Recharts + D3 dependencies |
| `vendor-query` | `@tanstack/react-query` |
| `vendor-forms` | `react-hook-form` + `zod` + resolvers |
| `vendor-datefns` | `date-fns` |
| `vendor-icons` | `lucide-react` |
| `vendor-toast` | `react-hot-toast` |
| `vendor-axios` | Axios |

---

## Key configuration files

| File | What to change there |
|---|---|
| `backend/RepairBharat/settings.py` | `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, `REST_FRAMEWORK` pagination, `LOGGING` |
| `backend/RepairBharat/urls.py` | Add new Django app URL includes |
| `frontend/vite.config.js` | Dev proxy targets, chunk splitting |
| `frontend/tailwind.config.js` | Design tokens — colours, spacing, typography |
| `frontend/src/index.css` | Global base styles, `@media print` rules |
| `docker-compose.yml` | Port mapping (`PORT=`), volume mounts, service dependencies |
| `backend/.env.prod` | All secrets and environment-specific config |

---

## How to extend the system

### Add a new pipeline stage

1. Create the stage via Django admin → **Workflow → Stages** (or seed via `seed_data.py`)
2. Set `code`, `name`, `order`, `color_hex`
3. The frontend reads stages from `/api/workflow/stages/` — no code change needed

### Add a new backend app

```bash
cd backend
python manage.py startapp myapp
# Add 'myapp' to INSTALLED_APPS in settings.py
# Add path('api/myapp/', include('myapp.urls')) in urls.py
```

### Add a new frontend page

1. Create `frontend/src/pages/mypage/MyPage.jsx`
2. Add a `<Route path="/mypage" element={<MyPage />} />` in `src/App.jsx`
3. Add the tab to `NAV_CONFIG` in `src/components/layout/Sidebar.jsx`
4. Add data fetching to `useRepairData.js` if needed

### Add a new API filter

In the app's `filters.py`:
```python
import django_filters
from .models import MyModel

class MyModelFilter(django_filters.FilterSet):
    my_field = django_filters.CharFilter(lookup_expr='icontains')
    class Meta:
        model = MyModel
        fields = ['my_field']
```

Then set `filterset_class = MyModelFilter` on the view. DRF handles the rest.

---

## Acknowledgements

Built with Django, React, PostgreSQL, Nginx, and Docker. Designed for Indian repair shop operators with GST compliance, multilingual scalability, and offline-first architecture in mind.
