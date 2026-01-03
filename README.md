# Route2Rise - Lead Management System

A lightweight, internal lead management system for small IT services companies. Built with **FastAPI**, **React**, and **MongoDB**. Designed specifically for two co-founders who need a clean, distraction-free way to manage leads.

## 🎯 Key Features

- **Lead Management**: Create, read, update, and delete leads
- **Smart Filtering**: Filter by sector, status, owner, or search by name/email
- **Dashboard**: Real-time stats, upcoming calls, and recent activity
- **Authentication**: JWT-based security with static founder credentials
- **Status Tracking**: New → Contacted → Interested → Converted/Lost
- **Sector Organization**: Predefined sectors for categorization
- **Call Scheduling**: Schedule follow-ups and track next contact dates
- **Interaction History**: Append-only log of all lead interactions
- **Ownership**: Assign leads between Founder A and Founder B

## 📋 Tech Stack

**Backend**
- FastAPI 0.104+ (Python)
- MongoDB with Motor (async driver)
- JWT Authentication
- Pydantic for validation

**Frontend**
- React 18
- Vite
- React Router v6
- Axios for HTTP
- Plain CSS (no heavy UI frameworks)

**Deployment**
- Docker & Docker Compose ready
- Environment-based configuration

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- MongoDB 5.0+ (or use Docker)
- Docker & Docker Compose (optional)

### Option 1: Docker (Recommended)

```bash
# Clone and setup
git clone <repo>
cd route2rise

# Copy environment template
cp backend/.env.example backend/.env

# Edit .env with your passwords
# Start all services
docker-compose up
```

Services available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **MongoDB**: localhost:27017

### Option 2: Local Development

**Backend Setup**

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with credentials
uvicorn app.main:app --reload
```

**Frontend Setup**

```bash
cd frontend
npm install
npm run dev
```

## 🔑 Authentication

Two static founder accounts configured via `.env`:

```env
FOUNDER_A_USERNAME=founder_a
FOUNDER_A_PASSWORD=change-this-password

FOUNDER_B_USERNAME=founder_b
FOUNDER_B_PASSWORD=change-this-password
```

**Security:**
- JWT token-based auth
- Tokens expire after 24 hours
- All requests require authentication
- No password reset (static credentials)

## 🚀 Deployment

```bash
# Using Docker Compose
docker-compose up --build

# Production backend
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:8000 app.main:app

# Production frontend
npm run build
# Serve dist/ folder with Nginx
```

## 📁 Project Structure

```
route2rise/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── models.py
│   │   ├── config.py
│   │   ├── auth/
│   │   ├── leads/
│   │   └── database/
│   ├── requirements.txt
│   ├── .env.example
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── styles/
│   ├── package.json
│   └── Dockerfile
│
└── docker-compose.yml
```

## 📚 API Routes

**Auth**
- `POST /auth/login` - Login with credentials
- `GET /auth/verify` - Verify token

**Leads**
- `POST /leads` - Create lead
- `GET /leads` - List leads with filters
- `GET /leads/{id}` - Get lead details
- `PUT /leads/{id}` - Update lead
- `DELETE /leads/{id}` - Soft delete lead
- `POST /leads/{id}/interaction` - Add interaction
- `GET /leads/dashboard/stats` - Dashboard statistics

## 🎨 UI Features

- Clean, minimal design
- CRM-style sidebar navigation
- Real-time lead filtering
- Modal forms for creation/editing
- Status badges with color coding
- Responsive tables
- Dashboard with stats and charts

## 🔒 Security

✅ Implemented:
- JWT authentication
- Token validation on every request
- Static founder credentials via environment
- No credentials in frontend
- Soft delete (data preservation)

⚠️ Production improvements:
- Change JWT_SECRET_KEY
- Use HTTPS/TLS
- Set DEBUG=false
- Enable rate limiting
- Use HTTP-only cookies
- Configure proper CORS origins

## 📖 Development

### Add New Field to Lead

1. Update `backend/app/models.py`
2. Update `frontend/src/pages/Leads.jsx` form
3. Restart services

### Add New Route

1. Create handler in `backend/app/leads/routes.py`
2. Add service method if needed
3. Call from `frontend/src/services/leadService.js`

## 🐛 Troubleshooting

**MongoDB Connection Issues**
```
docker ps | grep mongodb
# or verify MONGODB_URL in .env
```

**CORS Errors**
```
Update CORS_ORIGINS in .env
Restart backend
```

**Auth Issues**
```
Clear localStorage
Verify JWT_SECRET_KEY matches
Check token expiration
```

## 📜 License

Internal use only. Not licensed for external distribution.

---

**Built with ❤️ for Route2Rise**