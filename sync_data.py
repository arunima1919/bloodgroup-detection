import os
import shutil
from backend.app import app, db, PredictionLog

# Paths
UPLOAD_FOLDER = "backend/uploads"
DATASET_FOLDER = "dataset" # Adjust this to point to your training dataset

def sync_feedback_to_dataset():
    with app.app_context():
        # 1. Get all logs where the user provided a correct/actual label
        logs = PredictionLog.query.filter(PredictionLog.actual_label.isnot(None)).all()
        
        if not logs:
            print("No new labeled data found in database.")
            return

        moved_count = 0
        for log in logs:
            source_path = os.path.join(UPLOAD_FOLDER, log.image_name)
            
            # 2. Check if the file still exists in uploads
            if os.path.exists(source_path):
                # The actual label is the folder name (e.g., "O+", "A+")
                target_folder = os.path.join(DATASET_FOLDER, log.actual_label)
                
                # Create the blood group folder if it doesn't exist
                if not os.path.exists(target_folder):
                    os.makedirs(target_folder)
                
                # 3. Move the file
                target_path = os.path.join(target_folder, log.image_name)
                shutil.move(source_path, target_path)
                
                # 4. Optional: Clear the label in DB so we don't try to move it again
                # or mark it as 'synced'
                log.image_name = f"SYNCED_{log.image_name}" 
                
                moved_count += 1
                print(f"Moved {log.image_name} to {log.actual_label} folder.")

        db.session.commit()
        print(f"✅ Successfully moved {moved_count} images to the dataset.")

if __name__ == "__main__":
    sync_feedback_to_dataset()