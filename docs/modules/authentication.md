# OmniLend – Authentication Module

## 1. Overview

The Authentication Module is responsible for verifying the identity of users accessing the OmniLend system.

Whenever a user wants to access the system, they must first authenticate themselves by providing valid login credentials (email and password).

The module verifies the credentials against the users stored in the PostgreSQL database. If the credentials are valid and the account is active, the system generates a JSON Web Token (JWT), which can be used to authenticate subsequent API requests.

The module follows **Clean Architecture**, keeping business logic independent of the database, HTTP framework, and external security libraries.

### Technologies Used

- **Node.js:** Backend runtime.
- **Express.js:** REST API framework.
- **PostgreSQL:** User data storage.
- **pg:** PostgreSQL database connectivity.
- **bcrypt:** Password verification.
- **jsonwebtoken:** JWT generation and verification.

---

## 2. Objectives

The main objectives of this module are:

1. Authenticate users before allowing access to the system.
2. Verify user credentials against PostgreSQL.
3. Prevent inactive or locked accounts from logging in.
4. Generate JWT access tokens after successful authentication.
5. Maintain the last login timestamp.
6. Provide a reusable authentication mechanism for other modules.
7. Support different account types, including platform administrators and tenant users.

---

## 3. Architecture

The Authentication Module follows Clean Architecture and is divided into four main layers.

### 3.1 Domain Layer

Contains the core business entities and repository contracts.

Responsibilities:

- Represent the User entity.
- Define user-related business rules.
- Define the operations required from the authentication repository.
- Remain independent of external frameworks and libraries.

### 3.2 Application Layer

Contains the application's business use cases.

Responsibilities:

- Implement the login process.
- Coordinate user retrieval and password verification.
- Check account status.
- Request JWT generation.
- Return authenticated user information.

### 3.3 Infrastructure Layer

Contains implementations that communicate with external technologies.

Responsibilities:

- Retrieve user records from PostgreSQL.
- Update the last login timestamp.
- Verify passwords using bcrypt.
- Generate and verify JWT tokens.

### 3.4 Presentation Layer

Handles incoming HTTP requests and outgoing HTTP responses.

Responsibilities:

- Define authentication API routes.
- Validate login requests.
- Receive login credentials.
- Call application use cases.
- Return appropriate HTTP responses.

### Architecture Flow

```text
                 Client Application
                         |
                         |
                         v
                 Presentation Layer
                 ------------------
                 Auth Routes
                 Login Validator
                 Auth Controller
                         |
                         v
                 Application Layer
                 -----------------
                 LoginUser Use Case
                         |
                         v
                   Domain Layer
                   ------------
                   User Entity
                   Auth Repository Contract
                         |
                         |
                         v
                Infrastructure Layer
                --------------------
                PostgreSQL Repository
                Password Service
                Token Service
                         |
             +-----------+-----------+
             |           |           |
             v           v           v
          PostgreSQL   bcrypt      JWT
```

The Application layer receives infrastructure implementations through Dependency Injection rather than creating them directly.

---

## 4. Folder Structure

The authentication module is located inside:

`services/api/src/modules/authentication/`

```text
authentication/
│
├── domain/
│   ├── entities/
│   │   └── User.js
│   │
│   └── repositories/
│       └── IAuthRepository.js
│
├── application/
│   └── use-cases/
│       └── LoginUser.js
│
├── infrastructure/
│   ├── repositories/
│   │   └── PostgresAuthRepository.js
│   │
│   └── security/
│       ├── PasswordService.js
│       └── TokenService.js
│
├── presentation/
│   ├── controllers/
│   │   └── AuthController.js
│   │
│   ├── routes/
│   │   └── authRoutes.js
│   │
│   └── validators/
│       └── loginValidator.js
│
└── index.js
```

### File Responsibilities

| File | Responsibility |
|---|---|
| User.js | Represents the user entity and user-related business rules. |
| IAuthRepository.js | Defines the authentication repository contract. |
| LoginUser.js | Implements the login business logic. |
| PostgresAuthRepository.js | Retrieves users and updates login timestamps in PostgreSQL. |
| PasswordService.js | Compares submitted passwords with stored bcrypt hashes. |
| TokenService.js | Generates and verifies JWT access tokens. |
| AuthController.js | Handles HTTP requests and responses. |
| authRoutes.js | Defines authentication API endpoints. |
| loginValidator.js | Validates login request data. |
| index.js | Connects all layers using Dependency Injection. |

---

## 5. Database Structure

The Authentication Module uses the existing `users` table in the PostgreSQL database.

### Table: users

| Column | Data Type | Description |
|---|---|---|
| id | UUID | Unique user identifier and primary key. |
| tenant_id | UUID | Associated tenant identifier; nullable for platform administrators. |
| employee_id | UUID | Associated employee identifier; nullable for platform administrators. |
| email | VARCHAR(255) | User's login email address. |
| password_hash | TEXT | Hashed user password. |
| account_type | VARCHAR(30) | Type of account. |
| status | VARCHAR(20) | Current account status. |
| last_login_at | TIMESTAMPTZ | Timestamp of the last successful login. |
| created_at | TIMESTAMPTZ | Account creation timestamp. |
| updated_at | TIMESTAMPTZ | Last record update timestamp. |

### Account Types

The system currently supports two account types:

**1. platform_admin**

- Represents the administrator of the entire OmniLend SaaS platform.
- Does not belong to a particular tenant.
- Has `tenant_id = NULL`.
- Has `employee_id = NULL`.

**2. tenant_user**

- Represents an employee belonging to a tenant.
- Must have an associated tenant.
- Must have an associated employee record.

### Account Status

The users table supports three account statuses:

| Status | Description |
|---|---|
| active | User is allowed to authenticate. |
| inactive | User account is disabled. |
| locked | User account is locked and cannot authenticate. |

Only users with `active` status can successfully log in.

### Database Constraints

The users table includes:

- Primary key on `id`.
- Case-insensitive unique email index.
- Unique tenant and employee combination.
- Foreign key connecting tenant users with employee records.
- Check constraints for account types and account statuses.

---

## 6. Authentication Process

The login process follows these steps:

### Step 1: User submits credentials

The user enters their email and password in the login interface.

The frontend sends an HTTP POST request to the authentication API.

### Step 2: Request validation

The login validator checks:

- Email is provided.
- Password is provided.
- Email has a valid format.
- Password is a string and within the supported bcrypt input limit.

The email is trimmed and converted to lowercase.

### Step 3: Find user

The LoginUser use case requests the user record from PostgresAuthRepository.

The repository searches PostgreSQL using the email address.

```sql
SELECT
    id,
    tenant_id,
    employee_id,
    email,
    password_hash,
    account_type,
    status,
    last_login_at
FROM users
WHERE LOWER(email) = LOWER($1)
LIMIT 1;
```

Parameterized queries are used to protect against SQL injection.

### Step 4: Verify account status

The application checks whether the user exists and whether their account status is `active`.

If the user does not exist or the account is inactive or locked, authentication is rejected.

### Step 5: Verify password

The PasswordService uses bcrypt to compare the submitted password with the stored password hash.

The actual password is never stored in plaintext.

### Step 6: Generate JWT

If the password is correct, TokenService generates a JWT access token.

The token contains the authenticated user's identity and account information.

### Step 7: Update last login

The repository updates:

- `last_login_at`
- `updated_at`

### Step 8: Return response

The controller returns the generated access token and safe user information to the client.

The password hash is never included in the response.

### Login Workflow Diagram

```text
              Start
                |
                v
        User submits credentials
                |
                v
        Validate request data
                |
          +-----+-----+
          |           |
        Invalid      Valid
          |           |
          v           v
       HTTP 400    Find user in DB
                      |
                +-----+-----+
                |           |
              Not found    Found
                |           |
                v           v
             HTTP 401   Check status
                            |
                      +-----+-----+
                      |           |
                   Inactive     Active
                   /Locked        |
                      |           v
                      |     Verify password
                      |           |
                      |      +----+----+
                      |      |         |
                      |    Invalid   Valid
                      |      |         |
                      v      v         v
                   HTTP 401       Generate JWT
                                      |
                                      v
                                Update last login
                                      |
                                      v
                               Return JWT token
                                      |
                                      v
                                    End
```

---

## 7. API Routes

### 7.1 Login User

**Endpoint:**

`POST /api/auth/login`

**Description:**

Authenticates a user using their email and password.

**Authentication Required:** No.

**Request Headers:**

```http
Content-Type: application/json
```

**Request Body:**

```json
{
    "email": "admin@example.com",
    "password": "your-password"
}
```

**Successful Response:**

HTTP Status: `200 OK`

```json
{
    "success": true,
    "message": "Login successful",
    "data": {
        "accessToken": "<JWT_ACCESS_TOKEN>",
        "user": {
            "id": "<USER_UUID>",
            "email": "admin@example.com",
            "accountType": "platform_admin",
            "tenantId": null,
            "employeeId": null
        }
    }
}
```

**Invalid Credentials Response:**

HTTP Status: `401 Unauthorized`

```json
{
    "success": false,
    "message": "Invalid email or password"
}
```

The same public authentication error is returned for nonexistent, inactive, and locked accounts to avoid revealing account information.

**Invalid Request Response:**

HTTP Status: `400 Bad Request`

```json
{
    "success": false,
    "message": "Email is required"
}
```

### Current Route Summary

| Method | Endpoint | Description | Authentication |
|---|---|---|---|
| POST | `/api/auth/login` | Authenticate a user and generate an access token. | Not required |

**Note:** Login is the only API route implemented in the current version of this module. Other authentication endpoints will be added as development progresses.

---

## 8. JWT Token Management

JSON Web Tokens are used to represent an authenticated user.

After successful login, the backend generates an access token containing user identity information.

### Token Payload

The current implementation includes:

```json
{
    "id": "<USER_UUID>",
    "tenantId": "<TENANT_UUID_OR_NULL>",
    "accountType": "platform_admin"
}
```

JWT metadata:

| Property | Value |
|---|---|
| Algorithm | HS256 (jsonwebtoken default for a symmetric secret) |
| Issuer | `omnilend-api` |
| Audience | `omnilend` |
| Expiration | 15 minutes by default |
| Secret | Environment variable `JWT_SECRET` |

### Environment Variables

The API `.env` file must contain:

```env
JWT_SECRET=your-long-random-secret
JWT_EXPIRES_IN=15m
```

Generate a secure secret using:

```bash
openssl rand -base64 48
```

The generated secret must remain private and must never be committed to GitHub.

### Token Verification

The TokenService also provides a method for verifying JWTs.

This method will be used by the authentication middleware when protected routes are implemented.

---

## 9. Password Security

The system uses bcrypt for password verification.

The database stores only the password hash in the `password_hash` column.

During login:

1. The user submits their password.
2. The backend retrieves the stored password hash.
3. bcrypt compares the submitted password with the stored hash.
4. If they match, authentication continues.

The original password is never retrieved from the database because it is never stored there.

---

## 10. Dependency Injection

The module uses Dependency Injection to connect its different layers.

The `index.js` file acts as the composition root.

It creates instances of:

- PostgresAuthRepository
- PasswordService
- TokenService
- LoginUser
- AuthController

These dependencies are injected into the required components.

### Dependency Flow

```text
PostgresAuthRepository
          |
          |
          v
       LoginUser <------ PasswordService
          ^
          |
          |
      TokenService

          |
          v
     AuthController
          |
          v
      Auth Routes
```

This approach keeps the Application layer independent of specific infrastructure implementations.

For example, if the database technology changes in the future, the login business logic does not need to be rewritten.

---

## 11. Testing

The login endpoint can be tested using Postman or curl.

### Start the API

```bash
npm run dev
```

### Test Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
-H "Content-Type: application/json" \
-d '{
    "email": "admin@example.com",
    "password": "your-admin-password"
}'
```

Replace the example credentials with the actual administrator credentials.

### Test Cases

| Test Case | Expected Result |
|---|---|
| Correct email and password | HTTP 200 |
| Incorrect password | HTTP 401 |
| Nonexistent email | HTTP 401 |
| Inactive account | HTTP 401 |
| Locked account | HTTP 401 |
| Missing email | HTTP 400 |
| Missing password | HTTP 400 |
| Invalid email format | HTTP 400 |
| Password exceeding bcrypt input limit | HTTP 400 |

---

## 12. Security Considerations

The following security measures should be maintained:

1. Passwords must never be stored in plaintext.
2. JWT secrets must be stored in environment variables.
3. All production API communication must use HTTPS.
4. SQL queries must use parameterized statements.
5. Authentication errors must not reveal whether an account exists.
6. Login endpoints should have rate limiting to prevent brute-force attacks.
7. Passwords and JWT tokens must never be written to application logs.
8. JWT signature, expiration, issuer, and audience must be verified on protected routes.
9. Tenant users must only access data belonging to their own tenant.
10. Authorization must be enforced separately from authentication.
11. Browser and mobile clients must store tokens securely.
12. Access tokens should have a short expiration time.

---

## 13. Future Enhancements

The following features are planned for future development.

### 13.1 Authentication Middleware

A middleware will be created to:

- Read JWT access tokens from incoming requests.
- Verify token signatures.
- Validate token expiration, issuer, and audience.
- Attach authenticated user information to the request.
- Reject unauthenticated requests.

### 13.2 Get Current User

**Planned Endpoint:**

`GET /api/auth/me`

Returns the currently authenticated user's profile.

### 13.3 Authorization Middleware

Authentication verifies user identity, whereas authorization determines what operations the user can perform.

The authorization layer will restrict access according to account type, roles, and permissions.

### 13.4 Refresh Tokens

Refresh tokens will allow users to obtain new access tokens without entering their credentials again.

They should be stored securely on the server, rotated when used, and revocable.

### 13.5 Logout

**Planned Endpoint:**

`POST /api/auth/logout`

Logout will revoke the user's refresh-token session and clear the client-side authentication state.

Short-lived JWT access tokens will otherwise remain valid until expiration unless an additional revocation mechanism is implemented.

### 13.6 Login Rate Limiting

Rate limiting will help prevent repeated login attempts and brute-force attacks.

### 13.7 Audit Logging

Authentication events such as successful login, failed login, logout, and password changes can be recorded for security monitoring.

---

## 14. Current Implementation Status

| Feature | Status |
|---|---|
| Initial Super Admin account | Completed |
| Users database table | Completed |
| User entity | Implemented |
| Authentication repository contract | Implemented |
| Login use case | Implemented |
| PostgreSQL authentication repository | Implemented |
| Password verification using bcrypt | Implemented |
| JWT access token generation | Implemented |
| JWT verification service method | Implemented |
| Login request validation | Implemented |
| Login controller | Implemented |
| Login API route | Implemented |
| Dependency injection | Implemented |
| Authentication middleware | Pending |
| Get current user endpoint | Pending |
| Authorization middleware | Pending |
| Refresh tokens | Pending |
| Logout | Pending |
| Login rate limiting | Pending |

---

## 15. Conclusion

The Authentication Module provides the initial identity verification mechanism for OmniLend.

It allows registered users to authenticate using their email and password. The system verifies credentials against PostgreSQL, checks account status, and generates a JWT access token after successful authentication.

The implementation follows Clean Architecture, making the module maintainable, testable, and independent of specific infrastructure technologies.

Future enhancements will complete the authentication lifecycle and introduce authorization, refresh-token management, logout, and tenant-level access control.

**Module:** Authentication  
**Project:** OmniLend  
**Architecture:** Clean Architecture  
**Backend:** Node.js and Express.js  
**Database:** PostgreSQL  
**Authentication:** JWT and bcrypt