import os
import cv2
import numpy as np
import tensorflow as tf
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "models", "final_blood_model.h5")
CLASS_PATH = os.path.join(BASE_DIR, "models", "classes.txt")

# Load Brain
model = tf.keras.models.load_model(MODEL_PATH, compile=False)
with open(CLASS_PATH, "r") as f:
    class_names = [line.strip() for line in f.readlines()]

@app.route('/predict', methods=['POST'])
def predict():
    print("📥 Request received")

    if 'image' not in request.files:
        return jsonify({"error": "No image"}), 400

    file = request.files['image'].read()
    print("🖼 Image read, size:", len(file))

    # Convert bytes to NumPy array
    nparr = np.frombuffer(file, np.uint8)

    # Try to decode BMP, PNG, JPG
    img = cv2.imdecode(nparr, cv2.IMREAD_GRAYSCALE)
    if img is None:
        print("❌ Failed to decode image")
        return jsonify({"error": "Cannot decode image"}), 400

    print("🧠 Image decoded")

    # Resize & normalize
    img = cv2.resize(img, (128, 128)) / 255.0
    img = img.reshape(1, 128, 128, 1)
    print("🔄 Image preprocessed")

    prediction = model.predict(img)
    print("✅ Prediction done")

    index = np.argmax(prediction)
    confidence = float(np.max(prediction))
    return jsonify({"blood_group": class_names[index], "confidence": confidence})



if __name__ == "__main__":
    app.run(port=5000, debug=True)
