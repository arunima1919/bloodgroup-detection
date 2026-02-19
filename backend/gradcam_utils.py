import numpy as np
import tensorflow as tf
import cv2
from tf_keras_vis.gradcam import Gradcam
from tf_keras_vis.utils.scores import CategoricalScore
from tf_keras_vis.utils.model_modifiers import ReplaceToLinear

IMG_SIZE = 128


def find_last_conv_layer(model):
    for layer in reversed(model.layers):
        if isinstance(layer, tf.keras.layers.Conv2D):
            return layer.name
    raise ValueError("No Conv2D layer found in model.")


def generate_gradcam(model, image_path, save_path):
    # Load image
    img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    if img is None:
        raise ValueError("Image not readable for GradCAM")

    img_resized = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
    img_normalized = img_resized.astype("float32") / 255.0
    img_input = np.expand_dims(img_normalized, axis=(0, -1))

    # Predict class
    preds = model.predict(img_input)
    class_index = np.argmax(preds[0])

    # 🔥 Get last conv layer name
    last_conv_layer = find_last_conv_layer(model)

    gradcam = Gradcam(
        model,
        model_modifier=ReplaceToLinear(),
        clone=True
    )

    cam = gradcam(
        CategoricalScore(class_index),
        img_input,
        penultimate_layer=last_conv_layer
    )

    heatmap = cam[0]

    # Normalize safely
    heatmap = np.maximum(heatmap, 0)
    if heatmap.max() != 0:
        heatmap = heatmap / heatmap.max()

    heatmap = cv2.resize(heatmap, (IMG_SIZE, IMG_SIZE))
    heatmap = np.uint8(255 * heatmap)

    # Convert grayscale to BGR
    img_color = cv2.cvtColor(img_resized, cv2.COLOR_GRAY2BGR)

    heatmap_color = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)

    superimposed = cv2.addWeighted(img_color, 0.6, heatmap_color, 0.4, 0)

    cv2.imwrite(save_path, superimposed)

    return class_index
