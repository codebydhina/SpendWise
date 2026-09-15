# SpendWise – Personal Expense Tracker

**Track. Analyze. Save.**

A complete college-ready CRUD expense management application using React + Vite, Django REST Framework and SQLite.

## Stack
- Frontend: React, Vite, JavaScript, CSS, React Router, Axios, Recharts
- Backend: Python, Django, Django REST Framework, JWT authentication
- Database: SQLite
- Testing: Django tests + Postman

## Architecture
User → React Frontend → Axios → Django REST API → Django ORM → SQLite

## Features
- JWT login/signup
- User-owned expenses
- Create/read/update/delete expenses
- Search and category/payment/date/amount filtering
- Dashboard statistics and charts
- Category, payment and monthly analytics
- Monthly budgets
- Responsive SaaS-style UI
- Django Admin
- Validation, loading/empty/error states

## Run backend
```bash
cd backend
python -m venv venv
# Windows PowerShell
venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

## Run frontend
Open another terminal:
```bash
cd frontend
npm install
npm run dev
```
Open http://localhost:5173

## API endpoints
- POST `/api/auth/signup/`
- POST `/api/auth/login/`
- POST `/api/auth/refresh/`
- GET/POST `/api/expenses/`
- GET/PUT/PATCH/DELETE `/api/expenses/{id}/`
- GET `/api/expenses/stats/`
- GET `/api/expenses/category-stats/`
- GET `/api/expenses/payment-stats/`
- GET `/api/expenses/monthly-stats/`
- GET/POST `/api/budget/`
- PUT/PATCH/DELETE `/api/budget/{id}/`

Search/filter examples:
`/api/expenses/?search=lunch`
`/api/expenses/?category=Food&payment_method=UPI`
`/api/expenses/?date_from=2026-09-01&date_to=2026-09-30`
`/api/expenses/?min_amount=100&max_amount=1000`

## Postman
1. Create an account or obtain a JWT from `/api/auth/login/`.
2. In Postman Authorization choose Bearer Token and paste `access`.
3. Test the CRUD and analytics endpoints above.

## Tests
```bash
cd backend
python manage.py test
```

## Demo data
Create a ready-to-explore account with 18 expenses spanning multiple categories, payment methods, and months:
```bash
cd backend
python manage.py seed_demo
```

Demo login: `demo` / `SpendWise123!`
The command is idempotent and refreshes the demo account's records each time it runs.

## GitHub
```bash
git init
git add .
git commit -m "Build SpendWise full-stack expense tracker"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

## Project structure
```text
SpendWise/
├── backend/
│   ├── config/
│   ├── expenses/
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── src/components/
│   ├── src/context/
│   ├── src/pages/
│   ├── src/services/
│   └── package.json
├── README.md
└── .gitignore
```
