import tensorflow as tf

model = tf.keras.models.load_model("crop_classifier.h5")

# Re-save in new Keras format (NO batch_shape issue)
model.save("crop_classifier_fixed.keras")
