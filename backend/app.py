import os
import cv2
import numpy as np
import tensorflow as tf
import gc
import random
import smtplib
from email.mime.text import MIMEText
from flask_bcrypt import Bcrypt


from flask import Flask, request, jsonify, session
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
from werkzeug.utils import secure_filename

# ---------------- CONFIG ----------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
PROJECT_ROOT = os.path.dirname(BASE_DIR)

MODEL_PATH = os.path.join(PROJECT_ROOT, "models", "final_blood_model_strong.keras")
CLASS_PATH = os.path.join(PROJECT_ROOT, "models", "classes.txt")

IMG_SIZE = 128
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# ---------------- FLASK SETUP ----------------
app = Flask(__name__)
bcrypt = Bcrypt(app)
app.secret_key = "supersecretkey"

CORS(app, supports_credentials=True, origins=["http://localhost:3000"])

# ---------------- DATABASE ----------------
app.config["SQLALCHEMY_DATABASE_URI"] = "postgresql://postgres:nimak@localhost:5432/blood_db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)

# ---------------- DATABASE MODELS ----------------

class PredictionLog(db.Model):
    __tablename__ = "prediction_logs"

    id = db.Column(db.Integer, primary_key=True)
    image_name = db.Column(db.String(255))
    prediction = db.Column(db.String(50))
    confidence = db.Column(db.Float)
    actual_label = db.Column(db.String(50), nullable=True)
    is_correct = db.Column(db.Boolean, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)



class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(10), default="user")
    is_verified = db.Column(db.Boolean, default=False)
    otp = db.Column(db.String(6), nullable=True)
    otp_expiry = db.Column(db.DateTime, nullable=True)



# ---------------- LOAD MODEL ----------------
model = tf.keras.models.load_model(MODEL_PATH)

with open(CLASS_PATH, "r") as f:
    class_names = [line.strip() for line in f.readlines()]

print("Classes loaded:", class_names)

# ---------------- AUTH HELPERS ----------------
def admin_required():
    return session.get("role") == "admin"


def user_required():
    return "user_id" in session


# ---------------- USER SIGNUP ----------------

# ---------------- SIGNUP ROUTE ----------------
@app.route("/signup", methods=["POST"])
def signup():
    data = request.json
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    # Validate input
    if not name or not email or not password:
        return jsonify({"error": "All fields required"}), 400

    # Check if verified user already exists
    existing_user = User.query.filter_by(email=email, is_verified=True).first()
    if existing_user:
        return jsonify({"error": "Email already exists"}), 400

    # Hash password
    hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")

    # Generate OTP
    otp = str(random.randint(100000, 999999))
    otp_expiry = datetime.utcnow() + timedelta(minutes=5)

    # Store signup info temporarily in session
    session["signup_data"] = {
        "name": name,
        "email": email,
        "password": hashed_password,
        "otp": otp,
        "otp_expiry": otp_expiry
    }

    # Send OTP via email
    try:
        send_otp_email(email, otp)
        print(f"[INFO] OTP for {email}: {otp}")  # For debugging/testing
        return jsonify({"message": "OTP sent to your email"})
    except Exception as e:
        session.pop("signup_data", None)
        return jsonify({"error": f"Failed to send OTP: {str(e)}"}), 500


# ---------------- VERIFY OTP ROUTE ----------------
@app.route("/verify-otp", methods=["POST"])
def verify_otp():
    data = request.json
    email = data.get("email")
    otp_entered = data.get("otp")

    signup_data = session.get("signup_data")

    if not signup_data or signup_data["email"] != email:
        return jsonify({"error": "No pending signup found"}), 400

    # Compare UTC aware datetimes
    from datetime import datetime, timezone
    otp_expiry = signup_data["otp_expiry"]
    if isinstance(otp_expiry, str):
        # Convert from string if stored as ISO format
        otp_expiry = datetime.fromisoformat(otp_expiry)

    if datetime.now(timezone.utc) > otp_expiry:
        session.pop("signup_data", None)
        return jsonify({"error": "OTP expired"}), 400

    # Check OTP match
    if signup_data["otp"] != otp_entered:
        return jsonify({"error": "Invalid OTP"}), 400

    # OTP is correct → create user in DB
    user = User(
        name=signup_data["name"],
        email=signup_data["email"],
        password=signup_data["password"],
        role="user",
        is_verified=True
    )

    try:
        db.session.add(user)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Signup failed: {str(e)}"}), 500
    finally:
        session.pop("signup_data", None)

    session["user_id"] = user.id
    session["role"] = user.role

    return jsonify({
        "message": "Signup and verification successful",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        }
    })




# ---------------- USER LOGIN ----------------
@app.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400

    user = User.query.filter_by(email=email).first()

    if not user or not bcrypt.check_password_hash(user.password, password):
        return jsonify({"error": "Invalid credentials"}), 401

    if not user.is_verified:
        return jsonify({"error": "Please verify your email first"}), 403

    session.clear()
    session["user_id"] = user.id
    session["role"] = user.role

    return jsonify({
        "message": "Login successful",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        }
    })





# ---------------- PREDICTION ----------------
@app.route("/predict", methods=["POST"])
def predict():
    if "image" not in request.files:
        return jsonify({"error": "No image provided"}), 400

    try:
        file = request.files["image"]
        filename = secure_filename(file.filename)
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(file_path)

        img = cv2.imread(file_path, cv2.IMREAD_GRAYSCALE)
        if img is None:
            raise ValueError("Invalid image")

        img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
        img = cv2.equalizeHist(img)
        img = img.astype("float32") / 255.0
        img = np.expand_dims(img, axis=-1)
        img = np.expand_dims(img, axis=0)

        preds = model.predict(img)
        class_index = int(np.argmax(preds[0]))
        confidence = float(np.max(preds[0]))
        blood_group = class_names[class_index]

        log = PredictionLog(
            image_name=filename,
            prediction=blood_group,
            confidence=confidence
        )
        db.session.add(log)
        db.session.commit()

        del img
        gc.collect()

        return jsonify({
            "blood_group": blood_group,
            "confidence": confidence,
            "log_id": log.id
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ---------------- PREDICT SCAN ----------------
@app.route("/predict-scan", methods=["POST"])
def predict_scan():
    print("SESSION DATA:", dict(session))
    if session.get("role") != "admin":
        return jsonify({"error": "Unauthorized"}), 403

    try:
        sample_path = os.path.join(PROJECT_ROOT, "sample_input", "a.BMP")
        if not os.path.exists(sample_path):
            return jsonify({"error": "Scanned file not found"}), 400

        img = cv2.imread(sample_path, cv2.IMREAD_GRAYSCALE)
        if img is None:
            return jsonify({"error": "Failed to read image"}), 400

        img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
        img = cv2.equalizeHist(img)
        img = img.astype("float32") / 255.0
        img = np.expand_dims(img, axis=-1)
        img = np.expand_dims(img, axis=0)

        print("Image ready for prediction, shape:", img.shape)

        preds = model.predict(img)
        class_index = int(np.argmax(preds[0]))
        confidence = float(np.max(preds[0]))
        blood_group = class_names[class_index]

        log = PredictionLog(
            image_name="a.BMP",
            prediction=blood_group,
            confidence=confidence
        )
        db.session.add(log)
        db.session.commit()

        return jsonify({
            "blood_group": blood_group,
            "confidence": confidence,
            "log_id": log.id
        })

    except Exception as e:
        print("Error during prediction:", e)
        return jsonify({"error": str(e)}), 500


# ---------------- ADMIN VIEW ----------------
@app.route("/admin/predictions", methods=["GET"])
def admin_view_predictions():
    if not admin_required():
        return jsonify({"error": "Unauthorized"}), 403

    logs = PredictionLog.query.order_by(PredictionLog.created_at.desc()).all()
    result = []
    for log in logs:
        result.append({
            "id": log.id,
            "image_name": log.image_name,
            "prediction": log.prediction,
            "confidence": log.confidence,
            "actual_label": log.actual_label,
            "is_correct": log.is_correct,
            "created_at": str(log.created_at)
        })

    return jsonify(result)

# ---------------- LOGOUT ----------------
@app.route("/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"message": "Logged out successfully"})

def send_otp_email(email, otp):
    sender_email = "bloodgroup346@gmail.com"
    sender_password = "btwa szxc spav eedg"  # Gmail app password

    msg = MIMEText(f"Your OTP for account verification is: {otp}")
    msg["Subject"] = "Verify Your Account - Blood Detection System"
    msg["From"] = sender_email
    msg["To"] = email

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(sender_email, sender_password)
        server.sendmail(sender_email, email, msg.as_string())

# ---------------- RUN ----------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False, threaded=True)


