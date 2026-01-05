import os
import cv2
import numpy as np
from sklearn.model_selection import train_test_split
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense

# --- CONFIGURATION (Desktop Paths) ---
DATASET_PATH = "dataset" 
MODEL_SAVE_DIR = os.path.join("backend", "models")
IMG_SIZE = 128

# Create folders if they are missing
if not os.path.exists(MODEL_SAVE_DIR):
    os.makedirs(MODEL_SAVE_DIR)

# Get classes from folder names
classes = sorted(os.listdir(DATASET_PATH))
print(f"Classes identified: {classes}")

# --- YOUR PREPROCESSING ALGORITHM ---
def preprocess_image(img_path):
    img = cv2.imread(img_path, cv2.IMREAD_GRAYSCALE)
    if img is None: return None
    img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
    img = img / 255.0
    return img

data = []
labels = []

for label, class_name in enumerate(classes):
    class_path = os.path.join(DATASET_PATH, class_name)
    print(f"Processing class: {class_name}")
    for file in os.listdir(class_path):
        img_path = os.path.join(class_path, file)
        img = preprocess_image(img_path)
        if img is not None:
            data.append(img)
            labels.append(label)

# Convert to Numpy Arrays (Your logic)
data = np.array(data).reshape(-1, IMG_SIZE, IMG_SIZE, 1)
labels = np.array(labels)

X_train, X_test, y_train, y_test = train_test_split(
    data, labels, test_size=0.2, random_state=42
)

# --- YOUR CNN ARCHITECTURE ---
model = Sequential()
model.add(Conv2D(32, (3,3), activation='relu', input_shape=(128,128,1)))
model.add(MaxPooling2D(2,2))
model.add(Conv2D(64, (3,3), activation='relu'))
model.add(MaxPooling2D(2,2))
model.add(Flatten())
model.add(Dense(128, activation='relu'))
model.add(Dense(len(classes), activation='softmax')) # Flexible based on your folder count

model.compile(
    optimizer='adam',
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']
)

# --- TRAINING ---
model.fit(X_train, y_train, epochs=3, batch_size=32, validation_split=0.1)

# --- SAVE FOR BACKEND ---
# We save as .h5 to avoid the "Signature" error you had earlier
model.save(os.path.join(MODEL_SAVE_DIR, "final_blood_model.h5"), save_format='h5')

with open(os.path.join(MODEL_SAVE_DIR, "classes.txt"), "w") as f:
    for name in classes:
        f.write(f"{name}\n")

print("✅ Step 1 Complete: Model and Classes saved in backend/models/")