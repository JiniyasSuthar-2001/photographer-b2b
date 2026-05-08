# 🚀 Lumière API: Postman Testing Guide

This guide provides the **JSON request bodies** for all core API endpoints in the Lumière platform. 
Use these in Postman with the `RAW -> JSON` format.

---

## 🔐 Authentication
**Base URL:** `http://localhost:8000/api/auth`

### 1. User Signup
*   **Method:** `POST`
*   **URL:** `/signup`
*   **Payload:**
```json
{
  "username": "johndoe",
  "password": "securepassword123",
  "phone": "9876543210",
  "full_name": "John Doe",
  "city": "Ahmedabad",
  "category": "Wedding",
  "user_type": "photographer"
}
```

### 2. User Login
*   **Method:** `POST`
*   **URL:** `/login`
*   **Payload:**
```json
{
  "username": "admin",
  "password": "admin@001"
}
```

### 3. Forgot Password
*   **Method:** `POST`
*   **URL:** `/forgot-password`
*   **Payload:**
```json
{
  "username": "admin"
}
```

---

## 📸 Job Management
**Base URL:** `http://localhost:8000/api/jobs`
*Required Header:* `Authorization: Bearer <your_token>`

### 4. Create New Job
*   **Method:** `POST`
*   **URL:** `/`
*   **Payload:**
```json
{
  "title": "Grand Wedding - Taj Skyline",
  "client": "Aisha Patel",
  "venue": "Taj Skyline, Ahmedabad",
  "budget": 45000,
  "category": "Wedding",
  "date": "2026-05-18T10:00:00",
  "roles": ["Lead", "Candid", "Drone"]
}
```

### 5. Update Job Details
*   **Method:** `PUT`
*   **URL:** `/{job_id}`
*   **Payload:**
```json
{
  "title": "Updated Wedding Title",
  "budget": 50000,
  "venue": "Marriott, Ahmedabad"
}
```

---

## 🤝 Team & Collaboration
**Base URL:** `http://localhost:8000/api/team`
*Required Header:* `Authorization: Bearer <your_token>`

### 6. Search Registered Photographer (by Phone)
*   **Method:** `GET`
*   **URL:** `/users/search?phone=9123456780`
*   **Payload:** *(None required)*

### 7. Send Team Invitation (Add Teammate)
*   **Method:** `POST`
*   **URL:** `/request`
*   **Payload:**
```json
{
  "phone": "9123456780",
  "display_name": "Sofia Reyes",
  "display_category": "Lead",
  "display_city": "Ahmedabad"
}
```

### 8. Update Teammate Info (Alias)
*   **Method:** `PATCH`
*   **URL:** `/{member_id}`
*   **Payload:**
```json
{
  "display_name": "Sofia (Master Lead)",
  "display_category": "Master",
  "display_city": "Surat"
}
```

### 9. Discover Photographers (Public Feed)
*   **Method:** `GET`
*   **URL:** `/discover?city=Ahmedabad&category=Wedding`
*   **Payload:** *(None required)*

### 10. View Collaboration History
*   **Method:** `GET`
*   **URL:** `/collaborations/{member_id}?page=1&limit=10`
*   **Payload:** *(None required)*


---

## 📩 Job Invitations (Requests)
**Base URL:** `http://localhost:8000/api/requests`
*Required Header:* `Authorization: Bearer <your_token>`

### 11. Send Job Invite to Photographer
*   **Method:** `POST`
*   **URL:** `/`
*   **Payload:**
```json
{
  "job_id": 1,
  "receiver_id": 2,
  "role": "Candid",
  "budget": 15000
}
```

### 12. Respond to Job Invite (Accept/Decline)
*   **Method:** `PATCH`
*   **URL:** `/{request_id}?status=accepted`
*   **Payload:** *(None required in body, status passed as query param)*

### 13. Cancel Sent Request
*   **Method:** `DELETE`
*   **URL:** `/{request_id}`
*   **Payload:** *(None required)*


---

## ✅ Tasks
**Base URL:** `http://localhost:8000/api/tasks`
*Required Header:* `Authorization: Bearer <your_token>`

### 10. Create Task for Job
*   **Method:** `POST`
*   **URL:** `/`
*   **Payload:**
```json
{
  "job_id": 1,
  "text": "Check battery levels and SD cards"
}
```

---

## 📈 Analytics & Profile
**Base URL:** `http://localhost:8000/api/profile` (or equivalent)

### 11. Update Photographer Profile
*   **Method:** `PATCH`
*   **URL:** `/profile`
*   **Payload:**
```json
{
  "bio": "Expert wedding photographer with a passion for candid moments.",
  "skills_text": "Candid,Traditional,Cinematic",
  "years_experience": 5,
  "instagram_handle": "@lumiere.official"
}
```

---

## 🔔 Notifications
**Base URL:** `http://localhost:8000/api/notifications`

### 12. Update Notification Status
*   **Method:** `PATCH`
*   **URL:** `/{notification_id}`
*   **Payload:**
```json
{
  "is_read": true
}
```
