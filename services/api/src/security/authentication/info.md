
##  API Routes

### 1 Login User

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

## Authentication Middleware (`authenticate`)

The `authenticate` middleware is responsible for verifying the access token attached to incoming API requests.

**Working:**
1. Extracts the access token from the request's `Authorization` header.
2. Verifies and decodes the token using the configured JWT secret.
3. If verification is successful, it attaches the decoded token payload to the request object:

   ```javascript
   req.user = decodedToken;
   ```

4. Calls `next()` to pass control to the next middleware or route handler.

**If token verification fails** (e.g., invalid or expired token), it terminates the request and returns the following response:

   ```javascript
   return res.status(401).json({
     success: false,
     message: "Invalid or expired access token.",
   });
   ```

**Important:**
- Subsequent middleware and controllers can access authenticated user information through `req.user`.
- Any route using this middleware requires a valid access token.
- This middleware handles authentication only. Authorization and permission checks are handled separately.