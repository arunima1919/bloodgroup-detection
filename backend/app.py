import os
import cv2
import numpy as np
import tensorflow as tf
import psycopg2
from flask_mail import Mail, Message
import random
from werkzeug.security import generate_password_hash, check_password_hash


from flask import Flask, request, jsonify, session

from flask_cors import CORS

app = Flask(__name__)

app.secret_key = "supersecretkey"

app.config['SESSION_COOKIE_SAMESITE'] = "Lax"
app.config['SESSION_COOKIE_SECURE'] = False


# CORS(app, supports_credentials=True, origins=["http://localhost:3000"])
# CORS(app, supports_credentials=True)
CORS(
    app,
    supports_credentials=True,
    origins=["http://localhost:3000"]
)


app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'bloodgroup346@gmail.com'
app.config['MAIL_PASSWORD'] = 'btwa szxc spav eedg'

mail = Mail(app)



@app.route("/send-otp", methods=["POST"])
def send_otp():
    data = request.json
    email = data['email']

    otp = str(random.randint(100000, 999999))
    session['otp'] = otp
    session['temp_email'] = email

    msg = Message(
        subject="Your OTP Code",
        sender=app.config['MAIL_USERNAME'],
        recipients=[email]
    )
    msg.body = f"Your OTP is: {otp}"

    mail.send(msg)

    return jsonify({"message": "OTP sent"})



@app.route("/verify-otp", methods=["POST"])
def verify_otp():
    data = request.json
    entered_otp = data['otp']
    name = data['name']
    password = data['password']

    if entered_otp != session.get('otp'):
        return jsonify({"message": "Invalid OTP"}), 400

    email = session.get('temp_email')

    # 🔐 HASH PASSWORD HERE
    hashed_password = generate_password_hash(password)

    cur = conn.cursor()
    cur.execute(
        "INSERT INTO users (name, email, password, is_verified) VALUES (%s, %s, %s, true)",
        (name, email, hashed_password)
    )
    conn.commit()

    session.pop('otp', None)
    session.pop('temp_email', None)

    return jsonify({"message": "Account created successfully"})



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

PROJECT_ROOT = os.path.dirname(BASE_DIR)  # Go up one level

MODEL_PATH = os.path.join(PROJECT_ROOT, "models", "best_original_cnn (2).keras")
CLASS_PATH = os.path.join(PROJECT_ROOT, "models", "classes.txt")


print("MODEL PATH:", MODEL_PATH)
print("File exists:", os.path.exists(MODEL_PATH))
model = tf.keras.models.load_model(MODEL_PATH, compile=False)

# Print layers once to check last conv layer
for layer in model.layers:
    print(layer.name)

with open(CLASS_PATH, "r") as f:
    class_names = [line.strip() for line in f.readlines()]





import tensorflow as tf
import base64
def make_gradcam_heatmap(img_array, model, last_conv_layer_name):

    grad_model = tf.keras.models.Model(
        inputs=model.inputs,
        outputs=[model.get_layer(last_conv_layer_name).output, model.output]
    )

    with tf.GradientTape() as tape:

        conv_outputs, predictions = grad_model(img_array)

        pred_index = tf.argmax(predictions[0])
        loss = predictions[:, pred_index]

    grads = tape.gradient(loss, conv_outputs)

    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))

    conv_outputs = conv_outputs[0]

    heatmap = conv_outputs @ pooled_grads[..., tf.newaxis]

    heatmap = tf.squeeze(heatmap)

    # heatmap = tf.maximum(heatmap, 0) / tf.math.reduce_max(heatmap)
    heatmap = tf.maximum(heatmap, 0)
    heatmap /= tf.math.reduce_max(heatmap) + 1e-8

    return heatmap.numpy()
def overlay_gradcam(original_img, heatmap):

    heatmap = cv2.resize(heatmap, (original_img.shape[1], original_img.shape[0]))

    heatmap = np.uint8(255 * heatmap)

    heatmap = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)

    overlay = cv2.addWeighted(original_img, 0.6, heatmap, 0.4, 0)

    return overlay





# @app.route('/predict', methods=['POST'])
# def predict():

#     # 🔐 Check login first
#     # if 'user_id' not in session:
#     if 'user_id' not in session and 'admin_id' not in session:
#         return jsonify({"message": "Login required"}), 401

#     file = request.files['image'].read()
#     nparr = np.frombuffer(file, np.uint8)

#     # img = cv2.imdecode(nparr, cv2.IMREAD_GRAYSCALE)
#     # img = cv2.resize(img, (64, 64))
#     # img = img / 255.0

#     # img = img.reshape(1, 64, 64, 1)


#     heatmap = generate_gradcam(img_input, model)

#     original_color = cv2.cvtColor(img_resized, cv2.COLOR_GRAY2BGR)

#     overlay = cv2.addWeighted(original_color, 0.6, heatmap, 0.4, 0)

#     # img = cv2.resize(img, (128, 128)) / 255.0
#     # img = img.reshape(1, 128, 128, 1)

#     prediction = model.predict(img)
#     index = np.argmax(prediction)
#     predicted_label = class_names[index]
#     confidence_score = float(np.max(prediction))

#     # 💾 Save to results table
#     cur = conn.cursor()
#      # ✅ If USER
#     if "user_id" in session:
#         cur.execute(
#             "INSERT INTO results (user_id, result, confidence) VALUES (%s,%s,%s)",
#             (session["user_id"], predicted_label, confidence_score)
#         )

#     # ✅ If ADMIN (do not save to user results)
#     if "admin_id" in session:
#         cur.execute("""
#             INSERT INTO fingerprints (predicted_blood, is_verified, uploaded_by)
#             VALUES (%s, false, %s)
#         """, (predicted_label, "admin"))
#     conn.commit()
#     cur.close()
#     _, buffer = cv2.imencode(".png", overlay)
#     gradcam_base64 = base64.b64encode(buffer).decode("utf-8")

#     return jsonify({
#         "blood_group": predicted_label,
#         "confidence": confidence_score,   
#         "gradcam_image": gradcam_base64

#     })











@app.route('/predict', methods=['POST'])
def predict():

    # 🔐 Check login
    if 'user_id' not in session and 'admin_id' not in session:
        return jsonify({"message": "Login required"}), 401

    # Read uploaded image
    file = request.files['image'].read()
    nparr = np.frombuffer(file, np.uint8)

    # Decode fingerprint image
    img_original = cv2.imdecode(nparr, cv2.IMREAD_GRAYSCALE)

    # Resize to model input size
    img_resized = cv2.resize(img_original, (64, 64))

    # Normalize
    img_norm = img_resized / 255.0

    # Reshape for CNN
    img_input = img_norm.reshape(1, 64, 64, 1)

    # ========================
    # MODEL PREDICTION
    # ========================
    prediction = model.predict(img_input)

    index = np.argmax(prediction)

    predicted_label = class_names[index]

    confidence_score = float(np.max(prediction))

    # ========================
    # GRAD-CAM
    # ========================
    heatmap = make_gradcam_heatmap(
        img_input,
        model,
        last_conv_layer_name="conv2d_3"
    )

    # Convert original to color
    original_color = cv2.cvtColor(img_resized, cv2.COLOR_GRAY2BGR)

    # Overlay heatmap
    gradcam_image = overlay_gradcam(original_color, heatmap)

    # Convert image to base64
    _, buffer = cv2.imencode(".png", gradcam_image)
    gradcam_base64 = base64.b64encode(buffer).decode("utf-8")

    # ========================
    # SAVE TO DATABASE
    # ========================
    cur = conn.cursor()

    # If USER prediction
    if "user_id" in session:
        cur.execute(
            "INSERT INTO results (user_id, result, confidence) VALUES (%s,%s,%s)",
            (session["user_id"], predicted_label, confidence_score)
        )

    # If ADMIN prediction
    if "admin_id" in session:
        cur.execute("""
            INSERT INTO fingerprints (predicted_blood, is_verified, uploaded_by)
            VALUES (%s, false, %s)
        """, (predicted_label, "admin"))

    conn.commit()
    cur.close()

    # ========================
    # RETURN RESULT
    # ========================
    return jsonify({
        "blood_group": predicted_label,
        "confidence": confidence_score,
        "gradcam_image": gradcam_base64
    })

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
    # if admin and check_password_hash(admin[1], password):

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


@app.route("/admin/fingerprints", methods=["GET"])

def get_admin_fingerprints():

    if 'admin_id' not in session:
        return jsonify({"error": "Unauthorized"}), 401

    cur = conn.cursor()

    # ✅ ONLY ADMIN UPLOADS
    cur.execute("""
        SELECT id, predicted_blood, actual_blood, is_verified,uploaded_by, created_at
    FROM fingerprints
    ORDER BY id DESC
    """)

    rows = cur.fetchall()
    cur.close()

    result = []
    for row in rows:
        result.append({
            "id": row[0],
            "predicted_blood": row[1],
            "actual_blood": row[2],
            "is_verified": row[3],
            "uploaded_by": row[4],

            "created_at": row[5].strftime("%Y-%m-%d %H:%M:%S")
        })

    return jsonify(result)


@app.route("/admin/results", methods=["GET"])
def admin_results():

    if 'admin_id' not in session:
        return jsonify({"error": "Unauthorized"}), 401

    cur = conn.cursor()

    cur.execute("""
        SELECT results.id, users.name, users.email, results.result, results.confidence, results.created_at
        FROM results
        JOIN users ON results.user_id = users.id
        ORDER BY results.created_at DESC
    """)

    rows = cur.fetchall()
    cur.close()

    data = []
    for row in rows:
        data.append({
            "id": row[0],
            "name": row[1],
            "email": row[2],
            "result": row[3],
            "confidence": row[4],
            "created_at": row[5].strftime("%Y-%m-%d %H:%M:%S")
        })

    return jsonify(data)




# VERIFY RECORD (ADMIN)
# ========================
@app.route('/admin/verify/<int:id>', methods=['POST'])
def verify_fingerprint(id):

    if 'admin_id' not in session:
        return jsonify({"message": "Unauthorized"}), 403

    data = request.json
    actual_blood = data['actual_blood']

    cur = conn.cursor()

    cur.execute("""
        UPDATE fingerprints
        SET actual_blood=%s,
            is_verified=true
        WHERE id=%s
    """, (actual_blood, id))

    conn.commit()
    cur.close()

    return jsonify({"message": "Verified successfully"})



@app.route("/admin/check", methods=["GET"])
def check_admin():
    if 'admin_id' in session:
        return jsonify({"loggedIn": True})
    return jsonify({"loggedIn": False}), 401




@app.route("/admin/logout", methods=["POST"])
def admin_logout():
    session.pop('admin_id', None)
    return jsonify({"message": "Logged out"})





@app.route("/register", methods=["POST"])
def register():
    data = request.json
    name = data['name']
    email = data['email']
    password = data['password']

    cur = conn.cursor()
    hashed_password = generate_password_hash(password)

    cur.execute(
        "INSERT INTO users (name, email, password) VALUES (%s, %s, %s)",
        (name, email, hashed_password)
    )
    conn.commit()

    return jsonify({"message": "Registered successfully"})


@app.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data['email']
    password = data['password']

    cur = conn.cursor()
    cur.execute("SELECT id, password FROM users WHERE email=%s", (email,))
    user = cur.fetchone()

    if user and check_password_hash(user[1], password):
        session['user_id'] = user[0]
        return jsonify({"message": "Login successful"})
    else:
        return jsonify({"message": "Invalid credentials"}), 401





@app.route("/user/check", methods=["GET"])
def check_user():
    if 'user_id' in session:
        return jsonify({"loggedIn": True})
    return jsonify({"loggedIn": False}), 401


@app.route("/user/logout", methods=["POST"])
def user_logout():
    session.pop('user_id', None)
    return jsonify({"message": "Logged out"})






@app.route("/user/history", methods=["GET"])
def user_history():
    if "user_id" not in session:
        return jsonify({"message": "Unauthorized"}), 401

    user_id = session["user_id"]

    cur = conn.cursor()
    cur.execute(
        "SELECT result, confidence, created_at FROM results WHERE user_id=%s ORDER BY created_at DESC",
        (user_id,)
    )
    rows = cur.fetchall()

    history = []
    for row in rows:
        history.append({
            "result": row[0],
            "confidence": row[1],
            "date": row[2]
        })

    cur.close()

    return jsonify(history)















@app.route("/predict-scan", methods=["POST"])
def predict_scan():
    
    if 'admin_id' not in session:
        return jsonify({"error": "Unauthorized"}), 403

    try:
       # Get project root
        PROJECT_ROOT = os.path.abspath(
            os.path.join(os.path.dirname(__file__), "..")
        )

        # Build path to sample image
        # sample_path = os.path.join(PROJECT_ROOT, "sample_input", "a.BMP")
        sample_path = r"C:\Users\admin\Desktop\maincloned-copy3college\medical-frontend\sample_input\a.BMP"
        # Debug
        print("Backend file location:", os.path.dirname(__file__))
        print("Looking for file at:", sample_path)
        print("File exists:", os.path.exists(sample_path))
        if not os.path.exists(sample_path):
            return jsonify({"error": "Scanned file not found"}), 400

        file = open(sample_path, "rb").read()

        img = cv2.imdecode(np.frombuffer(file, np.uint8), cv2.IMREAD_GRAYSCALE)
        img = cv2.resize(img, (64, 64)) / 255.0
        img = img.reshape(1, 64, 64, 1)

        prediction = model.predict(img)
        index = np.argmax(prediction)
        blood_group = class_names[index]

        # ✅ SAVE ONLY ADMIN UPLOAD
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO fingerprints (image, predicted_blood, is_verified, uploaded_by)
            VALUES (%s, %s, false, %s)
        """, (psycopg2.Binary(file), blood_group, "admin"))

        conn.commit()
        cur.close()

        return jsonify({
            "blood_group": blood_group
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500









if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000)


