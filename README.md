# E‑Recruitment Platform

Multi‑tenant e‑recruitment platform consisting of:
- **Backend API**: ASP.NET Core Web API with Entity Framework Core and SQL Server
- **Frontend**: Angular 21 SPA with Angular Material
- **Public Career Portal**: Anonymous candidate‑facing pages for job browsing and application

The system is designed for SaaS‑style tenant separation, full recruitment lifecycle management, and auditability.

- Backend root: `e:\Kamrul\Recruitment`
- Frontend root: `e:\Kamrul\erecruitment-web`

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [API Documentation (Swagger)](#api-documentation-swagger)
- [Database Schema Overview](#database-schema-overview)
- [Configuration](#configuration)
- [Local Development Setup](#local-development-setup)
  - [Backend (API)](#backend-api)
  - [Frontend (Angular)](#frontend-angular)
- [Core Domain Modules and Endpoints](#core-domain-modules-and-endpoints)
  - [Authentication](#authentication)
  - [Tenants and SaaS Admin](#tenants-and-saas-admin)
  - [Candidates](#candidates)
  - [Jobs](#jobs)
  - [Applications and Pipeline](#applications-and-pipeline)
  - [Interviews](#interviews)
  - [Tenant Settings](#tenant-settings)
  - [Audit Logs](#audit-logs)
  - [Public Career Portal](#public-career-portal)
- [Frontend Application Structure](#frontend-application-structure)
- [Deployment Guidelines](#deployment-guidelines)
- [Testing](#testing)
- [Contribution Guidelines](#contribution-guidelines)
- [License](#license)
- [Contact & Support](#contact--support)

---

## Overview

The E‑Recruitment Platform provides:
- Multi‑tenant recruitment management (SaaS‑ready)
- Candidate profile and CV management
- Job posting management with statuses (Draft / Published / Closed)
- Job applications, salary expectations, and experience tracking
- Interview rounds, scheduling, and feedback
- Configurable pipeline stages and email templates
- Tenant‑specific branding and theme settings
- Audit logs for key actions (status changes, user actions, etc.)
- Public career portal for candidates to browse jobs and apply online

---

## Architecture

- **Backend**
  - Project: `ERecruitment.API` ([Program.cs](file:///e:/Kamrul/Recruitment/src/ERecruitment.API/Program.cs))
  - Clean separation into:
    - `ERecruitment.Domain` – entities and domain primitives
    - `ERecruitment.Application` – abstractions (`IApplicationDbContext`, `IAuditLogger`, `IEmailNotificationService`, tenancy, time)
    - `ERecruitment.Infrastructure` – EF Core DbContext, migrations, auditing, email, tenancy implementation
  - Multi‑tenant via:
    - `ApplicationDbContext` with `TenantId` on entities and global query filter
    - `TenantProvider` + `ITenantContext` to hold current tenant
    - `TenantResolutionMiddleware` to resolve tenant from JWT claims for secured APIs
  - Authentication & Authorization:
    - JWT Bearer with roles: `Admin`, `Recruiter`, `HiringManager`, `SuperAdmin`
    - Custom `JwtTokenService` to issue tokens
  - Auditing:
    - `AuditLog` entity and `IAuditLogger` used across controllers

- **Frontend**
  - Angular standalone app bootstrap:
    - [main.ts](file:///e:/Kamrul/erecruitment-web/src/main.ts)
    - [app.config.ts](file:///e:/Kamrul/erecruitment-web/src/app/app.config.ts)
    - [app.routes.ts](file:///e:/Kamrul/erecruitment-web/src/app/app.routes.ts)
  - Authentication:
    - `AuthService` + `AuthStorageService` with JWT stored in `localStorage`
    - `authInterceptor` attaches `Authorization: Bearer <token>` to API calls (excluding `/api/public/*`)
    - `authGuard` restricts access to private routes
  - Main layout:
    - `ShellComponent` with sidenav/menu items filtered by role
  - UI: Angular Material‑based pages for dashboard, candidates, jobs, applications, users, settings, audit logs, branding, and SaaS tenant admin.

---

## Technology Stack

- **Backend**
  - .NET / ASP.NET Core Web API
  - Entity Framework Core (code‑first)
  - SQL Server (LocalDB by default)
  - JWT authentication
  - SMTP email (configurable)
  - Swagger / Swashbuckle (`AddSwaggerGen`)

- **Frontend**
  - Angular 21
  - Angular Material (CDK, Material components)
  - RxJS
  - TypeScript

- **Tooling**
  - Angular CLI
  - Vitest (Angular testing integration)

---

## API Documentation (Swagger)

The backend exposes OpenAPI/Swagger docs.

- Swagger is configured in [`SwaggerExtensions`](file:///e:/Kamrul/Recruitment/src/ERecruitment.API/SwaggerExtensions.cs) and enabled in [`Program.cs`](file:///e:/Kamrul/Recruitment/src/ERecruitment.API/Program.cs).
- When running the API in Development:
  - HTTP URL (per `launchSettings.json`): `http://localhost:5263/swagger`
  - HTTPS URL: typically `https://localhost:7289/swagger`
  - The Swagger UI path is `/swagger/index.html`

> If you are running behind a different port (e.g. `http://localhost:5000/swagger/index.html`), adjust URLs accordingly.

### Swagger Security

- Security scheme: **Bearer JWT**
- Header: `Authorization: Bearer <token>`
- Many endpoints require:
  - `Admin`, `Recruiter`, or `HiringManager` (tenant admins and recruiters)
  - `SuperAdmin` (for SaaS‑level tenant management)
  - `Admin` for audit logs and some settings

---

## Database Schema Overview

Database: SQL Server (LocalDB by default) configured under `"ConnectionStrings:DefaultConnection"` in [`appsettings.json`](file:///e:/Kamrul/Recruitment/src/ERecruitment.API/appsettings.json).

At a high level:

- **Common base types**
  - `AuditableEntity`
    - `Id` (`Guid`)
    - `CreatedAt` (`DateTimeOffset`)
    - `UpdatedAt` (`DateTimeOffset`)
  - `BaseEntity : AuditableEntity`
    - `TenantId` (`Guid`) – enforces per‑tenant segregation

- **Core entities**
  - `Tenant`
    - `Id`, `Name`, `Slug`, `IsActive`, `Plan`, `BillingEmail`, `CreatedAt`, `DisabledAt`
  - `AppUser`
    - Authentication and role data for users
    - `TenantId` nullable for `SuperAdmin`
  - `Candidate`
    - Personal info, contact, experience, education, salary expectations
    - Resume metadata (file name, content type, size, URL)
  - `JobPosting`
    - `Title`, `Department`, `Location`, `Description`, `Status` (`Draft/Published/Closed`)
  - `JobApplication`
    - `CandidateId`, `JobPostingId`, `Status`, `Notes`
    - `ExpectedSalary`, `SalaryCurrency`
    - CV snapshot columns (`ResumeUrlSnapshot`, etc.)
  - `JobApplicationStatusHistory`
    - Historical status transitions for applications
  - `InterviewRound`, `Interview`, `InterviewParticipant`, `InterviewFeedback`
    - Interview pipeline for applications, participants per interview, ratings and decisions
  - `TenantSettings`
    - Company‑level settings: company name, primary color, career page enabled, file upload limits, allowed resume types, timezone
  - `TenantThemeSettings`
    - Branding: logo, favicon, primary/secondary/background colors, font, template, optional custom CSS
  - `PipelineStage`
    - Configurable pipeline stages (Submitted, Reviewed, Shortlisted, Rejected, Hired)
  - `EmailTemplate`, `EmailLog`
    - Email templates and sent email tracking
  - `AuditLog`
    - Action, entity type / id, actor user, summary, data JSON, IP, user agent

Entity mappings, indexes, and tenant filters are defined in [`ApplicationDbContext`](file:///e:/Kamrul/Recruitment/src/ERecruitment.Infrastructure/Persistence/ApplicationDbContext.cs).

---

## Configuration

All backend configuration lives primarily in:
- [`appsettings.json`](file:///e:/Kamrul/Recruitment/src/ERecruitment.API/appsettings.json)
- `appsettings.Development.json` (if present)
- Environment variables (override configuration as needed)

### Connection Strings

Key: `ConnectionStrings:DefaultConnection`

Example (LocalDB):
```json
"ConnectionStrings": {
  "DefaultConnection": "Server=(localdb)\\MSSQLLocalDB;Database=ERecruitmentDb;Trusted_Connection=True;TrustServerCertificate=True;"
}
```

### JWT Settings

Key: `Jwt`

```json
"Jwt": {
  "Issuer": "ERecruitment",
  "Audience": "ERecruitment",
  "Key": "<long_random_secret>",
  "AccessTokenMinutes": 120
}
```

- `Key` must be a long, random secret in production.
- The token is generated by [`JwtTokenService`](file:///e:/Kamrul/Recruitment/src/ERecruitment.API/Security/JwtTokenService.cs).

### SMTP / Email

Key: `Smtp`

```json
"Smtp": {
  "Host": "smtp.example.com",
  "Port": 587,
  "User": "<smtp_user>",
  "Pass": "<smtp_password>",
  "FromEmail": "no-reply@example.com",
  "FromName": "ERecruitment",
  "UseStartTls": true
}
```

> Do **not** commit real credentials. For development, use user‑secrets or environment variables.

### CORS

In [`Program.cs`](file:///e:/Kamrul/Recruitment/src/ERecruitment.API/Program.cs), a CORS policy named `"AllowAngular"` allows:
- Origin: `http://localhost:4200`
- Any header, any method

Adjust this for other environments/frontends as needed.

### Frontend Environment

Angular environment is defined in [`src/environments/environment.ts`](file:///e:/Kamrul/erecruitment-web/src/environments/environment.ts):

```ts
export const environment = {
  production: false,
  apiBaseUrl: 'https://localhost:7289'
};
```

Update `apiBaseUrl` to point to your deployed API base URL in production builds or custom environments.

---

## Local Development Setup

### Prerequisites

- .NET SDK (matching the version used in `ERecruitment.sln`)
- SQL Server / LocalDB
- Node.js and npm
- Angular CLI (globally or via `npx`)

### Backend (API)

1. Navigate to the backend solution:

   ```bash
   cd e:\Kamrul\Recruitment
   ```

2. Ensure database is created and migrations are applied (via `dotnet ef database update` or from your IDE).

3. Run the API (from `ERecruitment.API`):

   ```bash
   dotnet run --project src/ERecruitment.API/ERecruitment.API.csproj
   ```

4. The API will start on the URLs configured in `launchSettings.json` (e.g. `https://localhost:7289`, `http://localhost:5263`).

5. Open Swagger UI:
   - `https://localhost:7289/swagger`  
     or  
   - `http://localhost:5263/swagger`

### Frontend (Angular)

1. Install dependencies:

   ```bash
   cd e:\Kamrul\erecruitment-web
   npm install
   ```

2. Start the dev server:

   ```bash
   npm start
   # or
   ng serve
   ```

3. Open the SPA:
   - `http://localhost:4200`

Ensure `environment.apiBaseUrl` matches the running backend URL (including protocol and port).

---

## Core Domain Modules and Endpoints

Below is a high‑level overview of the main API modules. For full details, use Swagger.

### Authentication

Controller: [`AuthController`](file:///e:/Kamrul/Recruitment/src/ERecruitment.API/Controllers/AuthController.cs)

- `POST /api/Auth/register`
  - Register a tenant user (Admin/Recruiter/HiringManager) for an existing tenant slug.
- `POST /api/Auth/login`
  - Tenant user login (requires `tenantSlug`, `email`, `password`).
  - Returns JWT and user/tenant info.
- `POST /api/Auth/superadmin/login`
  - SuperAdmin login (no tenant slug; `TenantId` claim is `null`).

Frontend integration: [`AuthService`](file:///e:/Kamrul/erecruitment-web/src/app/core/services/auth.service.ts), login and superadmin login pages in `src/app/pages/auth`.

### Tenants and SaaS Admin

Controller: [`TenantsController`](file:///e:/Kamrul/Recruitment/src/ERecruitment.API/Controllers/TenantsController.cs) (SuperAdmin‑only)

- `GET /api/Tenants`
  - List tenants with counts of users, jobs, applications.
- `POST /api/Tenants/create-with-admin`
  - Create a tenant and its first Admin user.
- `PUT /api/Tenants/{id}/disable`
- `PUT /api/Tenants/{id}/enable`

Frontend SaaS admin: `SaasTenantsService` and `saas-tenants` pages.

### Candidates

Controller: [`CandidatesController`](file:///e:/Kamrul/Recruitment/src/ERecruitment.API/Controllers/CandidatesController.cs)

- `GET /api/Candidates`
  - List candidates (tenant filtered).
- `GET /api/Candidates/{id}`
  - Get a single candidate.
- `POST /api/Candidates`
  - Create candidate (full profile).
- `PUT /api/Candidates/{id}`
  - Update candidate.
- `DELETE /api/Candidates/{id}`
  - Delete candidate.
- `POST /api/Candidates/{id}/resume`
  - Upload candidate resume file (CV).

Frontend: `CandidatesService` + `Candidates` list and `CandidateDialog` for create/edit; CV upload and open via Angular Material dialogs and buttons.

### Jobs

Controller: [`JobsController`](file:///e:/Kamrul/Recruitment/src/ERecruitment.API/Controllers/JobsController.cs)

- `GET /api/Jobs`
  - List tenant jobs.
- `GET /api/Jobs/{id}`
- `POST /api/Jobs`
  - Create job posting.
- `PUT /api/Jobs/{id}`
  - Update job posting.
- `DELETE /api/Jobs/{id}`

Frontend: `JobsService` + jobs page for CRUD and status control.

### Applications and Pipeline

Controller: [`ApplicationsController`](file:///e:/Kamrul/Recruitment/src/ERecruitment.API/Controllers/ApplicationsController.cs)

- `GET /api/Applications`
  - All applications (tenant scoped).
- `GET /api/Applications/{id}`
- `GET /api/Applications/by-job/{jobId}`
- `GET /api/Applications/by-candidate/{candidateId}`
- `POST /api/Applications`
  - Create application (requires existing candidate with CV and job posting).
- `PUT /api/Applications/{id}/status`
  - Update status (Submitted, Reviewed, Shortlisted, Rejected, Hired) and append history.
- `DELETE /api/Applications/{id}`
- `GET /api/Applications/{id}/history`
  - Status history for an application.
- `POST /api/jobs/{jobId}/applications/search`
  - Search applications for a specific job with filters (status, salary, experience, paging).

> The Angular `ApplicationsService` also calls `POST /api/Applications/search` for global search; ensure the matching endpoint exists and is wired to the same search logic as the job‑specific search.

Frontend:
- Dashboard metrics using `ApplicationsService.search` for counts (total applications, hires).
- `ApplicationsComponent` with:
  - Global search tab
  - By‑job pipeline tab
  - Filters: status, keyword, salary range, experience range, sort options.
  - Dialogs for status update, history, and details.

### Interviews

Controller: [`InterviewsController`](file:///e:/Kamrul/Recruitment/src/ERecruitment.API/Controllers/InterviewsController.cs)

- `GET /api/Interviews/get-by-application/{appId}`
  - Returns rounds, interviews, participants, and feedbacks.
- `POST /api/Interviews/createRound`
- `POST /api/Interviews/createSchedule`
- `PUT /api/Interviews/{id}/cancel`
- `PUT /api/Interviews/{id}/complete`
- `PUT /api/Interviews/{id}/feedback`
  - Submit/update interview feedback; Admins bypass participant check, others must be participants.

Frontend:
- `InterviewsService`
- `ApplicationInterviewsComponent` inside application details dialog, with dialogs for creating rounds, scheduling interviews, and submitting feedback.

### Tenant Settings

Controller: [`SettingsController`](file:///e:/Kamrul/Recruitment/src/ERecruitment.API/Controllers/SettingsController.cs) (Admin‑only)

- `GET /api/Settings/get-all`
  - Returns:
    - `settings` (tenant settings)
    - `pipelineStages`
    - `emailTemplates`
  - Seeds default pipeline stages and email templates when missing.
- `PUT /api/Settings/update`
  - Update tenant settings.
- `POST /api/Settings/pipeline-stages/createStage`
- `PUT /api/Settings/pipeline-stages/updateStage/{id}`
- `PUT /api/Settings/pipeline-stages/updateToggleStage/{id}/toggle`
- `PUT /api/Settings/email-templates/updateEmailTemplates`

Controller: [`TenantSettingsController`](file:///e:/Kamrul/Recruitment/src/ERecruitment.API/Controllers/PublicTenantsController.cs)

- `GET /api/TenantSettings/theme`
  - Get tenant theme (creating defaults if missing).
- `PUT /api/TenantSettings/theme`
  - Update branding and theme.
- `POST /api/TenantSettings/theme/logo`
  - Upload logo (stored in `wwwroot/uploads/{tenantId}/branding/logo.ext`).

Frontend:
- `SettingsService` + settings page for pipeline stages and email templates.
- `TenantThemeService` + `BrandingSettings` page for branding and theme configuration.

### Audit Logs

Controller: [`AuditLogsController`](file:///e:/Kamrul/Recruitment/src/ERecruitment.API/Controllers/AuditLogsController.cs) (Admin‑only)

- `POST /api/AuditLogs/search`
  - Body: `AuditLogSearchRequest` (from, to, action, entityType, entityId, actorUserId, keyword, page, pageSize).
  - Response: `{ total, page, pageSize, items }`.
- `GET /api/AuditLogs/{id}`
  - Detail of a specific audit entry.

Frontend:
- `AuditLogsService` with `search` and `getById`.
- `AuditLogsComponent` with filters, table, pagination.
- `AuditDetailsDialogComponent` for viewing details of a single audit log.

### Public Career Portal

Controller: [`PublicCareerController`](file:///e:/Kamrul/Recruitment/src/ERecruitment.API/Controllers/PublicCareerController.cs) (anonymous)

Base route: `/api/public/{tenantSlug}`

- `GET /api/public/{tenantSlug}/jobs/get-all`
  - List published jobs for the given tenant slug.
- `GET /api/public/{tenantSlug}/jobs/{jobId}`
  - Get published job details.
- `POST /api/public/{tenantSlug}/jobs/{jobId}/apply`
  - Candidate applies with multipart form including resume; creates/updates `Candidate`, uploads resume to `wwwroot/uploads`, and creates `JobApplication`.

Theme for the public portal is loaded via:
- `GET /api/public/{tenantSlug}/theme` (exposed by the backend and consumed by `PublicCareerService.theme`).

Frontend:
- `PublicCareerService` (uses `/api/public/{slug}/...` endpoints).
- `PublicJobsComponent` (`/t/:slug/jobs`) – job listing with theme.
- `PublicJobDetailsComponent` (`/t/:slug/jobs/:id`) – job detail and application form (with file upload).
- `ThemeService` – applies tenant theme (CSS variables) to the public pages.

---

## Frontend Application Structure

Key folders under [`src/app`](file:///e:/Kamrul/erecruitment-web/src/app):

- `core/`
  - `guards/` – `auth.guard.ts`
  - `interceptors/` – `auth.interceptor.ts`
  - `models/` – shared interfaces (`LoginRequest`, `JobPosting`, `JobApplication`, `Candidate`, `ApplicationFilterQuery`, etc.)
  - `services/` – API wrappers:
    - `auth.service.ts`, `auth-storage.service.ts`
    - `candidates.service.ts`, `jobs.service.ts`, `applications.service.ts`
    - `interviews.service.ts`, `users.service.ts`
    - `settings.service.ts`, `tenant-theme.service.ts`
    - `audit-logs.service.ts`
    - `saas-tenants.service.ts`
    - `public-career.service.ts`

- `layout/`
  - `shell/` – app shell, navigation, and role‑based menu.

- `pages/`
  - `dashboard/` – high‑level metrics (candidates count, jobs by status, applications totals, hires).
  - `candidates/` – list and edit dialogs.
  - `jobs/` – job list and job dialog.
  - `applications/` – applications list, details, status updates, history, interviews.
  - `users/` – user management with reset password dialog.
  - `settings/` – tenant settings, pipeline stages, email templates; branding page.
  - `audit-logs/` – audit logs list and details dialog.
  - `auth/` – login and superadmin login pages.
  - `saas/tenants/` – SaaS tenants admin (SuperAdmin role).

- `public/`
  - `public-jobs/` – public jobs listing per tenant slug.
  - `public-job-details/` – job details and application form for public candidates.

Routing is defined in [`app.routes.ts`](file:///e:/Kamrul/erecruitment-web/src/app/app.routes.ts). All authenticated routes are children of the `ShellComponent` and protected by `authGuard`.

---

## Deployment Guidelines

### Backend Deployment

- Build and publish the API:

  ```bash
  dotnet publish src/ERecruitment.API/ERecruitment.API.csproj -c Release -o ./publish
  ```

- Host in IIS, Kestrel behind Nginx/Apache, Docker, or any .NET hosting environment.
- Configure:
  - `ConnectionStrings:DefaultConnection` for your production SQL Server.
  - Strong `Jwt:Key`.
  - `Smtp` section for a real mail server (or disable email notifications if not required).
  - `AllowedHosts` and CORS origins for the frontend.
- Ensure `wwwroot/uploads` is persisted and has write access for the app user (for resumes and branding assets).

### Frontend Deployment

- Build the Angular app:

  ```bash
  cd e:\Kamrul\erecruitment-web
  ng build --configuration production
  ```

- The output will be in `dist/erecruitment-web/`.
- Serve the SPA behind a static web server (IIS, Nginx, Apache, Azure Static Web Apps, etc.).
- Set `environment.apiBaseUrl` for production (or use runtime configuration) so the frontend can reach the correct API URL over HTTPS.

### Public URLs

- Internal admin SPA: e.g. `https://yourdomain.com/` (served by Angular)
- Public career portal:
  - `https://yourdomain.com/t/{tenantSlug}/jobs`
  - `https://yourdomain.com/t/{tenantSlug}/jobs/{jobId}`

Ensure your reverse proxy routes `/api/*` to the backend and `/` to the Angular static files.

---

## Testing

### Backend

- Use standard .NET testing tools (xUnit/NUnit/MSTest) if test projects are added.
- To validate migrations and database:
  - Apply migrations and run the app.
  - Manually test critical flows via Swagger (auth, tenants, candidates, jobs, applications, interviews, audit logs, public career).

### Frontend

Testing is configured using Angular’s integration with **Vitest**.

- Run unit tests:

  ```bash
  cd e:\Kamrul\erecruitment-web
  npm test
  # or
  ng test
  ```

- Component tests are co‑located with components (e.g. `*.spec.ts` next to the component).

End‑to‑end (e2e) tests are not preconfigured; you can integrate Playwright, Cypress, or another framework if required.

---

## Contribution Guidelines

- Follow existing patterns for:
  - Controllers (attribute routing, DTOs, validation)
  - EF Core usage (use `IApplicationDbContext`, respect tenant filters)
  - Auditing via `IAuditLogger` for significant changes
  - Angular services (one service per backend module), using `environment.apiBaseUrl`
  - Angular components (standalone components, Angular Material style)
- Do **not** log or commit secrets (JWT keys, SMTP passwords, connection strings).
- When adding new API endpoints:
  - Add routing attributes, validation, and authorization attributes.
  - Consider multi‑tenant behavior and tenant filtering.
  - Update Swagger documentation (XML comments or conventions) if needed.
- When adding new frontend features:
  - Add a dedicated service method for new API endpoints.
  - Wire them into components via reactive forms and Angular Material patterns already used.

---

## License

This project is currently private and does not specify an open‑source license.  
If you plan to open‑source or distribute it, add an appropriate license (e.g. MIT, Apache‑2.0) here.

---

## Contact & Support

- **Author/Maintainer**: Kamrul (as inferred from repository paths and configuration)
- **Email**: configure and use your own contact/support email for production deployments.
- **Technical Support**:
  - Backend/API issues: check logs, database connectivity, and configuration (`appsettings.json`, environment variables).
  - Frontend issues: check browser console, network calls to `/api/*`, and environment configuration (`environment.ts`).

For change requests or enhancements, open an issue in your version control system or coordinate with the project maintainer.
