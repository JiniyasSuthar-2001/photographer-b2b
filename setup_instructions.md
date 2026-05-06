# Lumière Project Setup Instructions (Manual Files)

This package contains the files that are excluded from Git for security or data persistence reasons. For the project to work correctly, please place these files in their respective directories within your local repository.

## File Placement Guide

| File | Destination Folder | Description |
| :--- | :--- | :--- |
| **`lumiere.db`** | `(Root Directory)` | The primary SQLite database containing all data. |
| **`.env`** | `backend/` | The environment configuration file with security keys. |
| **`postman.json`** | `(Root Directory)` | The latest API collection for testing. |
| **`Backend_API_Documentation.md`** | `(Root Directory)` | Technical reference for all implemented endpoints. |
| **`Postman_Testing_Guide.md`** | `(Root Directory)` | Guide on how to import and use the Postman collection. |
| **`update_postman.py`** | `(Root Directory)` | Script to sync codebase changes with Postman. |
| **`check_schema.py`** | `(Root Directory)` | Utility script to verify the database structure. |

## Quick Start Steps
1. **Pull the code** from the GitHub repository.
2. **Move these files** to the locations listed above.
3. **Backend Setup**:
   - `cd backend`
   - `pip install -r requirements.txt`
   - `python main.py`
4. **Frontend Setup**:
   - `cd frontend`
   - `npm install`
   - `npm run dev`

---
*Note: If `lumiere.db` already exists in the root after pulling, please overwrite it with this version to ensure you have the most up-to-date registered users and test jobs.*
