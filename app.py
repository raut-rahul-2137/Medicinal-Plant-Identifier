from flask import Flask, request, render_template, jsonify
import tensorflow as tf
import numpy as np
from PIL import Image
import io
import os

app = Flask(__name__)

# Load the model
try:
    model = tf.keras.models.load_model('medicinal_plant_classifier.h5')
except Exception as e:
    print(f"Error loading model: {str(e)}")
    model = None

# Define class names (you should replace these with your actual class names)
class_names = ['Class1', 'Class2', 'Class3']  # Replace with your actual class names

def preprocess_image(image):
    # Resize image to match model's expected sizing
    img = image.resize((224, 224))  # Adjust size according to your model's requirements
    # Convert to array and preprocess
    img_array = tf.keras.preprocessing.image.img_to_array(img)
    img_array = tf.expand_dims(img_array, 0)
    return img_array

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({
            'success': False,
            'error': 'Model not loaded properly'
        })
        
    try:
        # Get the image file from the request
        file = request.files['file']
        image = Image.open(io.BytesIO(file.read()))
        
        # Preprocess the image
        processed_image = preprocess_image(image)
        
        # Make prediction
        predictions = model.predict(processed_image)
        predicted_class = class_names[np.argmax(predictions[0])]
        confidence = float(np.max(predictions[0]))
        
        return jsonify({
            'success': True,
            'prediction': predicted_class,
            'confidence': confidence
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        })

# This is important for Vercel
app = app

if __name__ == '__main__':
    app.run(debug=True) 