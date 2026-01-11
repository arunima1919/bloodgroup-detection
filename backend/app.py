import os
import cv2
import numpy as np
import tensorflow as tf
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from database import get_db_connection

# -------------------- App Setup --------------------
app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

MODEL_PATH = os.path.join(BASE_DIR, "models", "final_blood_model.h5")
CLASS_PATH = os.path.join(BASE_DIR, "models", "classes.txt")

# -------------------- Load Model --------------------
model = tf.keras.models.load_model(MODEL_PATH, compile=False)

with open(CLASS_PATH, "r") as f:
    class_names = [line.strip() for line in f.readlines()]

# -------------------- Save Prediction --------------------
def save_prediction(image_path, predicted_group):
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        INSERT INTO fingerprint_history 
        (image_path, predicted_blood_group)
        VALUES (%s, %s)
    """, (image_path, predicted_group))

    conn.commit()
    cur.close()
    conn.close()

    print("💾 Saved to DB:", image_path, predicted_group)

# -------------------- Predict API --------------------
@app.route("/predict", methods=["POST"])
def predict():
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    image_file = request.files["image"]

    # ✅ create unique filename
    filename = datetime.now().strftime("%Y%m%d_%H%M%S") + ".png"
    image_path = os.path.join(UPLOAD_FOLDER, filename)

    # save image to disk
    image_file.save(image_path)

    # read image for prediction
    img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    if img is None:
        return jsonify({"error": "Invalid image"}), 400

    img = cv2.resize(img, (128, 128)) / 255.0
    img = img.reshape(1, 128, 128, 1)

    prediction = model.predict(img)
    index = int(np.argmax(prediction))
    confidence = float(np.max(prediction))
    predicted_group = class_names[index]

    # ✅ save real image path
    save_prediction(filename, predicted_group)

    return jsonify({
        "blood_group": predicted_group,
        "confidence": confidence
    })

# -------------------- History API --------------------
@app.route("/history", methods=["GET"])
def history():
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT id, image_path, predicted_blood_group, actual_blood_group, created_at
        FROM fingerprint_history
        ORDER BY created_at DESC
    """)

    rows = cur.fetchall()
    cur.close()
    conn.close()

    data = []
    for row in rows:
        data.append({
            "id": row[0],
            "image_path": row[1],
            "predicted": row[2],
            "actual": row[3],
            "time": row[4].strftime("%Y-%m-%d %H:%M:%S")
        })

    return jsonify(data)

# -------------------- Update Actual --------------------
@app.route("/update-actual", methods=["POST"])
def update_actual():
    data = request.json
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        UPDATE fingerprint_history
        SET actual_blood_group = %s
        WHERE id = %s
    """, (data["actual"], data["id"]))

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "Updated successfully"})

# -------------------- Serve Images --------------------
@app.route("/uploads/<filename>")
def uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

# -------------------- Run --------------------
if __name__ == "__main__":
    app.run(port=5000, debug=True)
