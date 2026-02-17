import os
import cv2
import numpy as np
import tensorflow as tf
from sklearn.model_selection import train_test_split
from sklearn.utils.class_weight import compute_class_weight
from sklearn.metrics import classification_report, confusion_matrix
from tensorflow.keras import layers, models
from tensorflow.keras.callbacks import ReduceLROnPlateau, ModelCheckpoint

# ---------------- CONFIG ----------------
IMG_SIZE = 128
BATCH_SIZE = 32
EPOCHS = 25
DATASET_PATH = "dataset"
MODEL_DIR = "models"
CLASSES = ['A+', 'A-', 'AB+', 'AB-', 'B+', 'O+', 'O-']

os.makedirs(MODEL_DIR, exist_ok=True)

# ---------------- LOAD DATA ----------------
def load_images(data_path):
    images, labels = [], []
    for idx, label in enumerate(CLASSES):
        folder = os.path.join(data_path, label)
        if not os.path.exists(folder):
            continue
        for img_name in os.listdir(folder):
            img_path = os.path.join(folder, img_name)
            img = cv2.imread(img_path, cv2.IMREAD_GRAYSCALE)
            if img is None:
                continue
            # Preprocessing
            img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
            img = cv2.equalizeHist(img)  # Enhance fingerprint lines
            img = img.astype("float32") / 255.0
            img = np.expand_dims(img, axis=-1)  # Add channel dimension
            images.append(img)
            labels.append(idx)
    return np.array(images), np.array(labels)

print("📂 Loading dataset...")
X, y = load_images(DATASET_PATH)
print(f"Total samples: {len(X)}")

# ---------------- TRAIN/VAL SPLIT ----------------
X_train, X_val, y_train, y_val = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42
)

# ---------------- CLASS WEIGHTS ----------------
class_weights = compute_class_weight(
    class_weight='balanced',
    classes=np.unique(y_train),
    y=y_train
)
class_weights = dict(enumerate(class_weights))
print("Class weights:", class_weights)

# ---------------- MODEL ----------------
model = models.Sequential([
    layers.Conv2D(32, (3,3), activation='relu', input_shape=(IMG_SIZE, IMG_SIZE, 1)),
    layers.BatchNormalization(),
    layers.MaxPooling2D(),

    layers.Conv2D(64, (3,3), activation='relu'),
    layers.BatchNormalization(),
    layers.MaxPooling2D(),

    layers.Conv2D(128, (3,3), activation='relu'),
    layers.BatchNormalization(),
    layers.MaxPooling2D(),

    layers.Flatten(),
    layers.Dense(256, activation='relu'),
    layers.Dropout(0.4),
    layers.Dense(len(CLASSES), activation='softmax')
])

model.compile(
    optimizer=tf.keras.optimizers.Adam(1e-4),
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']
)

model.summary()

# ---------------- CALLBACKS ----------------
checkpoint = ModelCheckpoint(
    os.path.join(MODEL_DIR, "final_blood_model_strong.keras"),
    monitor='val_accuracy',
    save_best_only=True,
    verbose=1
)

lr_scheduler = ReduceLROnPlateau(
    monitor='val_loss',
    factor=0.5,
    patience=3,
    verbose=1
)

# ---------------- TRAIN ----------------
history = model.fit(
    X_train, y_train,
    validation_data=(X_val, y_val),
    epochs=EPOCHS,
    batch_size=BATCH_SIZE,
    class_weight=class_weights,
    callbacks=[checkpoint, lr_scheduler]
)

# ---------------- EVALUATE ----------------
val_loss, val_acc = model.evaluate(X_val, y_val)
print(f"Validation Accuracy: {val_acc:.4f}")

y_pred = np.argmax(model.predict(X_val), axis=1)
print("Classification Report:\n", classification_report(y_val, y_pred, target_names=CLASSES))
print("Confusion Matrix:\n", confusion_matrix(y_val, y_pred))

# ---------------- SAVE CLASSES ----------------
with open(os.path.join(MODEL_DIR, "classes.txt"), "w") as f:
    for c in CLASSES:
        f.write(f"{c}\n")

print("✅ Training completed, model and classes saved.")
