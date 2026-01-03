# Setup Guide for Route2Rise

## Quick Start

### 1. Install Dependencies

**Backend**
```bash
cd backend
python -m venv venv

# On Windows
venv\Scripts\activate
# On macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

**Frontend**
```bash
cd frontend
npm install
```

### 2. Setup Environment Variables

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=route2rise
JWT_SECRET_KEY=<generate-a-random-secret-key>
FOUNDER_A_USERNAME=founder_a
FOUNDER_A_PASSWORD=<set-a-strong-password>
FOUNDER_B_USERNAME=founder_b
FOUNDER_B_PASSWORD=<set-a-strong-password>
CORS_ORIGINS=http://localhost:5173
DEBUG=true
```

### 3. Start MongoDB

**Option A: Docker**
```bash
docker run -d -p 27017:27017 --name route2rise-mongo mongo:7.0
```

**Option B: Local Installation**
```bash
mongod
```

### 4. Start Backend

```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
uvicorn app.main:app --reload
```

Backend should be running at `http://localhost:8000`

### 5. Start Frontend

```bash
cd frontend
npm run dev
```

Frontend should be running at `http://localhost:5173`

### 6. Login

Visit `http://localhost:5173` and login with:
- Username: `founder_a` (or `founder_b`)
- Password: (whatever you set in .env)

## Docker Setup

```bash
# Copy .env template
cp backend/.env.example backend/.env

# Edit .env with your preferences

# Build and start all services
docker-compose up --build
```

All services will be running:
- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- MongoDB: localhost:27017

## Database Setup

The first time the backend starts, it will create the MongoDB collections automatically.

To manually create indexes for better performance:

```bash
mongosh localhost:27017/route2rise
```

Then run:
```javascript
db.leads.createIndex({ "company_name": 1 });
db.leads.createIndex({ "sector": 1 });
db.leads.createIndex({ "assigned_to": 1 });
db.leads.createIndex({ "status": 1 });
db.leads.createIndex({ "is_deleted": 1 });
db.leads.createIndex({ "created_at": -1 });
```

## Troubleshooting

### Backend won't start
- Check Python version: `python --version` (should be 3.11+)
- Check MongoDB is running: `mongosh localhost:27017`
- Check .env file exists and is properly configured

### Frontend won't start
- Check Node version: `node --version` (should be 18+)
- Delete `node_modules` and run `npm install` again
- Check port 5173 is not in use

### Can't login
- Check credentials in .env match what you're using
- Clear browser localStorage
- Check backend logs for errors

### MongoDB connection errors
- Ensure MongoDB service is running
- Check MONGODB_URL in .env
- Verify MongoDB is accessible on port 27017

## Development Workflow

### Making Changes to the Backend

1. Edit files in `backend/app/`
2. The server will auto-reload (uvicorn --reload)
3. Test endpoints with Postman or curl
4. Check browser console for frontend errors

### Making Changes to the Frontend

1. Edit files in `frontend/src/`
2. The page will hot-reload automatically
3. Check browser console for errors
4. Test with different screen sizes

### Adding a New Lead Field

1. Add to Pydantic model in `backend/app/models.py`
2. Add to form in `frontend/src/pages/Leads.jsx`
3. Restart both servers
4. Test creating a lead with the new field

## Production Deployment

See the main README.md for production deployment instructions.

## Next Steps

1. Change all default passwords in .env
2. Generate a strong JWT_SECRET_KEY
3. Customize sectors list if needed
4. Add your company branding
5. Set up database backups
6. Configure production MongoDB

---

For questions, refer to the main README.md or contact the dev team.
