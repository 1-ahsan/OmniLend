
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
