import os
import cv2
import numpy as np
import tensorflow as tf
from sklearn.model_selection import train_test_split
from sklearn.utils.class_weight import compute_class_weight
from sklearn.metrics import classification_report, confusion_matrix

# ---------------- CONFIG ----------------
IMG_SIZE = 128
BATCH_SIZE = 32
EPOCHS = 3  # small for fast iteration
DATASET_PATH = "dataset"
MODEL_DIR = "models"
MODEL_FILE = "fast_blood_model.keras"
CLASSES = sorted(os.listdir(DATASET_PATH))  # detect classes automatically

os.makedirs(MODEL_DIR, exist_ok=True)

# ---------------- LOAD DATA ----------------
X, y = [], []

for idx, label in enumerate(CLASSES):
    folder = os.path.join(DATASET_PATH, label)
    for img_name in os.listdir(folder):
        img_path = os.path.join(folder, img_name)
        img = cv2.imread(img_path, cv2.IMREAD_GRAYSCALE)
        if img is None:
            continue
        img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
        img = img.astype("float32") / 255.0
        X.append(np.expand_dims(img, axis=-1))
        y.append(idx)

X = np.array(X)
y = np.array(y)

# ---------------- SPLIT ----------------
X_train, X_val, y_train, y_val = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42
)

# ---------------- CLASS WEIGHTS ----------------
class_weights = compute_class_weight(
    class_weight="balanced", classes=np.unique(y_train), y=y_train
)
class_weights = dict(enumerate(class_weights))

# ---------------- CNN MODEL (SMALL & FAST) ----------------
model = tf.keras.models.Sequential([
    tf.keras.layers.Conv2D(16, (3,3), activation='relu', input_shape=(IMG_SIZE, IMG_SIZE, 1)),
    tf.keras.layers.MaxPooling2D(),
    
    tf.keras.layers.Conv2D(32, (3,3), activation='relu'),
    tf.keras.layers.MaxPooling2D(),
    
    tf.keras.layers.Conv2D(64, (3,3), activation='relu'),
    tf.keras.layers.MaxPooling2D(),
    
    tf.keras.layers.Flatten(),
    tf.keras.layers.Dense(128, activation='relu'),
    tf.keras.layers.Dropout(0.3),
    tf.keras.layers.Dense(len(CLASSES), activation='softmax')
])

model.compile(
    optimizer=tf.keras.optimizers.Adam(1e-4),
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"]
)

# ---------------- CALLBACKS ----------------
callbacks = [
    tf.keras.callbacks.EarlyStopping(patience=3, restore_best_weights=True),
    tf.keras.callbacks.ReduceLROnPlateau(patience=2, factor=0.5, verbose=1),
    tf.keras.callbacks.ModelCheckpoint(os.path.join(MODEL_DIR, MODEL_FILE), save_best_only=True)
]

# ---------------- TRAIN ----------------
history = model.fit(
    X_train, y_train,
    validation_data=(X_val, y_val),
    epochs=EPOCHS,
    batch_size=BATCH_SIZE,
    class_weight=class_weights,
    callbacks=callbacks,
    verbose=1
)

# ---------------- EVALUATE ----------------
val_loss, val_acc = model.evaluate(X_val, y_val)
print(f"Validation Accuracy: {val_acc:.4f}")

y_pred = np.argmax(model.predict(X_val), axis=1)
print("\nClassification Report:\n")
print(classification_report(y_val, y_pred, target_names=CLASSES))
