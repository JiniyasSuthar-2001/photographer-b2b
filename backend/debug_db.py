import sqlite3
import os

db_path = r"c:\Users\Jiniyas Suthar\OneDrive\Desktop\New folder\backend\lumiere.db"
if not os.path.exists(db_path):
    print(f"File not found: {db_path}")
else:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT username, full_name, phone, city FROM users")
    users = cursor.fetchall()
    print("All Users:")
    for user in users:
        print(f"Username: {user[0]}, Name: {user[1]}, Phone: '{user[2]}', City: {user[3]}")
    conn.close()
