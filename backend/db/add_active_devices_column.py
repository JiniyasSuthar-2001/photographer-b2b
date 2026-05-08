import sqlite3
import os
from pathlib import Path
from sqlalchemy import text
from db.database import engine

# Resolve DB path relative to this script (backend/lumiere.db)
BASE = Path(__file__).resolve().parent.parent  # backend/
DB_PATH = BASE / "lumiere.db"

def column_exists(conn, table: str, column: str) -> bool:
    cur = conn.execute(f"PRAGMA table_info('{table}')")
    cols = cur.fetchall()
    return any(row[1] == column for row in cols)

def main():
    if not DB_PATH.exists():
        print(f"Database not found at: {DB_PATH}")
        return

    conn = sqlite3.connect(str(DB_PATH))
    try:
        if column_exists(conn, "users", "active_devices"):
            print("Column 'active_devices' already exists.")
            return

        conn.execute("ALTER TABLE users ADD COLUMN active_devices INTEGER DEFAULT 0;")
        conn.commit()
        print("Column 'active_devices' added successfully.")
    except sqlite3.OperationalError as e:
        print("SQLite error:", e)
    finally:
        conn.close()

if __name__ == "__main__":
    main()
