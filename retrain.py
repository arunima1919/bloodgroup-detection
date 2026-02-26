import tensorflow as tf
import numpy as np
import os
import cv2

# --- CONFIG ---
IMG_SIZE = (64, 64)
BATCH_SIZE = 32
# Path to the folder containing BOTH old and new individual subfolders
COMBINED_DATASET_PATH = "/kaggle/input/datasets/arunimaaaaa/ds-combined/dataset_combined" 
OLD_MODEL_FILE = "/kaggle/input/models/arunimaaaaa/original-model/keras/default/1/best_original1_cnn.keras"
NEW_MODEL_FILE = "/kaggle/working/retrained_fingerprint_v2.keras"
CLASS_FILE = "/kaggle/working/classes.txt"

# 1. LOAD DATASET (Combined Old + New)
raw_ds = tf.keras.utils.image_dataset_from_directory(
    COMBINED_DATASET_PATH,
    label_mode='int',
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    shuffle=True
)

new_class_names = raw_ds.class_names
num_classes = len(new_class_names)

# Preprocessing: Grayscale + Normalization
def preprocess(img, lbl):
    img = tf.image.rgb_to_grayscale(img)
    img = tf.cast(img, tf.float32) / 255.0
    return img, lbl

train_ds = raw_ds.map(preprocess).prefetch(tf.data.AUTOTUNE)

# 2. LOAD PRE-TRAINED MODEL
print("Loading existing model...")
base_model = tf.keras.models.load_model(OLD_MODEL_FILE)

# 3. MODIFY FOR NEW CLASSES (If number of people changed)
if base_model.layers[-1].units != num_classes:
    print(f"Updating output layer from {base_model.layers[-1].units} to {num_classes} classes.")
    # Extract the layer before the final dense layer
    x = base_model.layers[-2].output 
    new_outputs = tf.keras.layers.Dense(num_classes, activation='softmax', name="predictions")(x)
    model = tf.keras.Model(inputs=base_model.input, outputs=new_outputs)
else:
    model = base_model

# 4. FREEZE CONVOLUTIONAL LAYERS
# We freeze the first 12 layers (the Conv/Pool blocks) so only the Dense layers learn
for layer in model.layers[:-4]:
    layer.trainable = False

# 5. RE-COMPILE WITH LOWER LEARNING RATE
model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=1e-5), # Very slow learning
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']
)

# 6. FINE-TUNE
print("Starting Fine-Tuning...")
model.fit(
    train_ds,
    epochs=20, # Usually 10-20 epochs is enough for fine-tuning
)

# 7. SAVE UPDATED MODEL & CLASSES
model.save(NEW_MODEL_FILE)
with open(CLASS_FILE, "w") as f:
    f.write("\n".join(new_class_names))

print(f"Retraining complete. New model saved as {NEW_MODEL_FILE}")