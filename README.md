## Contact Management App (Python + React)

Simple full‑stack internship project: a contact manager where each user can register, log in, and manage **their own contacts** with favorites, tags, and search, based on the requirements in `Contact Management App_.pdf`.

### 1. Tech Stack

- **Backend**: Python, FastAPI, MongoDB (pymongo), JWT auth, bcrypt password hashing  
- **Frontend**: React + Vite + plain CSS (responsive)  
- **Database**: MongoDB (MongoDB Atlas)

Project structure:

- `backend/` – FastAPI app
- `frontend/` – React app
- `docs/` – short DB + API docs
- `screenshots/` – screenshots of each page.

---

### 2. Backend – Setup & Run (Windows, simple commands)

Requirements:

- Python 3.10+
- MongoDB running (local or Atlas URI)

Steps (run from project root in PowerShell):

```
cd backend
python3 -m venv venv
source venv/bin/activate
```

Create `.env` file inside `backend`:

```text
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=contact_management_app
JWT_SECRET_KEY=change_this_secret
ACCESS_TOKEN_EXPIRE_MINUTES=60
```
Install backend dependencies
''' pip install -r requirements.txt '''


Start backend:

```
cd backend
venv\Scripts\activate
python server.py
```

Backend runs at: `http://localhost:8000`  
Health check: `http://localhost:8000/health`

---

### 3. Frontend – Setup & Run

Requirements:

- Node.js 18+ and npm

From project root:

```
cd frontend
npm install
npm run dev
```

Open browser at: `http://localhost:5173`

The frontend is configured to call the backend at `http://localhost:8000`.

---

### 4. Main Screens (as required)

- **Login / Register**
  - `/login` – login form
  - `/register` – create account, then auto login
- **Dashboard** – `/dashboard`
  - List of contacts (Name, Phone, Email, Tags, Favorite star)
  - Search by name / phone / email
  - Filter favorites
  - Filter by tag (dropdown)
  - Add contact form (name, phone, email, notes, tags, favorite)
  - Logout button
- **Contact Details** – `/contacts/:id`
  - View contact details
  - Edit contact (all fields)
  - Delete contact
  - Toggle favorite
  - “Back to dashboard”

---

### 5. Deployment

Student‑level simple deployment:

- **Backend**: Render + MongoDB Atlas
- **Frontend**: Vercel or Netlify (build with `npm run build`)

Update `API_BASE_URL` in `frontend/src/services/api.js` with your deployed backend URL for production.

