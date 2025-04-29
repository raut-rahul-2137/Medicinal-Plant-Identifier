import tensorflow as tf
import numpy as np
from PIL import Image
import io
import requests
import tempfile
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

# Model URL - Replace this with your actual model URL after uploading
MODEL_URL = "YOUR_MODEL_URL_HERE"

# Load the model
try:
    # Download model to temporary file
    response = requests.get(MODEL_URL)
    with tempfile.NamedTemporaryFile(delete=False, suffix='.h5') as tmp_file:
        tmp_file.write(response.content)
        tmp_file.flush()
        # Load model from temporary file
        model = tf.keras.models.load_model(tmp_file.name)
    # Clean up temporary file
    os.unlink(tmp_file.name)
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

def home(request):
    return render(request, 'index.html')

@csrf_exempt
def predict(request):
    if model is None:
        return JsonResponse({
            'success': False,
            'error': 'Model not loaded properly'
        })
        
    try:
        # Get the image file from the request
        file = request.FILES['file']
        image = Image.open(io.BytesIO(file.read()))
        
        # Preprocess the image
        processed_image = preprocess_image(image)
        
        # Make prediction
        predictions = model.predict(processed_image)
        predicted_class = class_names[np.argmax(predictions[0])]
        confidence = float(np.max(predictions[0]))
        
        return JsonResponse({
            'success': True,
            'prediction': predicted_class,
            'confidence': confidence
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }) 