markdown
# Full-Stack User Authentication System

Complete authentication system with separate frontend and backend - Technical Assessment for Infinity Technology Warriors.

---

## 📁 Repository Structure

This repository contains two separate applications:

### 🎨 [Frontend](./frontend)
React application with Vite and Tailwind CSS
- **Location:** `/frontend` folder
- **Tech:** React 18, Vite, Tailwind CSS, Axios, React Router
- **Features:** Registration, Login, Protected Dashboard

### ⚙️ [Backend](./backend)
Django REST API with JWT authentication
- **Location:** `/backend` folder
- **Tech:** Django 5.0, DRF, MySQL, JWT
- **Features:** User registration API, Login API, Profile API

---

## 🚀 Quick Start

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
Runs on: http://localhost:5173


## Backend Setup
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver


 User Registration with validation
 JWT Token Authentication
 Protected Dashboard
 User Profile Management
 Responsive UI Design
 MySQL Database
 Password Hashing
 CORS Configuration

📊 API Endpoints

Method	Endpoint	Description
POST	/api/auth/register/	Register new user
POST	/api/auth/login/	Login user (returns JWT)
GET	/api/auth/profile/	Get user profile (protected)
