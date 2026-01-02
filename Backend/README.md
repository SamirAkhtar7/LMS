# LMS Backend — API Reference

Base URL: `/api`

This README lists all available endpoints, required middleware, request body examples and typical responses.

Middleware and utilities

- Authentication middleware: [`authMiddleware`](src/common/middlewares/auth.middleware.ts)
- Permission middleware: [`checkPermissionMiddleware`](src/common/middlewares/permission.middleware.ts)
- Zod validation middleware: [`validate`](src/common/middlewares/zod.middleware.ts)
- File upload (multer): [`upload`](src/common/middlewares/multer.middleware.ts)

Routes overview (files)

- Auth: [src/modules/auth/auth.route.ts](src/modules/auth/auth.route.ts) — controller: [`loginController`](src/modules/auth/auth.controller.ts)
- User: [src/modules/user/userRoutes/user.routes.ts](src/modules/user/userRoutes/user.routes.ts) — controllers: [`createUserController`](src/modules/user/userController/user.controller.ts), [`getallUsersController`](src/modules/user/userController/user.controller.ts), [`getUserByIdController`](src/modules/user/userController/user.controller.ts), [`updateUserController`](src/modules/user/userController/user.controller.ts)
- Employee: [src/modules/employee/employee.routes.ts](src/modules/employee/employee.routes.ts) — controllers in [src/modules/employee/employee.controller.ts](src/modules/employee/employee.controller.ts)
- Partner: [src/modules/partner/partner.routes.ts](src/modules/partner/partner.routes.ts) — controllers in [src/modules/partner/partner.controller.ts](src/modules/partner/partner.controller.ts)
- Lead: [src/modules/lead/lead.routes.ts](src/modules/lead/lead.routes.ts) — controllers in [src/modules/lead/lead.controller.ts](src/modules/lead/lead.controller.ts)
- Loan Applications: [src/modules/LoanApplication/loanApplication.routes.ts](src/modules/LoanApplication/loanApplication.routes.ts) — controllers in [src/modules/LoanApplication/loanApplication.controller.ts](src/modules/LoanApplication/loanApplication.controller.ts)
- Permissions: [src/modules/permission/permission.routes.ts](src/modules/permission/permission.routes.ts) — controllers in [src/modules/permission/permission.controller.ts](src/modules/permission/permission.controller.ts)
- KYC / Documents: [src/modules/kyc/kyc.routes.ts](src/modules/kyc/kyc.routes.ts) — controllers in [src/modules/kyc/kyc.controller.ts](src/modules/kyc/kyc.controller.ts)

Common response shape
Success:
{
"success": true,
"message": "Some message",
"data": { ... }
}
Error:
{
"success": false,
"message": "Error message",
"error": "INTERNAL_SERVER_ERROR" // or details
}

---

API Endpoints (detailed)

1. Auth

- POST /api/auth/login
  - File: [src/modules/auth/auth.route.ts](src/modules/auth/auth.route.ts)
  - Controller: [`loginController`](src/modules/auth/auth.controller.ts)
  - Validation: none (controller expects email or userName + password)
  - Request body (example):
    {
    "email": "alice@example.com",
    "password": "password123"
    }
  - Response (201/200):
    {
    "success": true,
    "message": "Login successful",
    "data": { "id": "userId", "email": "alice@example.com", "role": "ADMIN", ... }
    }
  - Notes: Sets `accessToken` and `refreshToken` cookies via cookieOptions in [`loginController`](src/modules/auth/auth.controller.ts).

2. Users

- POST /api/user/create

  - File: [src/modules/user/userRoutes/user.routes.ts](src/modules/user/userRoutes/user.routes.ts)
  - Controller: [`createUserController`](src/modules/user/userController/user.controller.ts)
  - Validate: [`createUserSchema`](src/modules/user/userValidation/user.schema.ts) (see file)
  - Request body (example):
    {
    "fullName": "Alice Smith",
    "email": "alice@example.com",
    "userName": "alice",
    "password": "password123",
    "role": "EMPLOYEE",
    "contactNumber": "9999999999",
    "isActive": true
    }
  - Response:
    {
    "success": true,
    "message": "User created successfully",
    "data": { "id": "userId", "fullName": "Alice Smith", "email": "alice@example.com", ... }
    }

- GET /api/user/all

  - Middleware: [`authMiddleware`](src/common/middlewares/auth.middleware.ts), [`checkPermissionMiddleware("View_All_Users")`](src/common/middlewares/permission.middleware.ts)
  - Response:
    {
    "success": true,
    "message": "Users retrieved successfully",
    "data": [ { ...user }, ... ]
    }

- GET /api/user/:id

  - Validate: user id param via [`userIdParamSchema`](src/modules/user/userValidation/user.schema.ts)
  - Middleware: [`authMiddleware`](src/common/middlewares/auth.middleware.ts), [`checkPermissionMiddleware("View_User_Details")`](src/common/middlewares/permission.middleware.ts)
  - Response:
    {
    "success": true,
    "message": "User retrieved successfully",
    "data": { "id": "userId", "fullName": "...", "email": "..." }
    }

- PATCH /api/user/:id
  - Validate: [`updateUserSchema`](src/modules/user/userValidation/user.schema.ts)
  - Middleware: [`authMiddleware`](src/common/middlewares/auth.middleware.ts), [`checkPermissionMiddleware("Update_User")`](src/common/middlewares/permission.middleware.ts)
  - Request body: partial of create user fields (example):
    { "fullName": "Alice Updated", "isActive": false }
  - Response: updated user (password omitted)

3. Employee

- POST /api/employee/

  - Middleware: [`authMiddleware`](src/common/middlewares/auth.middleware.ts), [`checkPermissionMiddleware("Create_Employee")`](src/common/middlewares/permission.middleware.ts)
  - Validate: [`createEmployeeSchema`](src/modules/employee/employee.schema.ts)
  - Request:
    {
    "fullName": "John Doe",
    "email": "john@example.com",
    "userName": "johnd",
    "password": "secret",
    "contactNumber": "8888888888",
    "role": "EMPLOYEE"
    }
  - Response:
    {
    "success": true,
    "message": "Employee created successfully",
    "data": { "user": { ...safeUser }, "employee": { ... } }
    }

- GET /api/employee/all

  - Middleware: auth + [`checkPermissionMiddleware("View_All_Employees")`](src/modules/employee/employee.routes.ts)
  - Response: list of employees

- GET /api/employee/:id

  - Middleware: auth + [`checkPermissionMiddleware("View_Employee_Details")`]
  - Response: employee with associated `user` (password omitted)

- PATCH /api/employee/:id
  - Middleware: auth + [`checkPermissionMiddleware("Update_Employee")`]
  - Validate: [`employeeIdParamSchema`, `updateEmployeeSchema`]
  - Response: updated employee

4. Partner

- POST /api/partner/

  - Middleware: [`authMiddleware`](src/common/middlewares/auth.middleware.ts), [`checkPermissionMiddleware("Create_Partner")`](src/modules/partner/partner.routes.ts)
  - Validate: [`createPartnerSchema`](src/modules/partner/partner.schema.ts)
  - Request example:
    { "name": "Partner Co", "email": "p@example.com", "user": { "fullName": "...", "email": "...", "password": "..." } }
  - Response: created partner and user (password omitted)

- GET /api/partner/all

  - Middleware: auth + [`checkPermissionMiddleware("View_All_Partners")`]
  - Response: partners array

- GET /api/partner/:id

  - Middleware: auth + [`checkPermissionMiddleware("View_Partner_Details")`]
  - Response: single partner

- PATCH /api/partner/:id
  - Middleware: auth + [`checkPermissionMiddleware("Update_Partner")`]
  - Validate: [`updatePartnerSchema`]
  - Response: updated partner

5. Lead

- POST /api/lead/

  - Validate: [`createLeadSchema`](src/modules/lead/lead.schema.ts)
  - Request example:
    {
    "fullName":"Jane Doe",
    "contactNumber":"7777777777",
    "email":"jane@example.com",
    "dob":"1990-01-01",
    "gender":"FEMALE",
    "loanAmount":500000,
    "loanType":"PERSONAL_LOAN",
    "city":"City",
    "state":"State",
    "pinCode":"123456",
    "address":"Some address"
    }
  - Response:
    {
    "success": true,
    "message": "Lead created successfully",
    "data": { ...lead }
    }

- GET /api/lead/all

  - Middleware: auth + [`checkPermissionMiddleware("View_All_Leads")`]
  - Response: list of leads

- GET /api/lead/:id

  - Validate: [`leadIdParamSchema`](src/modules/lead/lead.schema.ts)
  - Response: single lead

- PATCH /api/lead/update-status/:id

  - Validate: [`updateLeadStatusSchema`]
  - Middleware: auth (permission check optional in routes)
  - Request body: { "status": "INTERESTED" }
  - Response: updated lead

- PATCH /api/lead/assign/:id

  - Validate: [`leadAssigedSchema`](src/modules/lead/lead.schema.ts) (params)
  - Middleware: auth + [`checkPermissionMiddleware("Assign_Lead")`]
  - Request body example:
    { "assignedTo": "employeeId" }
  - Response: assigned lead

- GET /api/lead/convert-to-loan/:id
  - Validate: [`leadIdParamSchema`]
  - Middleware: auth (permission optional)
  - Response: created loan application (see Loan Application endpoints)

6. Loan Applications

- POST /api/loan-applications/

  - Middleware: [`authMiddleware`](src/common/middlewares/auth.middleware.ts)
  - Validate: [`createLoanApplicationSchema`](src/modules/LoanApplication/loanApplication.schema.ts)
  - Controller: [`createLoanApplicationController`](src/modules/LoanApplication/loanApplication.controller.ts) -> service: [`createLoanApplicationService`](src/modules/LoanApplication/loanApplication.service.ts)
  - Request example (based on `CreateLoanApplication` type: [src/modules/LoanApplication/loanApplication.types.ts](src/modules/LoanApplication/loanApplication.types.ts)):
    {
    "title":"MR",
    "firstName":"John",
    "lastName":"Doe",
    "gender":"MALE",
    "dob":"1990-01-01",
    "contactNumber":"9999999999",
    "employmentType":"salaried",
    "address":"Address",
    "city":"City",
    "state":"State",
    "pinCode":"123456",
    "loanProductId":"productId",
    "requestedAmount":250000,
    "interestType":"flat",
    "cibilScore":700
    }
  - Response:
    {
    "success": true,
    "message": "Loan application created successfully",
    "data": {
    "loanApplication": { ... },
    "customer": { ... },
    "kyc": { ... }
    }
    }

- GET /api/loan-applications/

  - Middleware: auth
  - Response: list of loan applications (includes customer, kyc documents)

- GET /api/loan-applications/:id

  - Validate: [`loanApplicationIdParamSchema`](src/modules/LoanApplication/loanApplication.schema.ts)
  - Middleware: auth
  - Response: single loan application with related customer, kyc and documents

- PUT /api/loan-applications/:id/status

  - Middleware: auth
  - Validate: [`updateLoanApplicationSchema`](src/modules/LoanApplication/loanApplication.schema.ts)
  - Request body example:
    { "status":"under_review" }
  - Response: updated loan application

- PUT /api/loan-applications/:id/review

  - Middleware: auth
  - Controller: [`reviewLoanController`](src/modules/LoanApplication/loanApplication.controller.ts) -> service [`reviewLoanService`](src/modules/LoanApplication/loanApplication.service.ts)
  - Response: loan moved to review stage

- PUT /api/loan-applications/:id/approve

  - Middleware: auth (route currently not explicitly protected by permission in code)
  - Controller: [`approveLoanController`](src/modules/LoanApplication/loanApplication.controller.ts) -> service [`approveLoanService`](src/modules/LoanApplication/loanApplication.service.ts)
  - Request body: none required; `req.user` used as approver
  - Response: approved loan record

- PUT /api/loan-applications/:id/reject
  - Middleware: auth
  - Request body:
    { "reason": "Underwriter found issues" }
  - Controller: [`rejectLoanController`](src/modules/LoanApplication/loanApplication.controller.ts) -> service [`rejectLoanService`](src/modules/LoanApplication/loanApplication.service.ts)
  - Response: updated loan application with status `rejected`

7. Permissions

- POST /api/permissions/create-permissions

  - Controller: [`createPermissionsController`](src/modules/permission/permission.controller.ts)
  - Request:
    { "code":"create_user", "name":"Create User" }
  - Response: created permission

- POST /api/permissions/assign

  - Validate: [`assignPermissionsSchema`](src/modules/permission/permission.schema.ts)
  - Controller: [`assignPermissionsController`](src/modules/permission/permission.controller.ts) -> service [`assignPermissionsService`](src/modules/permission/permission.service.ts)
  - Request:
    { "userId":"userId", "permissions":["View_All_Users","Create_Employee"] }
  - Response: success message

- GET /api/permissions/user/:userId
  - Validate: [`userIdParamSchema`](src/modules/permission/permission.schema.ts)
  - Controller: [`getUserPermissionsController`](src/modules/permission/permission.controller.ts)
  - Response:
    { "success": true, "data": [ { "permission": { "code": "...", "name": "..." }, "allowed": true }, ... ] }

8. KYC / Documents

- POST /api/kyc/document/upload

  - Middleware: [`authMiddleware`](src/common/middlewares/auth.middleware.ts), file upload: [`upload.single("document")`](src/modules/kyc/kyc.routes.ts)
  - Validate: [`uploadKycDocumentSchema`](src/modules/kyc/kyc.schema.ts)
  - Request: multipart/form-data
    - Fields:
      - kycId (optional) OR loanApplicationId (optional)
      - documentType (string) — required
      - file field name: `document` (binary)
  - Controller: [`uploadKycDocumentController`](src/modules/kyc/kyc.controller.ts) -> service [`uploadKycDocumentService`](src/modules/kyc/kyc.service.ts)
  - Response:
    {
    "success": true,
    "data": { "id":"docId", "documentType":"AADHAAR", "documentPath":"/path/to/file", "uploadedBy":"userId", ... }
    }

- PUT /api/kyc/document/:id/verify

  - Middleware: auth
  - Controller: [`verifyDocumentSController`](src/modules/kyc/kyc.controller.ts) -> service [`verifyDocumentService`](src/modules/kyc/kyc.service.ts)
  - Response: updated document verification status

- PUT /api/kyc/:id/status
  - Middleware: auth
  - Controller: [`updateKycStatusController`](src/modules/kyc/kyc.controller.ts) -> service [`updateKycStatusService`](src/modules/kyc/kyc.service.ts)
  - Request:
    { "status": "APPROVED", "remarks": "All documents OK" }
  - Response: updated KYC record

---

Notes, references & code

- Validation schemas: see [src/modules/LoanApplication/loanApplication.schema.ts](src/modules/LoanApplication/loanApplication.schema.ts), [src/modules/lead/lead.schema.ts](src/modules/lead/lead.schema.ts), [src/modules/permission/permission.schema.ts](src/modules/permission/permission.schema.ts)
- Types: [src/modules/LoanApplication/loanApplication.types.ts](src/modules/LoanApplication/loanApplication.types.ts)
- Prisma models: generated client in [generated/prisma-client/client.ts](generated/prisma-client/client.ts) and model details in [generated/prisma-client/models/LoanApplication.ts](generated/prisma-client/models/LoanApplication.ts) and others under [generated/prisma-client/models](generated/prisma-client/models)
- Entry points: app — [src/app.ts](src/app.ts), server — [src/server.ts](src/server.ts), routes — [src/routes.ts](src/routes.ts)

If you want, I can commit this README content into the repository file [README.md](README.md).
