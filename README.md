# AI Quiz Competition Web App

A full-stack mobile-first web application for conducting timed AI quiz competitions for 12th standard students, inspired by the NPTEL quiz model.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Recharts |
| Backend | Node.js, Express |
| Database | MongoDB (Mongoose) |
| Auth | JWT (jsonwebtoken) |
| Email | Nodemailer (Gmail) |
| File Export | xlsx |
| Hosting | Vercel (frontend) + Render (backend) |

---

## Quick Start

### Prerequisites
- Node.js v18+
- MongoDB running locally (`mongodb://localhost:27017`) or a MongoDB Atlas URI

### 1. Install Dependencies
```
Double-click install.bat
```
Or manually:
```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure Environment
Edit `backend/.env`:
```env
MONGO_URI=mongodb://localhost:27017/aiquiz
JWT_SECRET=change_this_to_a_long_random_string
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
ADMIN_EMAIL=admin@aiquiz.com
ADMIN_PASSWORD=Admin@123
FRONTEND_URL=http://localhost:3000
```

> For Gmail: Enable 2FA → Generate App Password → use it as EMAIL_PASS

### 3. Start the App
```
Double-click start.bat
```
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

---

## Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@aiquiz.com | Admin@123 |

---

## User Flows

### Student Flow
1. `/register` — Fill registration form (name, email, phone, school, year, optional marksheet)
2. Wait for admin approval
3. `/login` — Enter email → receive OTP → verify → enter quiz
4. `/dashboard` — View quiz info, rules, countdown
5. `/quiz` — 20-min timed quiz (one question per screen, auto-save, anti-cheat)
6. `/result` — View score, rank, grade, time taken
7. `/leaderboard` — Public leaderboard

### Admin Flow
1. `/admin/login` — Email + password login
2. `/admin` — Full dashboard with 6 tabs:
   - **Overview** — Live stats, participation counter
   - **Students** — Approve/reject registrations, view marksheets
   - **Questions** — Add questions manually or import via CSV
   - **Settings** — Set duration, start/end time, activate quiz, broadcast messages
   - **Results** — Leaderboard + export to Excel
   - **Analytics** — Charts, score distribution, question difficulty stats

---

## Features

### Quiz Engine
- 20-minute countdown timer (turns yellow at 3min, red at 1min)
- One question per screen with Previous/Next navigation
- Question navigator dots (answered/unanswered/current)
- Auto-save answers on every selection
- Auto-submit when timer expires
- Submit confirmation popup
- Randomized question order and answer options
- One attempt per student enforced

### Security
- Tab-switch detection with 3-strike warning
- Right-click disabled during quiz
- Page refresh warning (beforeunload)
- JWT session authentication
- Rate limiting on auth endpoints
- OTP expires in 10 minutes

### Admin Analytics
- Average score, highest score, completion rate
- Live participant counter (auto-refreshes every 15s)
- Per-question accuracy stats with difficulty color coding
- Score distribution pie chart
- Questions-by-topic bar chart
- Export all results to Excel (.xlsx)

### Extra Features
- Email result summary to student after submission
- Admin broadcast message shown on student dashboard
- Dark mode toggle
- Mobile-first responsive design (Deep Blue + White + Cyan)
- 30 sample AI questions pre-seeded

---

## CSV Import Format

Upload questions in bulk via Admin → Questions → Import CSV:

```csv
questionText,option1,option2,option3,option4,correctIndex,topic,difficulty
What is AI?,Automated Intelligence,Artificial Intelligence,Augmented Interface,Analytical Input,1,AI Applications,easy
```

- `correctIndex`: 0-based index of the correct option (0=A, 1=B, 2=C, 3=D)
- `topic`: One of: `Machine Learning`, `AI Applications`, `Data Science`, `Python for AI`, `Logical Reasoning`
- `difficulty`: `easy`, `medium`, or `hard`

---

## Project Structure

```
ai-quiz-app/
├── backend/
│   └── src/
│       ├── models/         # Mongoose schemas (User, Question, Attempt, QuizSettings)
│       ├── routes/         # Express routes (auth, quiz, admin, student)
│       ├── middleware/     # JWT auth middleware
│       ├── utils/          # Email sender, seed script
│       └── server.js       # Entry point
├── frontend/
│   └── src/
│       ├── pages/          # Register, Login, Dashboard, Quiz, Result, Leaderboard, Admin
│       ├── components/     # Header
│       ├── context/        # AuthContext (user state + dark mode)
│       ├── utils/          # Axios API instance
│       └── index.css       # Full design system (CSS variables, components)
├── install.bat             # One-click dependency installer
├── start.bat               # One-click app launcher
└── sample_questions.csv    # Sample CSV for bulk import
```

---

## Deployment

### Frontend (Vercel)
```bash
cd frontend
npm run build
# Deploy build/ folder to Vercel
```
Set environment: `REACT_APP_API_URL=https://your-backend.render.com`
Update `frontend/src/utils/api.js` baseURL accordingly.

### Backend (Render)
- Set all `.env` variables in Render dashboard
- Set `FRONTEND_URL` to your Vercel URL
- MongoDB: use MongoDB Atlas free tier URI
