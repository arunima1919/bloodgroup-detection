# ------------------------------
# Kaggle Notebook: Train & Save Model (Improved Version)
# ------------------------------

import tensorflow as tf
import numpy as np
import os
import cv2
from sklearn.model_selection import train_test_split
from collections import Counter

# ------------------------------
# CONFIG
# ------------------------------
BATCH_SIZE = 32
IMG_SIZE = (64, 64)
dataset_path = "/kaggle/input/fingerprint1/dataset"

OUTPUT_DIR = "/kaggle/working/"
MODEL_FILE = os.path.join(OUTPUT_DIR, "best_original1_cnn.keras")
CLASS_FILE = os.path.join(OUTPUT_DIR, "classes.txt")

# ------------------------------
# LOAD DATASET (GRAYSCALE)
# ------------------------------
raw_dataset = tf.keras.utils.image_dataset_from_directory(
    dataset_path,
    label_mode='int',
    image_size=IMG_SIZE,
    batch_size=None,
    shuffle=True
   
)

class_names = raw_dataset.class_names

imgs, labels = [], []

for img, lbl in raw_dataset:
    img_np = img.numpy().astype(np.uint8)
    img_gray = cv2.cvtColor(img_np, cv2.COLOR_RGB2GRAY)
    imgs.append(img_gray)
    labels.append(lbl.numpy())

imgs = np.array(imgs)
labels = np.array(labels)

# Add grayscale channel
imgs = imgs[..., np.newaxis]  # (N, 64, 64, 1)

print("Total Dataset Shape:", imgs.shape)

# ------------------------------
# STRATIFIED SPLIT
# ------------------------------

# 10% test
X_trainval, X_test, y_trainval, y_test = train_test_split(
    imgs,
    labels,
    test_size=0.10,
    stratify=labels,
    random_state=42
)

# 20% validation (from remaining 90%)
X_train, X_val, y_train, y_val = train_test_split(
    X_trainval,
    y_trainval,
    test_size=0.2222,
    stratify=y_trainval,
    random_state=42
)

print("Train:", X_train.shape)
print("Val:", X_val.shape)
print("Test:", X_test.shape)

# ------------------------------
# BALANCE ONLY TRAINING SET
# ------------------------------

train_counts = Counter(y_train)
max_count = max(train_counts.values())

balanced_indices = []

for cls_id, cls_count in train_counts.items():
    indices = np.where(y_train == cls_id)[0]
    reps = max_count // cls_count + (max_count % cls_count > 0)
    balanced_indices.extend(np.tile(indices, reps)[:max_count].tolist())

balanced_indices = np.random.permutation(balanced_indices)

X_train_bal = X_train[balanced_indices]
y_train_bal = y_train[balanced_indices]

print("Balanced Train Shape:", X_train_bal.shape)

# ------------------------------
# CREATE TF DATASETS
# ------------------------------

def create_ds(images, labels, shuffle=False, repeat=False):
    ds = tf.data.Dataset.from_tensor_slices((images, labels))
    if shuffle:
        ds = ds.shuffle(len(images), seed=42)
    ds = ds.map(lambda x, y: (tf.cast(x, tf.float32)/255.0, y))
    ds = ds.batch(BATCH_SIZE, drop_remainder=True)
    if repeat:
        ds = ds.repeat()
    return ds

train_dataset = create_ds(X_train_bal, y_train_bal, shuffle=True, repeat=True)
val_dataset   = create_ds(X_val, y_val)
test_dataset  = create_ds(X_test, y_test)

steps_per_epoch = len(X_train_bal) // BATCH_SIZE
validation_steps = len(X_val) // BATCH_SIZE

# ------------------------------
# DEFINE CNN MODEL
# ------------------------------

def original_cnn_model_fixed():
    inputs = tf.keras.Input(shape=(*IMG_SIZE, 1), name="input_layer")
    
    x = tf.keras.layers.Conv2D(32, (3,3), activation='relu', padding='same')(inputs)
    x = tf.keras.layers.MaxPooling2D(2,2)(x)
    x = tf.keras.layers.Dropout(0.1)(x)
    
    x = tf.keras.layers.Conv2D(64, (3,3), activation='relu', padding='same')(x)
    x = tf.keras.layers.MaxPooling2D(2,2)(x)
    x = tf.keras.layers.Dropout(0.2)(x)
    
    x = tf.keras.layers.Conv2D(128, (3,3), activation='relu', padding='same')(x)
    x = tf.keras.layers.MaxPooling2D(2,2)(x)
    x = tf.keras.layers.Dropout(0.3)(x)
    
    x = tf.keras.layers.Conv2D(256, (3,3), activation='relu', padding='same')(x)
    x = tf.keras.layers.MaxPooling2D(2,2)(x)
    x = tf.keras.layers.Dropout(0.4)(x)
    
    x = tf.keras.layers.Flatten()(x)
    x = tf.keras.layers.Dense(512, activation='relu')(x)
    x = tf.keras.layers.Dropout(0.4)(x)
    
    outputs = tf.keras.layers.Dense(len(class_names), activation='softmax')(x)
    
    model = tf.keras.Model(inputs=inputs, outputs=outputs, name="original_cnn_fixed")
    
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-4),
        loss='sparse_categorical_crossentropy',
        metrics=['accuracy']
    )
    
    return model

model = original_cnn_model_fixed()
model.summary()

# ------------------------------
# TRAIN MODEL
# ------------------------------

callbacks = [
    tf.keras.callbacks.EarlyStopping(
        monitor='val_loss',
        patience=10,
        restore_best_weights=True,
        verbose=1
    ),
    tf.keras.callbacks.ModelCheckpoint(
        MODEL_FILE,
        save_best_only=True,
        monitor='val_loss',
        verbose=1
    )
]

history = model.fit(
    train_dataset,
    epochs=100,
    steps_per_epoch=steps_per_epoch,
    validation_data=val_dataset,
    validation_steps=validation_steps,
    callbacks=callbacks
)

# ------------------------------
# SAVE MODEL & CLASS NAMES
# ------------------------------

model.save(MODEL_FILE)

with open(CLASS_FILE, "w") as f:
    f.write("\n".join(class_names))

print(f"Model saved to: {MODEL_FILE}")
print(f"Classes saved to: {CLASS_FILE}")