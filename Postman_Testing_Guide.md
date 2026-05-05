# Postman API Testing Guide

This guide explains how to test the Lumière Backend APIs using Postman. 

## 1. Prerequisites
- **Postman** installed on your machine.
- **Backend Running**: Make sure your FastAPI server is running:
  ```bash
  uvicorn main:app --reload --port 8000
  ```
- **Base URL**: All requests use `http://localhost:8000/api`

---

## 2. Testing Authentication APIs

### A. User Signup (`POST /auth/signup`)
Use this to create a new user account.

1.  **Method**: `POST`
2.  **URL**: `http://localhost:8000/api/auth/signup`
3.  **Headers**:
    - `Content-Type`: `application/json`
4.  **Body** (Select **raw** and **JSON**):
    ```json
    {
        "username": "johndoe",
        "password": "securepassword123"
    }
    ```
5.  **Expected Response**: `200 OK` with a success message.

### B. User Login (`POST /auth/login`)
Use this to log in and receive an access token.

1.  **Method**: `POST`
2.  **URL**: `http://localhost:8000/api/auth/login`
3.  **Headers**:
    - `Content-Type`: `application/json`
4.  **Body** (Select **raw** and **JSON**):
    ```json
    {
        "username": "johndoe",
        "password": "securepassword123"
    }
    ```
5.  **Expected Response**: `200 OK` with an `access_token`.
    - **Note**: Copy the `access_token` value; you will need it for protected routes.

---

## 3. Testing Protected Routes (Future)
Once we implement protected routes (like Jobs or Team), you will need to include the token in the headers.

1.  **Method**: `GET` (or `POST`, `PUT`, etc.)
2.  **URL**: `http://localhost:8000/api/protected-route`
3.  **Headers**:
    - `Authorization`: `Bearer YOUR_ACCESS_TOKEN_HERE`
    - `Content-Type`: `application/json`

---

## 4. Postman Collection (Importable JSON)

You can copy the code below, save it as `Lumiere_API.postman_collection.json`, and import it directly into Postman.

```json
{
	"info": {
		"_postman_id": "lumiere-backend-collection",
		"name": "Lumière API",
		"schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
	},
	"item": [
		{
			"name": "Auth",
			"item": [
				{
					"name": "Signup",
					"request": {
						"method": "POST",
						"header": [],
						"body": {
							"mode": "raw",
							"raw": "{\n    \"username\": \"testuser\",\n    \"password\": \"password123\"\n}",
							"options": {
								"raw": {
									"language": "json"
								}
							}
						},
						"url": {
							"raw": "http://localhost:8000/api/auth/signup",
							"protocol": "http",
							"host": [
								"localhost"
							],
							"port": "8000",
							"path": [
								"api",
								"auth",
								"signup"
							]
						}
					},
					"response": []
				},
				{
					"name": "Login",
					"request": {
						"method": "POST",
						"header": [],
						"body": {
							"mode": "raw",
							"raw": "{\n    \"username\": \"testuser\",\n    \"password\": \"password123\"\n}",
							"options": {
								"raw": {
									"language": "json"
								}
							}
						},
						"url": {
							"raw": "http://localhost:8000/api/auth/login",
							"protocol": "http",
							"host": [
								"localhost"
							],
							"port": "8000",
							"path": [
								"api",
								"auth",
								"login"
							]
						}
					},
					"response": []
				}
			]
		}
	]
}
```
