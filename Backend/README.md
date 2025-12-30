# LMS Backend — API Reference

This README provides a concise, production-ready API reference for the LMS Backend. It covers authentication, `/user`, `/employee`, `/partner`, and `/lead` endpoints, request/response examples, error formats, authentication, and common types.

Project route files:

- Main router: [src/routes.ts](src/routes.ts)
- Auth: [src/modules/auth/auth.route.ts](src/modules/auth/auth.route.ts)
- User: [src/modules/user/userRoutes/user.routes.ts](src/modules/user/userRoutes/user.routes.ts)
- Employee: [src/modules/employee/employee.routes.ts](src/modules/employee/employee.routes.ts)
- Partner: [src/modules/partner/partner.routes.ts](src/modules/partner/partner.routes.ts)
- Lead: [src/modules/lead/lead.routes.ts](src/modules/lead/lead.routes.ts)

Authentication

- All protected endpoints require a valid bearer JWT in the `Authorization` header: `Authorization: Bearer <token>`.
- Authentication is enforced by [`src/common/middlewares/auth.middleware.ts`](src/common/middlewares/auth.middleware.ts).

Response envelope (standard)

- Successful responses:

```json
{
  "success": true,
  "message": "Human readable message",
  "data": {
    /* payload */
  }
}
```

- Error responses (validation/other):

```json
{
  "success": false,
  "message": "Error message",
  "errors": [{ "field": "fieldName", "message": "reason" }]
}
```

Common headers

- `Authorization: Bearer <token>` — for protected endpoints
- `Content-Type: application/json`

Status codes used

- `200` OK
- `201` Created
- `400` Bad Request / Validation error
- `401` Unauthorized
- `403` Forbidden
- `404` Not Found
- `500` Internal Server Error

---

Endpoints

1. Authentication

POST /auth/login

- Purpose: Authenticate a user and return session token and profile.
- URL: `/auth/login`
- Request body (one of `email` or `userName` is required):

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

or

```json
{
  "userName": "johndoe",
  "password": "password123"
}
```

- Success (200):

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "<jwt>",
    "user": {
      "id": "user-id",
      "fullName": "John Doe",
      "userName": "johndoe",
      "email": "user@example.com",
      "role": "EMPLOYEE",
      "contactNumber": "9999999999",
      "isActive": true,
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  }
}
```

Errors: `400` for missing fields, `401` for invalid credentials.

2. User

Base path: `/user`

POST /user/create

- Purpose: Create a user account (no outer `data` wrapper).
- Request example:

```json
{
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "password": "secret123",
  "userName": "janedoe",
  "role": "EMPLOYEE",
  "address": "123 Street",
  "contactNumber": "9876543210",
  "isActive": true
}
```

- Success (201):

```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "user-id",
    "fullName": "Jane Doe",
    "userName": "janedoe",
    "email": "jane@example.com",
    "role": "EMPLOYEE",
    "contactNumber": "9876543210",
    "isActive": true,
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

GET /user/all

- Purpose: List users (protected)
- Success (200):

```json
{
  "success": true,
  "message": "Users fetched",
  "data": [{ "id": "...", "fullName": "...", "email": "..." }]
}
```

GET /user/:id

- Purpose: Get single user (protected)
- Success (200):

```json
{
  "success": true,
  "message": "User fetched",
  "data": { "id": "...", "fullName": "...", "email": "..." }
}
```

PATCH /user/:id

- Purpose: Update user partially (protected)
- Request: subset of create fields. Success (200) returns updated user.

3. Employee

Base path: `/employee` (protected)

POST /employee/

- Purpose: Create an employee and underlying user record.
- Request fields (flat JSON):
- Required: `fullName` (string), `email` (string), `password` (string), `role` (string).
- Common optional fields and types:
  - `contactNumber`: string
  - `isActive`: boolean
  - `userName`: string
  - `mobileNumber`: string
  - `atlMobileNumber`: string
  - `dob`: string (ISO date)
  - `gender`: string (MALE|FEMALE|OTHER)
  - `maritalStatus`: string
  - `designation`: string
  - `emergencyContact`: string
  - `emergencyRelationship`: string
  - `experience`: string
  - `reportingManagerId`: string
  - `workLocation`: string (OFFICE|REMOTE)
  - `department`: string
  - `dateOfJoining`: string (ISO date)
  - `salary`: number
  - `address`, `city`, `state`, `pinCode`: strings

Example request (production-ready payload):

```json
{
  "fullName": "Sharma",
  "email": "sharm1a@company.com",
  "password": "SecurePass123",
  "role": "EMPLOYEE",
  "contactNumber": "9876543210",
  "isActive": true,
  "userName": "av.sharma",
  "mobileNumber": "9876543210",
  "atlMobileNumber": "9123456789",
  "dob": "1993-07-18",
  "gender": "MALE",
  "maritalStatus": "SINGLE",
  "designation": "Senior Software Engineer",
  "emergencyContact": "9876501234",
  "emergencyRelationship": "FATHER",
  "experience": "6 years",
  "reportingManagerId": "mgr_8f9d2a3c",
  "workLocation": "OFFICE",
  "department": "Engineering",
  "dateOfJoining": "2024-03-01",
  "salary": 95000,
  "address": "Flat 402, Green Residency",
  "city": "Bengaluru",
  "state": "Karnataka",
  "pinCode": "560102"
}
```

Success (201):

```json
{
  "success": true,
  "message": "Employee created successfully",
  "data": {
    "user": {
      "id": "user-abc123",
      "fullName": "Sharma",
      "email": "sharm1a@company.com"
    },
    "employee": {
      "id": "emp-xyz789",
      "employeeId": "EMP-0001",
      "designation": "Senior Software Engineer"
    }
  }
}
```

GET /employee/all

- Purpose: List employees (protected)
- Returns array of employee records with nested `user` (safe fields only)

GET /employee/:id

- Purpose: Get a single employee by id (protected)

PATCH /employee/:id

- Purpose: Update employee fields (protected). Send only fields to update.

4. Partner

Base path: `/partner` (protected)

POST /partner/

- Purpose: Create a partner user + partner profile.
- Example request:

```json
{
  "fullName": "Partner Owner",
  "email": "partner@example.com",
  "password": "partnerpass",
  "userName": "partner1",
  "role": "PARTNER",
  "contactNumber": "8887776666",
  "partnerId": "PRT-001",
  "companyName": "Acme Co",
  "partnerType": "COMPANY",
  "website": "https://example.com"
}
```

Success (201):

```json
{
  "success": true,
  "message": "Partner created successfully",
  "data": {
    "user": {
      "id": "...",
      "email": "partner@example.com",
      "userName": "partner1"
    },
    "partner": { "id": "...", "partnerId": "PRT-001", "companyName": "Acme Co" }
  }
}
```

GET /partner/all

- Purpose: List partners (protected)

GET /partner/:id

- Purpose: Get partner details (protected)

PATCH /partner/:id

- Purpose: Update partner profile (protected)

5. Lead

Base path: `/lead`

POST /lead/

- Purpose: Public: create a lead.
- Example request:

```json
{
  "fullName": "Lead Name",
  "contactNumber": "7776665555",
  "email": "lead@example.com",
  "dob": "1995-05-05",
  "gender": "MALE",
  "loanAmount": 50000,
  "loanType": "PERSONAL_LOAN",
  "city": "City",
  "state": "State",
  "pinCode": "123456",
  "address": "Address"
}
```

Success (201):

```json
{
  "success": true,
  "message": "Lead created successfully",
  "data": {
    "id": "lead-id",
    "fullName": "Lead Name",
    "status": "PENDING",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

GET /lead/all

- Purpose: List leads (protected)

GET /lead/:id

- Purpose: Get single lead (protected)

PATCH /lead/update-status/:id

- Purpose: Update lead status (protected)
- Request body:

```json
{ "status": "APPROVED" }
```

PATCH /lead/assign/:id

- Purpose: Assign a lead to a user (protected). Request body:

```json
{ "assignedTo": "userId" }
```

- Note: `assignedBy` is derived from authenticated user (server-side).

---

Types and enums

- See database/types in [prisma/schema.prisma](prisma/schema.prisma) for enums and model fields. Common enums include `Role`, `Gender`, `MaritalStatus`, `WorkLocation`, `LeadStatus`, etc.

Error handling

- Validation failures return `400` with `errors` array (field-level messages). Authentication returns `401`.

Developer notes

- Validation is performed using Zod schemas (see `src/modules/*/*.schema.ts`).
- Controllers return responses using the standard envelope shown above.
- Sensitive fields (passwords, tokens) are never returned in API responses.

Next steps I can take for you

- Verify request/response fields against the route/schema files in `src/modules/employee` and others to make this doc 1:1 with implementation.
- Generate per-module docs or an OpenAPI spec.

If you want me to validate fields against code now, tell me and I'll run a quick scan.

````// filepath: README.md
# API Routes

This document lists the main routes in this repo and example request/response payloads.

- User routes: [src/modules/user/userRoutes/user.routes.ts](src/modules/user/userRoutes/user.routes.ts) — controllers: [`createUserController`](src/modules/user/userController/user.controller.ts), [`getallUsersController`](src/modules/user/userController/user.controller.ts)
  - Request type: [`CreateUser`](src/modules/user/user.types.ts)

- Auth routes: [src/modules/auth/auth.route.ts](src/modules/auth/auth.route.ts) — controller: [`loginController`](src/modules/auth/auth.controller.ts), service: [`loginService`](src/modules/auth/auth.service.ts)

- Employee routes: [src/modules/employee/employee.routes.ts](src/modules/employee/employee.routes.ts) — controller: [`createEmployeeController`](src/modules/employee/employee.controller.ts)
  - Request type: [`CreateEmployee`](src/modules/employee/employee.types.ts)

- Partner routes: [src/modules/partner/partner.routes.ts](src/modules/partner/partner.routes.ts) — controller: [`createPartnerController`](src/modules/partner/partner.controller.ts)
  - Request type: [`CreatePartner`](src/modules/partner/partner.types.ts)

- Lead routes: [src/modules/lead/lead.routes.ts](src/modules/lead/lead.routes.ts) — controllers: [`createLeadController`](src/modules/lead/lead.controller.ts), [`assignLeadController`](src/modules/lead/lead.controller.ts)
  - Request type: [`CreateLead`](src/modules/lead/lead.types.ts)

Note: Protected routes require authentication middleware: [src/common/middlewares/auth.middleware.ts](src/common/middlewares/auth.middleware.ts)

---

## /auth

### POST /auth/login
- Purpose: Authenticate user (email or userName + password)
- Request body (either `email` or `userName` required):
```json
{
  "email": "user@example.com",
  "password": "password123"
}
````

or

```json
{
  "userName": "johndoe",
  "password": "password123"
}
```

- Response (200):

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "id": "user-id",
    "fullName": "John Doe",
    "userName": "johndoe",
    "email": "user@example.com",
    "role": "EMPLOYEE",
    "contactNumber": "9999999999",
    "isActive": true,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

- Implementation: [`loginController`](src/modules/auth/auth.controller.ts), [`loginService`](src/modules/auth/auth.service.ts)

---

## /user

### POST /user/create

- Purpose: Create user
- Request type: [`CreateUser`](src/modules/user/user.types.ts)
- Request body:

```json
{
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "password": "secret123",
  "userName": "janedoe",
  "role": "EMPLOYEE",
  "address": "123 Street",
  "contactNumber": "9876543210",
  "isActive": true
}
```

- Response (201):

```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "user-id",
    "fullName": "Jane Doe",
    "userName": "janedoe",
    "email": "jane@example.com",
    "role": "EMPLOYEE",
    "contactNumber": "9876543210",
    "isActive": true,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

- Routes & handlers: [`user.routes.ts`](src/modules/user/userRoutes/user.routes.ts), [`createUserController`](src/modules/user/userController/user.controller.ts)

### GET /user/all

- Response (200): array of users (same shape as above)

### GET /user/:id

- Response (200): single user object

### PATCH /user/:id

- Purpose: Update user (partial); body same fields as `CreateUser` optional
- Response (200): updated user object

---

## /employee

All employee routes are protected (see auth middleware).

### POST /employee/

- Request type: [`CreateEmployee`](src/modules/employee/employee.types.ts)
- Request body (minimal):

```json
{
  "fullName": "Emp Name",
  "email": "emp@example.com",
  "password": "password123",
  "role": "EMPLOYEE",
  "contactNumber": "9998887777",
  "userName": "empuser",
  "mobileNumber": "9998887777",
  "atlMobileNumber": "9998887778",
  "dob": "1990-01-01",
  "emergencyContact": "9999999999"
}
```

- Response (201):

```json
{
  "success": true,
  "message": "Employee created successfully",
  "data": {
    "user": { "id": "...", "email": "emp@example.com" /* safe user fields */ },
    "employee": { "id": "...", "employeeId": "EMP-xxx" /* employee fields */ }
  }
}
```

- Implementation: [`employee.routes.ts`](src/modules/employee/employee.routes.ts), [`createEmployeeController`](src/modules/employee/employee.controller.ts)

### GET /employee/all

- Response (200): array of employees

### GET /employee/:id

- Response (200): employee with nested safe `user` (password removed)

### PATCH /employee/:id

- Purpose: partial update; returns updated employee

---

## /partner

All partner routes are protected.

### POST /partner/

- Request type: [`CreatePartner`](src/modules/partner/partner.types.ts)
- Request body (example):

```json
{
  "fullName": "Partner Owner",
  "email": "partner@example.com",
  "password": "partnerpass",
  "role": "PARTNER",
  "userName": "partner1",
  "contactNumber": "8887776666",
  "partnerId": "PRT-001",
  "companyName": "Acme Co",
  "partnerType": "COMPANY"
}
```

- Response (201):

```json
{
  "success": true,
  "message": "Partner created successfully",
  "data": {
    "user": { "id": "...", "email": "partner@example.com" /* safe user */ },
    "partner": {
      "id": "...",
      "partnerId": "PRT-001",
      "companyName": "Acme Co" /* partner fields */
    }
  }
}
```

- Implementation: [`partner.routes.ts`](src/modules/partner/partner.routes.ts), [`createPartnerController`](src/modules/partner/partner.controller.ts)

### GET /partner/all

- Response (200): array of partners (each includes `user` with password removed)

### GET /partner/:id

- Response (200): partner (includes safe `user`)

### PATCH /partner/:id

- Purpose: update partner

---

## /lead

### POST /lead/

- Public
- Request type: [`CreateLead`](src/modules/lead/lead.types.ts)
- Request body:

```json
{
  "fullName": "Lead Name",
  "contactNumber": "7776665555",
  "email": "lead@example.com",
  "dob": "1995-05-05",
  "gender": "MALE",
  "loanAmount": 50000,
  "loanType": "PERSONAL_LOAN",
  "city": "City",
  "state": "State",
  "pinCode": "123456",
  "address": "Address"
}
```

- Response (201):

```json
{
  "success": true,
  "message": "Lead created successfully",
  "data": {
    "id": "lead-id",
    "fullName": "Lead Name",
    "status": "PENDING",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

- Implementation: [`lead.routes.ts`](src/modules/lead/lead.routes.ts), [`createLeadController`](src/modules/lead/lead.controller.ts)

### GET /lead/all

- Protected — returns array of leads

### GET /lead/:id

- Protected — returns single lead

### PATCH /lead/update-status/:id

- Protected — body: `{ "status": "<STATUS>" }` where statuses are defined in [`statusEnum`](src/modules/lead/lead.schema.ts)

### PATCH /lead/assign/:id

- Protected — body: `{ "assignedTo": "userId" }`
  - Server derives `assignedBy` from authenticated user (`req.user.id`)
  - Response: assigned lead object with nested user objects (password removed)

---

If you need this README expanded into separate per-module files or examples for error responses, tell me which module to expand.
