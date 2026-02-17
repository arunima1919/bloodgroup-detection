import tensorflow as tf

# Load your trained high-accuracy model
model = tf.keras.models.load_model("backend/models/blood_model.h5")

# Convert to TensorFlow Lite
converter = tf.lite.TFLiteConverter.from_keras_model(model)
converter.optimizations = [tf.lite.Optimize.DEFAULT]

tflite_model = converter.convert()

# Save TFLite model
with open("backend/models/final_blood_model.tflite", "wb") as f:
    f.write(tflite_model)

print("✅ Step Two complete: TFLite model created")
