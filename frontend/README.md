# RailSuite

RailSuite is a modern web application for managing canteens, meal plans, customers, employees, memberships and registrations.

The application is designed as a modular, containerized system with a Java/Spring Boot backend, a React frontend, PostgreSQL as the persistence layer and Keycloak for authentication and identity management.

The architecture is designed with Docker and Kubernetes deployment in mind.

---

## Table of Contents

* [Overview](#overview)
* [Features](#features)
* [Architecture](#architecture)
* [Technology Stack](#technology-stack)
* [Project Structure](#project-structure)
* [Authentication and Authorization](#authentication-and-authorization)
* [Registration Workflow](#registration-workflow)
* [Backend](#backend)
* [Frontend](#frontend)
* [Database](#database)
* [Keycloak](#keycloak)
* [Docker](#docker)
* [Kubernetes](#kubernetes)
* [Configuration](#configuration)
* [Local Development](#local-development)
* [API](#api)
* [Development Workflow](#development-workflow)
* [Testing](#testing)
* [Production Considerations](#production-considerations)
* [Security](#security)
* [Troubleshooting](#troubleshooting)
* [Future Improvements](#future-improvements)
* [License](#license)

---

# Overview

RailSuite is intended to provide a central platform for managing one or more canteens.

The system separates identity management from application data:

* Keycloak manages authentication and identity.
* The RailSuite backend manages application users, memberships, canteens and business logic.
* PostgreSQL stores application data.
* The React frontend provides the user interface.
* Docker packages the individual application components.
* Kubernetes can be used to deploy and operate the application in a containerized environment.

The application follows the principle that authentication and authorization should not be implemented manually inside the frontend.

Instead, Keycloak issues OAuth2/OIDC tokens which are validated by the backend.

---

# Features

## User Management

* Keycloak-based authentication
* Application user synchronization
* User profiles
* Customer management
* Employee management
* Membership management
* Role and membership based access
* First-login registration workflow

## Canteen Management

* Multiple canteens
* Canteen selection
* Canteen-specific memberships
* Management of customers assigned to canteens
* Management of employees assigned to canteens

## Registration Codes

Registration codes can be created for specific membership types and canteens.

A registration code contains:

* Code
* Membership type
* Canteen
* Expiration date
* Used state

Registration codes are intended for onboarding new users.

Once a registration code has been successfully consumed, it is deleted instead of being retained as a historical registration record.

The user itself contains the permanent `created_at` timestamp.

## Meal Management

The frontend contains functionality for:

* Meal plans
* Dishes
* Dish creation and editing
* Canteen-specific meal management

## Administration

The application provides administration-oriented functionality for:

* Canteens
* Customers
* Employees
* Registration codes
* Settings
* Overview and management interfaces

---

# Architecture

The application follows a separated frontend/backend architecture.

```text
                    ┌─────────────────────┐
                    │       Browser       │
                    │                     │
                    │   React Frontend    │
                    └──────────┬──────────┘
                               │
                               │ HTTPS
                               │
                    ┌──────────▼──────────┐
                    │       Keycloak      │
                    │                     │
                    │ OAuth2 / OpenID      │
                    │ Connect              │
                    └──────────┬──────────┘
                               │
                         JWT Access Token
                               │
                    ┌──────────▼──────────┐
                    │   Spring Boot Core  │
                    │                     │
                    │ REST API            │
                    │ Business Logic      │
                    │ Authorization       │
                    │ Persistence         │
                    └──────────┬──────────┘
                               │
                               │ JPA / JDBC
                               │
                    ┌──────────▼──────────┐
                    │     PostgreSQL      │
                    │                     │
                    │ Application Data    │
                    └─────────────────────┘
```

The frontend does not directly access PostgreSQL.

The frontend communicates with the backend through REST APIs.

Keycloak is responsible for authentication, while the backend determines whether the authenticated user is registered and has the required application memberships.

---

# Technology Stack

## Frontend

* React
* React Router
* Vite
* JavaScript
* CSS
* React Icons
* React Toastify
* Keycloak JavaScript adapter

## Backend

* Java
* Spring Boot
* Spring Web
* Spring Security
* OAuth2 Resource Server
* JWT
* Spring Data JPA
* Hibernate
* Jakarta Persistence

## Database

* PostgreSQL

## Identity

* Keycloak
* OpenID Connect
* OAuth2
* JWT

## Infrastructure

* Docker
* Docker Compose for local environments where applicable
* Kubernetes for production/container orchestration
* GitHub Actions
* GitHub Container Registry

---

# Project Structure

A typical repository structure is:

```text
RailSuite/
│
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── de/
│   │   │   │       └── railsuite/
│   │   │   │           └── core/
│   │   │   │
│   │   │   └── resources/
│   │   │
│   │   └── test/
│   │
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── auth/
│   │   ├── components/
│   │   ├── constants/
│   │   ├── models/
│   │   ├── pages/
│   │   └── styles/
│   │
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   ├── nginx.conf
│   └── Dockerfile
│
├── kubernetes/
│   ├── namespace.yaml
│   ├── backend/
│   ├── frontend/
│   ├── keycloak/
│   └── postgres/
│
├── docker-compose.yml
│
├── .github/
│   └── workflows/
│
└── README.md
```

The exact structure may differ depending on the current state of the repository.

---

# Authentication and Authorization

RailSuite uses Keycloak as the central identity provider.

The frontend initializes Keycloak before rendering the application.

The current frontend authentication flow uses:

```javascript
keycloak.init({
    onLoad: "login-required"
});
```

This means that users must authenticate with Keycloak before accessing the application.

After successful authentication, Keycloak provides an access token.

The frontend sends the token to the backend using the HTTP `Authorization` header:

```text
Authorization: Bearer <access-token>
```

The Spring Boot backend validates the JWT.

The backend therefore does not need to manage passwords.

---

# Application User vs. Keycloak User

A key architectural principle is that the Keycloak user and the application user are separate concepts.

Keycloak stores identity information such as:

* Keycloak ID
* Username
* First name
* Last name
* Email
* Credentials
* Authentication state

The RailSuite database stores application-specific information such as:

* Internal user ID
* Keycloak ID
* Memberships
* Canteens
* Membership types
* Membership status
* Application-specific timestamps

The `keycloak_id` field is therefore the connection between the two systems.

Example:

```text
Keycloak
    │
    │ sub
    ▼
users.keycloak_id
    │
    ▼
User
    │
    ├── UserMembership
    │       ├── Canteen
    │       └── MembershipType
    │
    └── Application Data
```

---

# Registration Workflow

New users must be authenticated through Keycloak before they can use the application.

Authentication alone does not grant application access.

A new authenticated Keycloak user initially does not have an application membership.

The frontend therefore checks the current user's registration state.

The intended workflow is:

```text
User opens application
        │
        ▼
Keycloak Login
        │
        ▼
Authentication successful
        │
        ▼
Frontend requests /api/me
        │
        ▼
Is application user registered?
        │
        ├── NO
        │
        ▼
RegistrationRequired
        │
        ▼
User enters Registration Code
        │
        ▼
Backend validates code
        │
        ▼
Create / update application User
        │
        ▼
Create UserMembership
        │
        ▼
Delete RegistrationCode
        │
        ▼
Application access granted
        │
        ▼
Normal application
```

---

# Registration Codes

Registration codes are stored in the `registration_codes` table.

The entity contains:

```text
RegistrationCode
├── id
├── code
├── membershipType
├── canteen
├── used
└── expiresAt
```

A registration code is generated by the backend.

Example:

```text
A82F19CD
```

The code is associated with:

* A canteen
* A membership type
* An expiration date

Example:

```text
Code: A82F19CD
Type: CUSTOMER
Canteen: Main Canteen
Expires: 7 days
```

---

# Registration Code Lifecycle

Registration codes have a deliberately simple lifecycle.

```text
CREATED
   │
   ▼
AVAILABLE
   │
   │ successful registration
   ▼
DELETED
```

A separate permanent `USED` state is not required.

Once a registration code has been successfully consumed, it is deleted.

The registered application user is retained permanently.

This avoids keeping unnecessary registration-code records while keeping the user creation timestamp in the `users.created_at` field.

---

# Registration Code Validation

The backend must validate at least:

1. Code exists
2. Code has not expired
3. Code belongs to a valid membership type
4. Code belongs to a valid canteen
5. Current Keycloak user is not already registered for the same membership where this is prohibited
6. User can be safely created or updated
7. Membership can be created

The registration operation should be transactional.

Conceptually:

```text
BEGIN TRANSACTION

Validate registration code

Create or update User

Create UserMembership

Delete RegistrationCode

COMMIT
```

If any operation fails, the transaction should roll back.

The registration code must not be deleted if membership creation fails.

---

# UserMembership

Application authorization is represented by `UserMembership`.

A membership contains:

```text
UserMembership
├── user
├── canteen
├── type
├── status
└── createdAt
```

Example:

```text
User
└── Membership
    ├── Canteen: Main Canteen
    ├── Type: CUSTOMER
    └── Status: ACTIVE
```

This allows one user to have memberships for multiple canteens.

For example:

```text
User
├── CUSTOMER @ Canteen A
├── CUSTOMER @ Canteen B
└── EMPLOYEE @ Canteen C
```

The exact business rules for combining membership types should be enforced by the backend.

---

# First Login Protection

The application must not simply check whether a Keycloak user exists.

A Keycloak user may be authenticated while still having no application membership.

Therefore the backend should expose application registration state.

For example:

```http
GET /api/me
```

The response can contain:

```json
{
  "registered": false,
  "keycloakId": "....",
  "username": "john.doe",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com"
}
```

For a registered user:

```json
{
  "registered": true,
  "keycloakId": "....",
  "username": "john.doe",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com"
}
```

The frontend uses this information to protect the application routes.

A user without an application membership is redirected to the registration page.

---

# Frontend Route Protection

The frontend should distinguish between:

```text
Authenticated
Registered
```

These are not the same state.

The application should therefore behave conceptually like this:

```text
Keycloak authentication
        │
        ▼
Authenticated?
        │
        ├── NO → Keycloak login
        │
        ▼
Request /api/me
        │
        ▼
Registered?
        │
        ├── NO → RegistrationRequired
        │
        └── YES → Application
```

The registration page itself must remain accessible to authenticated but unregistered users.

Application routes should not be accessible until registration succeeds.

---

# Backend

The backend is implemented as a Spring Boot application.

The main package is:

```text
de.railsuite.core
```

The backend follows a domain-oriented package structure.

Examples:

```text
de.railsuite.core.user
de.railsuite.core.registration
de.railsuite.core.canteen
de.railsuite.core.meal
```

Business logic should remain in services rather than controllers.

Controllers should primarily:

* Receive HTTP requests
* Validate request DTOs
* Delegate to services
* Return DTOs
* Define HTTP status codes

Services should contain:

* Business rules
* Transactions
* Validation
* Entity operations

Repositories should contain:

* Persistence operations
* Queries
* Database-specific access

---

# UserLoginController

The `/api/me` endpoint exposes information about the currently authenticated user.

Authentication is obtained from Spring Security:

```java
Authentication authentication
```

The authentication is expected to contain a JWT.

The Keycloak subject is used as the stable external identifier:

```java
jwt.getSubject()
```

This value maps to:

```text
users.keycloak_id
```

The backend should use the Keycloak subject rather than username or email as the primary identity mapping.

Usernames and email addresses can change.

The Keycloak subject is intended to remain stable for the lifetime of the identity.

---

# UserRepository

The `UserRepository` provides persistence access for users.

Important operations include:

```java
Optional<User> findByKeycloakId(String keycloakId);
```

This is the primary lookup used to determine whether the authenticated Keycloak user has already been registered in the RailSuite application.

Additional queries can retrieve users according to their memberships and managed canteens.

---

# RegistrationCodeController

Registration code administration is exposed through:

```http
/api/registration-codes
```

Available endpoints include:

```http
POST /api/registration-codes
GET  /api/registration-codes
GET  /api/registration-codes/customer
DELETE /api/registration-codes/{code}
```

The customer endpoint returns registration codes for the `CUSTOMER` membership type.

---

# RegistrationCodeService

The registration service is responsible for:

* Generating registration codes
* Finding registration codes
* Filtering registration codes by membership type
* Deleting registration codes
* Registration validation
* Creating memberships
* Connecting users with Keycloak identities

Registration should be implemented as a transactional operation.

---

# Data Model

The core user relationship can be represented as:

```text
                    ┌───────────────┐
                    │     User      │
                    ├───────────────┤
                    │ id            │
                    │ keycloakId    │
                    │ username      │
                    │ firstName     │
                    │ lastName      │
                    │ email         │
                    │ createdAt     │
                    │ updatedAt     │
                    └───────┬───────┘
                            │
                            │ 1:N
                            ▼
                    ┌───────────────┐
                    │UserMembership │
                    ├───────────────┤
                    │ id            │
                    │ user          │
                    │ canteen       │
                    │ type          │
                    │ status        │
                    │ createdAt     │
                    └───────┬───────┘
                            │
                 ┌──────────┴──────────┐
                 ▼                     ▼
          ┌─────────────┐       ┌──────────────┐
          │   Canteen   │       │MembershipType│
          └─────────────┘       └──────────────┘
```

Registration codes reference the same canteen and membership type:

```text
RegistrationCode
├── code
├── canteen
├── membershipType
└── expiresAt
```

---

# Frontend

The frontend is a React application built with Vite.

The application uses React Router for navigation.

Typical pages include:

```text
/
├── Canteens
├── Overview
├── Meal Plans
├── Employees
├── Customers
├── Orders
└── Settings
```

Authentication is initialized before the React application is rendered.

Example:

```javascript
keycloak.init({
    onLoad: "login-required"
})
```

---

# Frontend API Layer

Frontend API calls are centralized in API modules.

Example:

```text
src/api/
├── apiClient.js
├── userApi.js
├── registrationApi.js
├── customerApi.js
├── employeeApi.js
└── canteenApi.js
```

The API client is responsible for attaching the Keycloak access token to requests.

Application components should preferably use API functions rather than directly constructing HTTP requests.

---

# Canteen Filtering

Customer and registration-code views can be filtered by canteen.

Available canteens should be constructed from both sources:

```text
Customers
    └── memberships
          └── canteen

Registration Codes
    └── canteen
```

This ensures that a canteen is available in the filter even if it currently only has registration codes and no registered customers.

The resulting canteen list should be deduplicated by canteen ID.

---

# UI

The frontend uses CSS variables for theme and application styling.

Examples include:

```css
var(--color-primary)
var(--color-border)
var(--color-success)
var(--color-danger)
var(--color-warning)
```

Components should use these variables instead of hardcoding application-specific colors wherever possible.

The UI is designed to support responsive layouts.

---

# Docker

The frontend is built using a multi-stage Docker image.

The build stage uses Node.js:

```dockerfile
FROM node:20-alpine AS build
```

The runtime stage uses Nginx:

```dockerfile
FROM nginx:alpine
```

The build process is:

```text
Node.js
   │
   ├── npm install
   │
   ├── npm run build
   │
   ▼
Vite production bundle
   │
   ▼
Nginx image
   │
   ▼
Production container
```

This keeps the final runtime image small because Node.js and the development dependencies are not required by the Nginx container.

---

# Frontend Dockerfile

The frontend Dockerfile follows this general pattern:

```dockerfile
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

The exact output directory depends on the Vite configuration.

For standard Vite builds, the output directory is usually:

```text
dist/
```

---

# Nginx

Nginx serves the compiled frontend.

Because React Router is used, the Nginx configuration must support SPA fallback.

A typical configuration contains:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

Without this configuration, directly opening routes such as:

```text
/customers
/employees
/overview
```

may result in a `404` from Nginx after refreshing the page.

---

# Backend Docker Image

The backend should also use a multi-stage Docker build.

Conceptually:

```text
Build image
    │
    ├── Compile application
    └── Package JAR
          │
          ▼
Runtime image
    │
    └── Run Spring Boot application
```

The runtime container should contain only the artifacts required to execute the application.

---

# Kubernetes

The application is intended to be deployable to Kubernetes.

A typical Kubernetes environment consists of:

```text
                    Ingress
                      │
          ┌───────────┴───────────┐
          │                       │
          ▼                       ▼
      Frontend                 Backend
       Service                  Service
          │                       │
          ▼                       ▼
      Frontend                 Backend
       Pods                      Pods
                                  │
                    ┌─────────────┴─────────────┐
                    ▼                           ▼
                PostgreSQL                   Keycloak
```

The exact topology may differ depending on the deployment environment.

---

# Kubernetes Principles

Production Kubernetes deployments should follow these principles:

* Stateless application containers
* Externalized configuration
* Secrets stored as Kubernetes Secrets
* Persistent storage for PostgreSQL
* Readiness probes
* Liveness probes
* Resource requests
* Resource limits
* Horizontal scaling where appropriate
* Separate namespaces for environments where appropriate
* Ingress-based external access
* TLS termination
* No credentials embedded in images

---

# Configuration

Configuration must not be hardcoded into application source code.

Typical environment-specific values include:

```text
DATABASE_URL
DATABASE_USERNAME
DATABASE_PASSWORD

KEYCLOAK_URL
KEYCLOAK_REALM
KEYCLOAK_CLIENT_ID

BACKEND_URL
FRONTEND_URL
```

Development, staging and production configurations should be separated.

Sensitive credentials must never be committed to Git.

---

# Keycloak Configuration

The frontend currently uses a Keycloak configuration similar to:

```javascript
const keycloak = new Keycloak({
    url: "http://localhost:8081",
    realm: "railsuite",
    clientId: "frontend"
});
```

For production, the URL must point to the externally reachable Keycloak instance.

The Keycloak client must be configured with the appropriate:

* Valid redirect URIs
* Web origins
* Client authentication settings
* Allowed flows
* Realm configuration

The frontend should not contain any Keycloak client secret.

Public frontend clients should use appropriate OIDC configuration without exposing confidential credentials.

---

# Database

PostgreSQL is used as the application database.

The database contains application-specific entities such as:

```text
users
user_memberships
registration_codes
canteens
membership_types
```

The database should be treated as persistent infrastructure.

For Kubernetes:

* Use a persistent volume
* Back up the database
* Do not store database data inside the application container
* Do not use ephemeral storage for production PostgreSQL

---

# Local Development

## Requirements

Install:

* Git
* Node.js
* npm
* Java
* Maven or Gradle depending on the backend build
* Docker
* Docker Compose
* PostgreSQL
* Keycloak

For frontend-only development:

```bash
cd frontend
npm install
npm run dev
```

The Vite development server will then start the frontend.

---

# Backend Development

Start the backend using the project's configured build system.

For Maven:

```bash
cd backend
./mvnw spring-boot:run
```

On Windows:

```powershell
cd backend
mvnw.cmd spring-boot:run
```

The backend normally exposes its REST API on:

```text
http://localhost:8080
```

---

# Frontend Development

Start the frontend:

```bash
cd frontend
npm install
npm run dev
```

The frontend normally runs on a Vite development port.

The exact port depends on the Vite configuration.

---

# Production Frontend Build

Build the frontend locally:

```bash
cd frontend
npm install
npm run build
```

Preview the production build:

```bash
npm run preview
```

The production build must complete without Vite or CSS errors before building the Docker image.

---

# Docker Build

Build the frontend image:

```bash
docker build -t railsuite-frontend ./frontend
```

Run it:

```bash
docker run --rm -p 8080:80 railsuite-frontend
```

The application can then be accessed through:

```text
http://localhost:8080
```

---

# GitHub Actions

The project uses GitHub Actions for CI/CD.

Container images can be built and pushed to GitHub Container Registry.

Example image:

```text
ghcr.io/tim16227/canteen-frontend:latest
```

Commit-specific tags can also be used:

```text
ghcr.io/tim16227/canteen-frontend:<commit-sha>
```

Using immutable commit-based tags is recommended for production deployments.

---

# Container Image Versioning

For production Kubernetes deployments, prefer immutable image references.

Instead of:

```text
railsuite-frontend:latest
```

prefer:

```text
railsuite-frontend:8a4a537e94103978568c38fd66425ffecea33d2a
```

This allows Kubernetes deployments to be reproduced reliably.

The `latest` tag can still be used for development or convenience.

---

# API

## Authentication

The backend expects a valid bearer token.

Example:

```http
Authorization: Bearer <JWT>
```

---

## Current User

```http
GET /api/me
```

Returns information about the currently authenticated user.

Example:

```json
{
  "keycloakId": "keycloak-user-id",
  "username": "john.doe",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "registered": true
}
```

The exact response structure depends on the current backend implementation.

---

## Registration Codes

### Create

```http
POST /api/registration-codes
```

Example:

```json
{
  "canteenId": 1,
  "membershipType": "CUSTOMER"
}
```

---

### Get All

```http
GET /api/registration-codes
```

---

### Get Customer Codes

```http
GET /api/registration-codes/customer
```

---

### Delete

```http
DELETE /api/registration-codes/{code}
```

---

# Registration Endpoint

The registration workflow should expose a dedicated authenticated endpoint.

Conceptually:

```http
POST /api/registration/register
```

Example:

```json
{
  "code": "A82F19CD"
}
```

The backend uses the authenticated JWT to determine the Keycloak user.

The client must not be allowed to specify another user's Keycloak ID.

The backend obtains the identity directly from the authenticated security context.

---

# Registration Security Model

The registration code is a capability.

Possession of a valid registration code allows an authenticated Keycloak user to request a specific application membership.

Therefore:

```text
Keycloak authentication
+
valid registration code
=
application membership
```

The registration endpoint must never trust the following values from the frontend:

```text
keycloakId
username
role
membershipType
canteenId
```

The registration code itself determines:

```text
membershipType
canteen
```

The authenticated JWT determines:

```text
keycloakId
username
firstName
lastName
email
```

This prevents a client from manipulating the target role or canteen.

---

# Transactional Registration

Registration should be atomic.

A successful registration consists of:

```text
1. Read authenticated Keycloak identity
2. Find registration code
3. Validate expiration
4. Validate code
5. Find or create application User
6. Create UserMembership
7. Delete registration code
8. Commit transaction
```

If step 5, 6 or 7 fails, the transaction should be rolled back.

This is particularly important in Kubernetes environments where multiple backend instances may process requests concurrently.

---

# Concurrency

Registration code consumption must be protected against concurrent requests.

Two requests must not be able to consume the same code simultaneously.

Possible approaches include:

* Database row locking
* Transactional locking
* Atomic update/delete operations
* Appropriate transaction isolation

The implementation should ensure that a registration code can only result in one successful membership creation.

---

# Testing

The project should contain tests for:

## Backend

* Registration code generation
* Registration code expiration
* Invalid registration codes
* Successful registration
* Duplicate registration
* Membership creation
* Registration code deletion
* Transaction rollback
* Unauthorized requests
* Authorization rules

## Frontend

* Login state
* Registration-required state
* Registration page
* Registration success
* Invalid registration code
* Expired registration code
* Route protection
* API errors

---

# Production Considerations

The application should be designed to remain stateless wherever possible.

The backend should not rely on local filesystem state.

The frontend container should be immutable.

Persistent state belongs in:

* PostgreSQL
* Keycloak
* External object storage where required

Application configuration should be externalized.

---

# Kubernetes Readiness

The application is intended to be Kubernetes-ready.

The backend should provide health endpoints suitable for Kubernetes probes.

Recommended endpoints:

```text
/actuator/health/liveness
/actuator/health/readiness
```

Example Kubernetes configuration:

```yaml
livenessProbe:
  httpGet:
    path: /actuator/health/liveness
    port: 8080

readinessProbe:
  httpGet:
    path: /actuator/health/readiness
    port: 8080
```

The readiness probe should indicate whether the application is ready to accept traffic.

The liveness probe should indicate whether the application process is healthy.

---

# Resource Management

Kubernetes deployments should define resource requests and limits.

Example:

```yaml
resources:
  requests:
    cpu: "100m"
    memory: "256Mi"

  limits:
    cpu: "1000m"
    memory: "512Mi"
```

The exact values must be adjusted based on real workload measurements.

---

# Logging

Application logs should be written to standard output.

Containers should not rely on local log files.

Kubernetes can then collect the logs through the container runtime.

Recommended log information includes:

* Timestamp
* Log level
* Service
* Request information
* Correlation ID
* Error information

Sensitive information must not be logged.

In particular, never log:

```text
Passwords
Access tokens
Refresh tokens
Registration codes
Client secrets
```

---

# Security

Security is a core architectural requirement.

## Authentication

Authentication is delegated to Keycloak.

## Authorization

Authorization is enforced by the backend.

The frontend may hide UI elements based on permissions, but this is not considered a security boundary.

Every protected backend endpoint must enforce authorization independently.

---

# JWT Handling

JWT tokens should only be accepted from the configured trusted Keycloak issuer.

The backend should validate:

* Signature
* Issuer
* Expiration
* Token structure

The application should not manually parse untrusted bearer tokens.

Spring Security's OAuth2 Resource Server functionality should perform token validation.

---

# Secrets

Secrets must not be stored in:

```text
Git
Dockerfiles
Frontend source code
Kubernetes manifests committed as plain text
```

Use:

* Kubernetes Secrets
* Environment variables
* External secret managers

where appropriate.

---

# CORS

CORS should be explicitly configured.

Development may allow:

```text
http://localhost:5173
```

Production should allow only the actual frontend origin.

Avoid:

```text
Access-Control-Allow-Origin: *
```

for authenticated APIs unless there is a specific architectural reason.

---

# Error Handling

The backend should return consistent API errors.

For example:

```json
{
  "message": "Registration code is invalid or expired."
}
```

Recommended HTTP status codes:

```text
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
500 Internal Server Error
```

Registration errors should not reveal unnecessary internal implementation details.

---

# Troubleshooting

## Vite CSS Build Error

If Docker reports:

```text
Invalid media query
```

check for invalid expressions such as:

```css
@media (max-width: 100%) {
}
```

Media queries require valid lengths:

```css
@media (max-width: 1024px) {
}
```

---

## Docker COPY Error

If Docker reports:

```text
"/frontend_old": not found
```

the Dockerfile is attempting to copy a directory outside the Docker build context.

For a build context such as:

```bash
docker build ./frontend
```

the Dockerfile should use:

```dockerfile
COPY . .
```

instead of:

```dockerfile
COPY ../frontend_old .
```

---

## `/api/me` Returns 400

If Spring Security reports:

```text
Failed to instantiate Jwt
tokenValue cannot be empty
```

do not manually construct a `Jwt` from an empty value.

Use the already authenticated:

```java
Authentication
```

and retrieve:

```java
JwtAuthenticationToken
```

from it.

The frontend must also send the access token correctly.

---

## User Is Authenticated but Not Registered

This is an expected application state.

The user may exist in Keycloak but not yet in the RailSuite database.

The frontend should detect:

```text
authenticated = true
registered = false
```

and redirect the user to the registration workflow.

---

# Development Workflow

A recommended development workflow is:

```text
Feature branch
     │
     ▼
Local development
     │
     ▼
Unit / integration tests
     │
     ▼
npm run build
     │
     ▼
Backend build
     │
     ▼
Docker build
     │
     ▼
Git commit
     │
     ▼
Pull Request
     │
     ▼
GitHub Actions
     │
     ├── Tests
     ├── Frontend build
     ├── Backend build
     └── Container image build
             │
             ▼
       GitHub Container Registry
```

---

# Git Workflow

Feature branches should be used for larger changes.

Example:

```bash
git checkout -b feature/registration-workflow
```

Commit changes:

```bash
git add .
git commit -m "Add registration workflow"
```

Push:

```bash
git push -u origin feature/registration-workflow
```

After review, merge into the main branch.

---

# Production Deployment Workflow

A recommended production deployment pipeline is:

```text
Git Push
   │
   ▼
GitHub Actions
   │
   ├── Build
   ├── Test
   ├── Security Checks
   └── Docker Build
          │
          ▼
GitHub Container Registry
          │
          ▼
Kubernetes
          │
          ├── Backend Deployment
          ├── Frontend Deployment
          ├── Keycloak
          └── PostgreSQL
```

Production deployments should use immutable image tags.

---

# Future Improvements

Potential future improvements include:

* Kubernetes Helm charts
* Horizontal Pod Autoscaling
* PostgreSQL high availability
* Automated database migrations
* Flyway or Liquibase
* Centralized logging
* Distributed tracing
* Prometheus metrics
* Grafana dashboards
* OpenTelemetry
* Automated security scanning
* Container image signing
* SBOM generation
* Network policies
* External secret management
* Automated backups
* Disaster recovery procedures
* Blue/green deployments
* Canary deployments

---

# Architectural Principles

The project should follow these principles as it evolves:

## Backend Owns Business Rules

Business rules must be enforced by the backend.

The frontend is not a security boundary.

## Keycloak Owns Identity

Authentication credentials and identity management belong to Keycloak.

## RailSuite Owns Application State

Memberships, canteens, customers, employees and application-specific relationships belong to the RailSuite backend/database.

## Database Is Persistent

Containers remain disposable.

Persistent state must not depend on container filesystems.

## Configuration Is Externalized

Environment-specific configuration must not be hardcoded.

## Containers Are Immutable

A running container should not be manually modified.

## Kubernetes Is the Orchestrator

Scaling, restarting, health checks and service discovery should be handled by Kubernetes.

---

# License

Copyright (c) 2026 Your RailSuite. All rights reserved.

This project is currently maintained as the RailSuite application.

Unless explicitly stated otherwise, source code and project assets are not licensed for redistribution, commercial use or modification.

```
```
