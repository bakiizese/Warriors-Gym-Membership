# Warriors Gym Membership System

[![CI](https://github.com/bakiizese/Warriors-Gym-Membership/actions/workflows/ci.yml/badge.svg)](https://github.com/bakiizese/Warriors-Gym-Membership/actions/workflows/ci.yml)
[![CodeQL](https://github.com/bakiizese/Warriors-Gym-Membership/actions/workflows/codeql.yml/badge.svg)](https://github.com/bakiizese/Warriors-Gym-Membership/actions/workflows/codeql.yml)
[![Secret scan](https://github.com/bakiizese/Warriors-Gym-Membership/actions/workflows/secrets.yml/badge.svg)](https://github.com/bakiizese/Warriors-Gym-Membership/actions/workflows/secrets.yml)

## Overview

Warriors Gym Membership System is a comprehensive gym management platform designed to streamline membership management, user engagement, and administrative operations. The project consists of a backend service, an administrative web application, and a mobile application for gym members.

## Project Structure

```text
Warriors-Gym-Membership/
│
├── admin-frontend/
│   ├── Web Application
│   └── Mobile Application for Administrators
│
├── backend/
│   └── Backend API and Business Logic
│
├── mobile/
│   └── Mobile Application for Gym Members
│
└── README.md
```

### Components

#### 1. Admin Frontend (`admin-frontend/`)

The administrative interface used by gym staff and administrators to manage the platform.

Features may include:

* Member management
* Membership plan management
* Attendance monitoring
* Payment tracking
* Reports and analytics
* Notifications and announcements
* Administrative dashboard

This directory contains both the web-based admin panel and the administrator mobile application.

#### 2. Backend (`backend/`)

The core engine of the system responsible for handling:

* Authentication and authorization
* Membership management
* User management
* Payment processing
* Attendance records
* Notifications
* Database operations
* RESTful APIs

The backend serves both the admin applications and the member mobile application.

#### 3. Mobile Application (`mobile/`)

The mobile application designed for gym members.

Features may include:

* User registration and login
* Membership status tracking
* Workout schedules
* Membership renewal
* Payment history
* Notifications and updates
* Profile management

## Technology Stack

### Frontend

* Web Technologies (React, Next.js, or equivalent)
* Mobile Technologies (React Native, Flutter, or equivalent)

### Backend

* Node.js / Express
* REST API
* Database Management System

## Getting Started

### Run everything with Docker (recommended)

You need Docker with the Compose plugin. One command starts PostgreSQL, the API and the admin web app, with sample data and demo logins already loaded.

```bash
git clone https://github.com/bakiizese/Warriors-Gym-Membership.git
cd Warriors-Gym-Membership
make up            # or: docker compose up --build -d
```

| What | Where |
| --- | --- |
| Admin web app | http://localhost:8080 |
| API docs (Swagger UI) | http://localhost:5000/docs |
| Demo admin login | `0900000001` / `demo1234` |
| Demo member login | `0911000001` / `demo1234` |

Common commands (run `make help` for all of them):

| Command | What it does |
| --- | --- |
| `make dev` | Hot reload for the API (nodemon) and web admin (Vite, http://localhost:5173) |
| `make test` | Run the backend test suite in a container |
| `make reseed` | Wipe the database and reload the sample data |
| `make down` / `make clean` | Stop the stack / stop it and delete its data |

Ports, the database password and the JWT secret can be overridden with a `.env` file; copy [.env.example](.env.example).

### Run without Docker

- **Backend:** see [backend/README.md](backend/README.md) (Node 20+, PostgreSQL).
- **Admin web:** `cd admin-frontend/web && cp .env.example .env && npm ci && npm run dev`
- **Mobile apps** (`admin-frontend/mobile` for admins, `mobile` for members): `cp .env.example .env`, set `EXPO_PUBLIC_ADDRESS` to your machine's LAN IP (a phone cannot reach `localhost`), then `npm ci && npx expo start`.

The mobile apps run on a device or emulator rather than in a container.

## System Architecture

```text
                    ┌─────────────────┐
                    │     Backend     │
                    │   RESTful API   │
                    └────────┬────────┘
                             │
             ┌───────────────┼───────────────┐
             │                               │
             ▼                               ▼
    ┌────────────────┐             ┌────────────────┐
    │ Admin Frontend │             │ User Mobile App│
    │ Web & Mobile   │             │ Gym Members    │
    └────────────────┘             └────────────────┘
```

## Key Features

* Secure Authentication
* Membership Management
* Attendance Tracking
* Payment Management
* Notification System
* Admin Dashboard
* Mobile Access for Members
* Scalable Architecture

## Preview

### Admin
| Admin Dashboard | Mobile Home |
|----------------|------------|
<img width="1080" height="2340" alt="Screenshot_20260601_082250_Warriors-Admin" src="https://github.com/user-attachments/assets/76237eb8-0ec1-4e3e-9547-3a80e5e9f52a" />
<img width="1080" height="2340" alt="Screenshot_20260601_082257_Warriors-Admin" src="https://github.com/user-attachments/assets/07f59d1f-7c1f-4af1-8329-ee64b6bae5bf" />
<img width="1080" height="2340" alt="Screenshot_20260601_082309_Warriors-Admin" src="https://github.com/user-attachments/assets/3fb8779b-656b-4c4d-90e6-96e8a74c8b47" />


### Member
| Member Management | Payments |
|------------------|----------|
<img width="1080" height="2340" alt="Screenshot_20260601_082406_Warriors" src="https://github.com/user-attachments/assets/9725f388-a800-4cdf-8b23-e5e3a97129ab" />
<img width="1080" height="2340" alt="Screenshot_20260601_082410_Warriors" src="https://github.com/user-attachments/assets/f17e983b-5a1c-4cb2-b998-4b013b8b5357" />
<img width="1080" height="2340" alt="Screenshot_20260601_082430_Warriors" src="https://github.com/user-attachments/assets/383c6add-bb8b-4dcb-affd-fe1abd200372" />
<img width="1080" height="2340" alt="Screenshot_20260601_082507_Warriors" src="https://github.com/user-attachments/assets/261a721b-949d-46b7-8984-f9ddc40f93bc" />
<img width="1080" height="2969" alt="Screenshot_20260601_082512_Warriors" src="https://github.com/user-attachments/assets/364830d7-f44f-42d6-9981-87638128fdc8" />
<img width="1080" height="2340" alt="Screenshot_20260601_082537_Warriors" src="https://github.com/user-attachments/assets/d0edb0fa-527f-4589-a107-5ca46b4f114b" />

## Contributing

Contributions are welcome. Please create a feature branch, commit your changes, and submit a pull request for review.

## License

This project is licensed under the MIT License.


