import os
import cv2
import shutil
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
from gradcam_utils import generate_gradcam
from skimage.morphology import skeletonize
from skimage.feature import corner_harris, corner_peaks
from skimage.morphology import skeletonize
import keras
# ---------------- CONFIG ----------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
PROJECT_ROOT = os.path.dirname(BASE_DIR)

MODEL_PATH = os.path.join(PROJECT_ROOT, "models", "best_original1_cnn.keras")
CLASS_PATH = os.path.join(PROJECT_ROOT, "models", "classes.txt")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# ---------------- PATTERN MODEL ----------------
PATTERN_MODEL_PATH = os.path.join(PROJECT_ROOT, "models", "pattern_model.keras")

try:
    pattern_model = keras.models.load_model(PATTERN_MODEL_PATH, compile=False)
    print("Pattern model loaded successfully")
except Exception as e:
    print("Pattern model loading failed:", e)
    pattern_model = None

pattern_classes = ["Arch", "Loop", "Whorl"]


# ---------------- FLASK SETUP ----------------
app = Flask(__name__, static_folder='static')
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
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"))

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


# ---------------- LOAD MODEL & CLASS NAMES ----------------


best_original_model = keras.models.load_model(
    MODEL_PATH,
    compile=False
)


try:
    with open(CLASS_PATH, "r") as f:
        class_names = [line.strip() for line in f.readlines()]
    print("Classes loaded:", class_names)
except Exception as e:
    print("Error loading class names:", e)
    class_names = []
# ---------------- AUTH HELPERS ----------------
def admin_required():
    return session.get("role") == "admin"


def user_required():
    return "user_id" in session


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
IMG_SIZE = 64

def preprocess_fingerprint(img_bgr):

    # 1. Convert to grayscale
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)

     # 2. CLAHE enhancement
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8,8))
    enhanced = clahe.apply(gray)
    # 2. Resize to model input size (64x64)
    resized = cv2.resize(enhanced, (64, 64))

    # 3. Normalize
    normalized = resized.astype("float32") / 255.0

    # 4. Add channel dimension
    normalized = np.expand_dims(normalized, axis=-1)

    return normalized, resized


@app.route("/predict", methods=["POST"])
def predict():

    if "user_id" not in session:
        return jsonify({"error": "Unauthorized"}), 401

    if "image" not in request.files:
        return jsonify({"error": "No image provided"}), 400

    try:

        file = request.files["image"]

        filename = datetime.now().strftime("%Y%m%d_%H%M%S") + ".BMP"

        file_path = os.path.join(UPLOAD_FOLDER, filename)

        file.save(file_path)

        img_bgr = cv2.imread(file_path)

        if img_bgr is None:
            return jsonify({"error": "Invalid image"}), 400

        orig_h, orig_w = img_bgr.shape[:2]

        # -------- Blood Model Preprocessing --------

        img_norm, resized = preprocess_fingerprint(img_bgr)

        img_input = np.expand_dims(img_norm, axis=0)

        preds = best_original_model.predict(img_input)

        class_index = int(np.argmax(preds[0]))

        predicted_identity = class_names[class_index]

        confidence = float(np.max(preds[0]))

        #---pattern recognition
# -------- Pattern Detection --------
        pattern_label = None
        try:
            pattern_img = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
            pattern_img = cv2.resize(pattern_img, (128, 128))
            pattern_img = pattern_img.astype("float32") / 255.0
            pattern_img = np.expand_dims(pattern_img, axis=-1)
            pattern_img = np.expand_dims(pattern_img, axis=0)

            pattern_preds = pattern_model.predict(pattern_img)
            pattern_index = int(np.argmax(pattern_preds[0]))
            pattern_label = pattern_classes[pattern_index]

        except Exception as e:
            print("Pattern detection error:", e)        
        # -------- GradCAM --------

        gradcam_url = None

        try:

            heatmap = generate_gradcam(
                img_input,
                best_original_model,
                None
            )

            heatmap = cv2.resize(heatmap, (orig_w, orig_h))

            heatmap = np.uint8(255 * heatmap)

            heatmap_color = cv2.applyColorMap(
                heatmap,
                cv2.COLORMAP_JET
            )

            gradcam_img = cv2.addWeighted(
                img_bgr,
                0.6,
                heatmap_color,
                0.4,
                0
            )

            gradcam_filename = "gc_" + filename

            gradcam_save_path = os.path.join(
                BASE_DIR,
                "static",
                "gradcam",
                gradcam_filename
            )

            cv2.imwrite(gradcam_save_path, gradcam_img)

            gradcam_url = f"/static/gradcam/{gradcam_filename}"

        except Exception as e:
            print("GradCAM error:", e)

        # -------- Save Log --------

        log = PredictionLog(
            user_id=session["user_id"],
            image_name=filename,
            prediction=predicted_identity,
            confidence=confidence
        )

        db.session.add(log)
        db.session.commit()

        return jsonify({
            "blood_group": predicted_identity,
            "confidence": confidence,
            "pattern": pattern_label,
            "gradcam_image": gradcam_url,
            "log_id": log.id
        })

    except Exception as e:

        db.session.rollback()

        return jsonify({"error": str(e)}), 500
    
@app.route("/predict-scan", methods=["POST"])
def predict_scan():
    print("🔥 HIT PREDICT SCAN")
    print("SESSION DATA:", dict(session))
    if session.get("role") != "admin":
        return jsonify({"error": "Unauthorized"}), 403

    try:
        user_id = session.get("user_id")

        # Load sample scan image
        sample_path = os.path.join(PROJECT_ROOT, "sample_input", "a.BMP")
        if not os.path.exists(sample_path):
            return jsonify({"error": "Scanned file not found"}), 400

        # Copy image to uploads folder with timestamp
        filename = datetime.now().strftime("%Y%m%d_%H%M%S") + "_scan.BMP"
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        shutil.copy(sample_path, file_path)

        # Read image
        img_bgr = cv2.imread(file_path)
        if img_bgr is None:
            return jsonify({"error": "Failed to read image"}), 400

        orig_h, orig_w = img_bgr.shape[:2]

        # Preprocess fingerprint
        img_norm, resized = preprocess_fingerprint(img_bgr)

        # Ensure shape matches model input (1,64,64,1)
        img_input = np.expand_dims(img_norm, axis=0)

        # -------- PREDICTION --------
        preds = best_original_model.predict(img_input)
        class_index = int(np.argmax(preds[0]))
        predicted_identity = class_names[class_index]
        confidence = float(np.max(preds[0]))

        #--PATTERN RECOGNITION
# -------- Pattern Detection --------
        pattern_label = None
        try:
            pattern_img = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
            pattern_img = cv2.resize(pattern_img, (128, 128))
            pattern_img = pattern_img.astype("float32") / 255.0
            pattern_img = np.expand_dims(pattern_img, axis=-1)
            pattern_img = np.expand_dims(pattern_img, axis=0)

            pattern_preds = pattern_model.predict(pattern_img)
            pattern_index = int(np.argmax(pattern_preds[0]))
            pattern_label = pattern_classes[pattern_index]

        except Exception as e:
            print("Pattern detection error:", e)

        # -------- GRADCAM --------
        gradcam_url = None
        try:
            # Find last convolutional layer automatically
            last_conv_layer = None
            for layer in reversed(best_original_model.layers):
                if "conv" in layer.name:
                    last_conv_layer = layer.name
                    break

            if last_conv_layer is None:
                raise Exception("No convolutional layer found for GradCAM")

            heatmap = generate_gradcam(img_input, best_original_model, layer_name=last_conv_layer)

            if heatmap is not None:
                # Resize to original image size
                heatmap = cv2.resize(heatmap, (orig_w, orig_h))
                heatmap = np.uint8(255 * heatmap)
                heatmap_color = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)
                gradcam_img = cv2.addWeighted(img_bgr, 0.6, heatmap_color, 0.4, 0)

                # Save GradCAM
                gradcam_filename = "gc_" + filename
                gradcam_save_path = os.path.join(BASE_DIR, "static", "gradcam", gradcam_filename)
                os.makedirs(os.path.dirname(gradcam_save_path), exist_ok=True)
                cv2.imwrite(gradcam_save_path, gradcam_img)
                gradcam_url = f"/static/gradcam/{gradcam_filename}"

        except Exception as e:
            print("[GRADCAM ERROR]", e)

        # -------- SAVE LOG --------
        log = PredictionLog(
            user_id=user_id,
            image_name=filename,
            prediction=predicted_identity,
            confidence=confidence
        )

        db.session.add(log)
        db.session.commit()

        return jsonify({
            "blood_group": predicted_identity,
            "confidence": confidence,
            "pattern": pattern_label,
            "gradcam_image": gradcam_url,
            "log_id": log.id
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        db.session.rollback()
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

@app.route("/admin/history", methods=["GET"])
def admin_history():

    if session.get("role") != "admin":
        return jsonify({"error": "Unauthorized"}), 403

    # Admin predictions
    admin_logs = (
        db.session.query(PredictionLog, User)
        .join(User, PredictionLog.user_id == User.id)
        .filter(User.role == "admin")
        .order_by(PredictionLog.created_at.desc())
        .all()
    )

    admin_data = []
    for log, user in admin_logs:
        admin_data.append({
            "id": log.id,
            "prediction": log.prediction,
            "actual_label": log.actual_label,
            "confidence": log.confidence,
            "timestamp": log.created_at,
        })

    # User predictions
    user_logs = (
        db.session.query(PredictionLog, User)
        .join(User, PredictionLog.user_id == User.id)
        .filter(User.role == "user")
        .order_by(PredictionLog.created_at.desc())
        .all()
    )

    user_data = []
    for log, user in user_logs:
        user_data.append({
            "id": log.id,
            "username": user.name,
            "email": user.email,
            "prediction": log.prediction,
            "actual_label": log.actual_label,
            "confidence": log.confidence,
            "timestamp": log.created_at,
        })

    return jsonify({
        "admin_predictions": admin_data,
        "user_predictions": user_data
    })

# ---------------- FEEDBACK ----------------
@app.route("/feedback", methods=["POST"])
def feedback():
    try:
        data = request.json
        log_id = data.get("log_id")
        actual_label = data.get("actual_label")

        if not log_id or not actual_label:
            return jsonify({"error": "Missing data"}), 400

        log = PredictionLog.query.get(log_id)

        if not log:
            return jsonify({"error": "Log not found"}), 404

        log.actual_label = actual_label
        log.is_correct = (log.prediction == actual_label)

        db.session.commit()

        return jsonify({"message": "Feedback saved successfully"})

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


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


