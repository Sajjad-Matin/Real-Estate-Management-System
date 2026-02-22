# 🏢 Real Estate Management System (REMS)

> A government-grade platform that digitizes the management of state-owned real estate across the country — replacing paper-based records with a centralized, secure, and auditable system.

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat-square&logo=nestjs&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)

---

## 📌 Problem Statement

Government property management in Afghanistan has historically relied on paper records and manual processes — making it slow, error-prone, and impossible to audit at scale. REMS replaces this with a centralized digital platform where officials can register, track, assign, and report on state-owned properties across the entire country in real time.

---

## ✨ Features

- 🔐 **JWT Authentication** — secure login with access & refresh token rotation
- 👥 **Role-Based Access Control** — three roles: `Admin`, `Officer`, and `Viewer` with fine-grained permissions
- 🏠 **Property Registration & Tracking** — register and manage government-owned properties nationwide
- 🗂️ **Staff & Department Assignments** — assign properties to specific departments or officials
- 📄 **Lease & Trade Contract Management** — create, track, and manage property contracts end-to-end
- 📊 **Government Reports & Dashboards** — real-time visibility over national property assets with exportable reports
- ✅ **Full Test Coverage** — unit and integration tests across the backend

---

## 🏗️ Architecture

The project is split into two independent applications:

```
Real-Estate-Management-System/
├── backend/          # NestJS REST API
│   ├── src/
│   │   ├── auth/         # JWT strategy, guards, refresh tokens
│   │   ├── users/        # User management & roles
│   │   ├── properties/   # Property registration & tracking
│   │   ├── assignments/  # Department & staff assignments
│   │   ├── contracts/    # Lease & trade contracts
│   │   ├── reports/      # Dashboard & export logic
│   │   └── common/       # Shared decorators, pipes, filters
│   └── test/
└── frontend/         # React + Tailwind CSS
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── hooks/
    │   └── services/     # API client layer
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### 1. Clone the repository

```bash
git clone https://github.com/Sajjad-Matin/Real-Estate-Management-System.git
cd Real-Estate-Management-System
```

### 2. Set up the Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```dotenv
DATABASE_URL=postgresql://user:password@localhost:5432/rems
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
PORT=3000
SMTP_PORT=587
```

Run database migrations and start the server:

```bash
npm run migration:run
npm run start:dev
```

### 3. Set up the Frontend

```bash
cd ../frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`
The API will be available at `http://localhost:3000`

---

## 🧪 Running Tests

```bash
cd backend

# Unit tests
npm run test

# End-to-end tests
npm run test:e2e

# Test coverage report
npm run test:cov
```

---

## 👥 Roles & Permissions

| Feature                  | Admin | Officer | Viewer |
|--------------------------|:-----:|:-------:|:------:|
| Register properties      | ✅    | ✅      | ❌     |
| Assign to departments    | ✅    | ✅      | ❌     |
| Manage contracts         | ✅    | ✅      | ❌     |
| View reports             | ✅    | ✅      | ✅     |
| Manage users             | ✅    | ❌      | ❌     |
| Export reports           | ✅    | ✅      | ❌     |

---

## 🔌 API Overview

| Method | Endpoint                  | Description                  | Auth     |
|--------|---------------------------|------------------------------|----------|
| POST   | `/auth/login`             | Login & get tokens           | Public   |
| POST   | `/auth/refresh`           | Refresh access token         | Public   |
| GET    | `/properties`             | List all properties          | Required |
| POST   | `/properties`             | Register new property        | Admin/Officer |
| GET    | `/properties/:id`         | Get property details         | Required |
| POST   | `/assignments`            | Assign property to dept.     | Admin/Officer |
| GET    | `/contracts`              | List all contracts           | Required |
| POST   | `/contracts`              | Create new contract          | Admin/Officer |
| GET    | `/reports/dashboard`      | Get dashboard stats          | Required |

---

## 🛣️ Roadmap

- [ ] Docker & Docker Compose setup
- [ ] PDF contract generation
- [ ] Audit log for all property changes
- [ ] Notifications via email (SMTP ready)
- [ ] Advanced filtering & search across properties

---

## 👨‍💻 Author

**Sajjad Matin**
- Portfolio: [my-portfolio-vert-seven.vercel.app](https://my-portfolio-vert-seven.vercel.app)
- LinkedIn: [sajjad-matin-mahmodi](https://linkedin.com/in/sajjad-matin-mahmodi-4308602b5)
- Email: sajjadmatinm@gmail.com

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
