import os
import cv2
import numpy as np
import tensorflow as tf
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.model_selection import train_test_split
from sklearn.utils.class_weight import compute_class_weight
from sklearn.metrics import classification_report, confusion_matrix

from tensorflow.keras.callbacks import ReduceLROnPlateau, EarlyStopping
from tensorflow.keras.preprocessing.image import ImageDataGenerator

# ---------------- CONFIG ----------------
IMG_SIZE = 128
BATCH_SIZE = 32
EPOCHS = 15

DATASET_PATH = "dataset_combined"   # ✅ changed
MODEL_PATH = os.path.join("models", "final_blood_model_strong.keras")
NEW_MODEL_PATH = os.path.join("models", "final_blood_model_retrained_augmented.keras")  # ✅ new file

CLASSES = ['A+', 'A-', 'AB+', 'AB-', 'B+', 'B-', 'O+', 'O-']

# ---------------- LOAD SAVED MODEL ----------------
print("📦 Loading base trained model...")
model = tf.keras.models.load_model(MODEL_PATH)
print("✅ Model loaded successfully.")

# ---------------- LOAD DATA ----------------
def load_images(data_path):
    images, labels = [], []

    for idx, label in enumerate(CLASSES):
        folder = os.path.join(data_path, label)
        if not os.path.exists(folder):
            print(f"⚠ Warning: {label} folder not found in {data_path}")
            continue

        for img_name in os.listdir(folder):
            img_path = os.path.join(folder, img_name)
            img = cv2.imread(img_path, cv2.IMREAD_GRAYSCALE)

            if img is None:
                continue

            img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
            img = cv2.equalizeHist(img)
            img = cv2.GaussianBlur(img, (3, 3), 0)

            img = img.astype("float32") / 255.0
            img = np.expand_dims(img, axis=-1)

            images.append(img)
            labels.append(idx)

    return np.array(images), np.array(labels)


print("📂 Loading augmented dataset...")
X, y = load_images(DATASET_PATH)
print("Total samples:", len(X))

# ---------------- SPLIT ----------------
X_train, X_val, y_train, y_val = train_test_split(
    X, y,
    test_size=0.2,
    stratify=y,
    random_state=42
)

# ---------------- CLASS WEIGHTS ----------------
class_weights = compute_class_weight(
    class_weight="balanced",
    classes=np.unique(y_train),
    y=y_train
)
class_weights = dict(enumerate(class_weights))

# ---------------- DATA AUGMENTATION ----------------
train_datagen = ImageDataGenerator(
    rotation_range=15,
    width_shift_range=0.08,
    height_shift_range=0.08,
    zoom_range=0.15,
    shear_range=0.08
)

val_datagen = ImageDataGenerator()

train_generator = train_datagen.flow(
    X_train, y_train,
    batch_size=BATCH_SIZE
)

val_generator = val_datagen.flow(
    X_val, y_val,
    batch_size=BATCH_SIZE
)

# ---------------- CALLBACKS ----------------
lr_scheduler = ReduceLROnPlateau(
    monitor="val_loss",
    factor=0.5,
    patience=3,
    verbose=1
)

early_stop = EarlyStopping(
    monitor="val_loss",
    patience=5,
    restore_best_weights=True,
    verbose=1
)

# ---------------- RETRAIN ----------------
print("🚀 Retraining on augmented dataset...")
history = model.fit(
    train_generator,
    validation_data=val_generator,
    epochs=EPOCHS,
    class_weight=class_weights,
    callbacks=[lr_scheduler, early_stop]
)

# ---------------- EVALUATION ----------------
print("\n🔍 Evaluating Retrained Model...")
val_loss, val_acc = model.evaluate(X_val, y_val)
print("Validation Accuracy:", val_acc)

y_pred = np.argmax(model.predict(X_val), axis=1)

print("\n📊 Classification Report:")
print(classification_report(y_val, y_pred, target_names=CLASSES))

# ---------------- CONFUSION MATRIX ----------------
cm = confusion_matrix(y_val, y_pred)

plt.figure(figsize=(8,6))
sns.heatmap(cm, annot=True, fmt='d',
            xticklabels=CLASSES,
            yticklabels=CLASSES,
            cmap="Blues")

plt.xlabel("Predicted")
plt.ylabel("Actual")
plt.title("Confusion Matrix - Retrained (Augmented)")
plt.show()

# ---------------- SAVE UPDATED MODEL ----------------
model.save(NEW_MODEL_PATH)
print(f"✅ Retrained model saved as: {NEW_MODEL_PATH}")
