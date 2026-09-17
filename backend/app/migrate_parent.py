import sqlite3

def migrate():
    con = sqlite3.connect("adapted.db")
    cur = con.cursor()

    # 1. Update users table columns
    user_cols = [col[1] for col in cur.execute("PRAGMA table_info(users)").fetchall()]
    if "role" not in user_cols:
        cur.execute("ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'student'")
        print("Added role to users")
    if "link_code" not in user_cols:
        cur.execute("ALTER TABLE users ADD COLUMN link_code VARCHAR(30)")
        print("Added link_code to users")

    # 2. Update learning_activity table columns
    act_cols = [col[1] for col in cur.execute("PRAGMA table_info(learning_activity)").fetchall()]
    if "description" not in act_cols:
        cur.execute("ALTER TABLE learning_activity ADD COLUMN description VARCHAR(255)")
        print("Added description to learning_activity")

    # 3. Create parent_student_links table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS parent_student_links (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        parent_id INTEGER NOT NULL REFERENCES users(id),
        student_id INTEGER NOT NULL REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    print("parent_student_links table verified")

    # 4. Assign link_code to existing users if null
    rows = cur.execute("SELECT id, role, link_code FROM users").fetchall()
    for uid, role, lcode in rows:
        if not lcode:
            prefix = "PARENT" if role == "parent" else "STUDENT"
            new_code = f"{prefix}-{uid:04d}"
            cur.execute("UPDATE users SET link_code = ? WHERE id = ?", (new_code, uid))
            print(f"Assigned {new_code} to user {uid}")

    con.commit()
    con.close()
    print("Database migration complete!")

if __name__ == "__main__":
    migrate()
