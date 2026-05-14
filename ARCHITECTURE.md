# Architecture Overview
This document serves as a critical, living template designed to equip agents with a rapid and comprehensive understanding of the codebase's architecture.

## 1. Project Structure

[Project Root]/
├── backend/              # FastAPI application
│   ├── main.py           # API endpoints and logic
│   ├── models.py         # SQLAlchemy database models
│   ├── schemas.py        # Pydantic validation schemas
│   ├── database.py       # Database connection and init
│   └── requirements.txt  # Python dependencies
├── frontend/             # Next.js application
│   ├── app/              # App router pages
│   ├── components/       # Reusable UI components
│   ├── types.ts          # Shared TS interfaces
│   └── package.json      # Frontend dependencies
├── tests/                # Pytest suite for backend
├── README.md             # Setup guide
└── ARCHITECTURE.md       # This document

## 2. High-Level System Diagram
 
[User] <--> [Frontend (Next.js)] <--> [Backend (FastAPI)] <--> [SQLite Database]

## 3. Core Components

### 3.1. Frontend
Name: JobBoard Pro Web App
Description: The user interface for browsing jobs, applying, and managing the application pipeline.
Technologies: Next.js (React), Tailwind CSS, Lucide Icons.
Deployment: Local Environment.

### 3.2. Backend Services
#### 3.2.1. JobBoard API
Name: FastAPI Backend
Description: Handles job CRUD, application submission, and status workflow logic.
Technologies: Python, FastAPI, SQLAlchemy.
Deployment: Local Environment.

## 4. Data Stores
### 4.1. Primary Database
Name: SQLite Database
Type: SQLite
Purpose: Stores Jobs, Applications, and Application History.
Key Schemas: jobs, applications, application_history.

## 5. External Integrations / APIs
None.

## 6. Deployment & Infrastructure
Local development only.

## 7. Security Considerations
Authentication: None (Trust-based per requirements).
Authorization: None.
Data Encryption: None.

## 8. Development & Testing Environment
Local Setup Instructions: See README.md.
Testing Frameworks: Pytest.
Code Quality Tools: ESLint (Frontend).

## 9. Future Considerations / Roadmap
- Implement Authentication.
- Add CV file uploads (currently summary only).

## 10. Project Identification
Project Name: JobBoard Pro
Repository URL: [To be provided by user]
Date of Last Update: 2026-05-14

## 11. Glossary / Acronyms
- **JWT**: JSON Web Token (Not used in this version).
- **ORM**: Object Relational Mapping (SQLAlchemy).
