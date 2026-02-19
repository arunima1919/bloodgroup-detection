import os
import shutil
import psycopg2
from datetime import datetime

# ---------- PATHS ----------
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(PROJECT_ROOT, "backend", "uploads")
DATASET_DIR = os.path.join(PROJECT_ROOT, "dataset_augmented")

# ---------- DB CONNECTION ----------
conn = psycopg2.connect(
    dbname="blood_db",
    user="postgres",
    password="nimak",
    host="localhost",
    port="5432"
)

cursor = conn.cursor()

cursor.execute("""
SELECT id, image_name, actual_label, created_at
FROM prediction_logs
WHERE actual_label IS NOT NULL
AND image_name LIKE '20%';
""")

rows = cursor.fetchall()

print(f"Found {len(rows)} feedback images.")

for row in rows:
    id_, image_name, label, created_at = row

    source_path = os.path.join(UPLOAD_DIR, image_name)

    if not os.path.exists(source_path):
        print(f"Missing file: {image_name}")
        continue

    # Create unique new name
    timestamp = created_at.strftime("%Y%m%d_%H%M%S")
    new_filename = f"{timestamp}_{id_}.BMP"

    target_folder = os.path.join(DATASET_DIR, label)
    os.makedirs(target_folder, exist_ok=True)

    destination_path = os.path.join(target_folder, new_filename)

    shutil.copy(source_path, destination_path)

    print(f"Copied → {label}/{new_filename}")

cursor.close()
conn.close()

print("Merge complete.")
