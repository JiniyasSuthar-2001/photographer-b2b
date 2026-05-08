import sqlite3

def fix():
    conn = sqlite3.connect('lumiere.db')
    cursor = conn.cursor()
    try:
        cursor.execute("ALTER TABLE notifications ADD COLUMN redirect_to VARCHAR DEFAULT '/job-hub'")
        conn.commit()
        print("Column redirect_to added successfully.")
    except Exception as e:
        print("Error:", e)
    conn.close()

if __name__ == "__main__":
    fix()
