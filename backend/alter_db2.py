import sqlite3
import os

def run():
    db_path = os.path.join(os.path.dirname(__file__), 'verion.db')
    print(f"Altering DB at: {db_path}")
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    
    try:
        c.execute("ALTER TABLE users ADD COLUMN preferred_niches TEXT")
        print("Successfully added preferred_niches column.")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e):
            print("Column preferred_niches already exists.")
        else:
            print(f"Error: {e}")
            
    conn.commit()
    conn.close()

if __name__ == "__main__":
    run()
