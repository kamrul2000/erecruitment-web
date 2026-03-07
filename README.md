# E-Recruitment Platform (Multi-Tenant SaaS)


A multi-tenant SaaS recruitment management platform that manages the full hiring lifecycle — from job posting and candidate applications to interview scheduling and hiring decisions.
## The platform includes:

- Admin recruitment dashboard

- Multi-tenant architecture

- Candidate management

- Job pipeline tracking

- Interview scheduling

- Public career portal for applicants

## 📌 Key Features
🏢 Multi-Tenant SaaS Architecture

- Tenant-based data isolation

- SuperAdmin tenant management

- Tenant branding and theme configuration

- Tenant-specific career portal

👥 Candidate Management

- Candidate profiles

- Resume upload and storage

- Experience and salary tracking
  
💼 Job Management

Create and manage job postings

Status lifecycle:

- Draft

- Published

- Closed

📊 Application Pipeline

- Application tracking

- Configurable pipeline stages

- Status history tracking

- Filtering and search

🎤 Interview Management

- Interview rounds

- Scheduling

- Interview participants

- Interview feedback and ratings

🌐 Public Career Portal

- Public job listings

- Candidate application form

- Resume upload

- Tenant-based branding

🔐 Security

- JWT authentication

- Role-based access control

Roles:

- SuperAdmin

- Admin

- Recruiter

- HiringManager

📜 Audit Logs

Tracks system activities such as:

- Job changes

- Application updates

- Status transitions

- User actions


## 🏗 System Architecture
Angular SPA (Admin Dashboard)
        │
        │ REST API
        ▼
ASP.NET Core Web API
        │
        │ Entity Framework Core
        ▼
SQL Server Database


Additional Components

Public Career Portal
        │
        ▼
ASP.NET API
        │
        ▼
Resume Storage (wwwroot/uploads)

