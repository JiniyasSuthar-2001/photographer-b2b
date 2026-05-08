import sqlite3

def add_column():
    conn = sqlite3.connect('backend/lumiere.db')
    cursor = conn.cursor()
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN active_devices INTEGER DEFAULT 0")
        print("Successfully added active_devices column.")
    except sqlite3.OperationalError as e:
        print(f"OperationalError: {e}")
    finally:
        conn.commit()
        conn.close()

if __name__ == "__main__":
    add_column()
