import os
import cv2
import numpy as np
import tensorflow as tf
import psycopg2

from flask import Flask, request, jsonify, session
# from flask_cors import CORS

# app = Flask(__name__)
# CORS(app, supports_credentials=True)
# CORS(app, supports_credentials=True, origins=["http://localhost:3000"])


from flask_cors import CORS

app = Flask(__name__)

app.secret_key = "supersecretkey"
CORS(app, supports_credentials=True, origins=["http://localhost:3000"])

# CORS(
#     app,
#     supports_credentials=True,
#     resources={r"/*": {"origins": "http://localhost:3000"}}
# )

# @app.after_request
# def after_request(response):
#     response.headers.add("Access-Control-Allow-Credentials", "true")
#     response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
#     response.headers.add("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
#     return response








# IMPORTANT for login session
# app.secret_key = "supersecretkey"

# ========================
# DATABASE CONNECTION
# ========================

conn = psycopg2.connect(
    dbname="fingerprint_db",   # your database name
    user="postgres",           # your postgres username
    password="Hamna@123",
    host="localhost"           # keep localhost
)

# ========================
# LOAD ML MODEL
# ========================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "models", "final_blood_model.h5")
CLASS_PATH = os.path.join(BASE_DIR, "models", "classes.txt")

model = tf.keras.models.load_model(MODEL_PATH, compile=False)

with open(CLASS_PATH, "r") as f:
    class_names = [line.strip() for line in f.readlines()]

# ========================
# USER SIDE - PREDICTION
# ========================

@app.route('/predict', methods=['POST'])
def predict():
    file = request.files['image'].read()
    nparr = np.frombuffer(file, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_GRAYSCALE)
    img = cv2.resize(img, (128, 128)) / 255.0
    img = img.reshape(1, 128, 128, 1)

    prediction = model.predict(img)
    index = np.argmax(prediction)
    blood_group = class_names[index]

    # Save to database
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO fingerprints (image, predicted_blood, is_verified)
        VALUES (%s, %s, false)
    """, (psycopg2.Binary(file), blood_group))
    conn.commit()

    return jsonify({"blood_group": blood_group})


# ========================
# ADMIN LOGIN
# ========================


@app.route('/admin/login', methods=['OPTIONS'])
def admin_login_options():
    return jsonify({}), 200



@app.route('/admin/login', methods=['POST'])
# @app.route('/admin/login', methods=['POST', 'OPTIONS'])

def admin_login():
    data = request.json
    email = data['email']
    password = data['password']

    cur = conn.cursor()
    cur.execute("SELECT id, password FROM admin_users WHERE email=%s", (email,))
    admin = cur.fetchone()

    if admin and password == admin[1]:
        session['admin_id'] = admin[0]
        return jsonify({"message": "Login successful"})
    else:
        return jsonify({"message": "Invalid credentials"}), 401


# ========================
# CHECK ADMIN
# ========================

def admin_required():
    if 'admin_id' not in session:
        return False
    return True


# ========================
# VIEW ALL UPLOADS (ADMIN)
# ========================

@app.route('/admin/fingerprints', methods=['GET'])
def get_all_fingerprints():
    if not admin_required():
        return jsonify({"message": "Unauthorized"}), 403

    cur = conn.cursor()
    cur.execute("""
        SELECT id, predicted_blood, actual_blood, is_verified, created_at 
        FROM fingerprints
    """)
    rows = cur.fetchall()

    result = []
    for row in rows:
        result.append({
            "id": row[0],
            "predicted_blood": row[1],
            "actual_blood": row[2],
            "is_verified": row[3],
            "created_at": str(row[4])
        })

    return jsonify(result)


# ========================
# VERIFY RECORD (ADMIN)
# ========================

@app.route('/admin/verify/<int:id>', methods=['POST'])
def verify_fingerprint(id):
    if not admin_required():
        return jsonify({"message": "Unauthorized"}), 403

    data = request.json
    actual_blood = data['actual_blood']

    cur = conn.cursor()
    cur.execute("""
        UPDATE fingerprints
        SET actual_blood=%s, is_verified=true
        WHERE id=%s
    """, (actual_blood, id))

    conn.commit()

    return jsonify({"message": "Verified successfully"})


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000)

    # app.run(host="localhost", port=5000)

    # app.run(port=5000)


