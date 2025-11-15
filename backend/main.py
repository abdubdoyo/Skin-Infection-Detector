from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
import os
import tempfile
import uuid
import threading

from AiAnalyzer import get_skin_disease_recommendations
from prediction import predict_image

app = Flask(__name__)
CORS(app, resources={
    r"/upload": {"origins": "*"},
    r"/recommend": {"origins": "*"}
})

CORS(app, supports_credentials=False, resources={r"/*": {"origins": "*"}})

task_results = {}
UPLOAD_FOLDER = './uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.route('/')
def home():
    return jsonify({
        'message': 'Test : Skin Disease Recommendation API',
        'usage': 'POST to /recommend with {"skin_disease": "condition_name"}'
    })

@app.route('/recommend', methods=['POST'])
def recommend():
    """
    Main endpoint - just send skin disease name and get recommendations
    """
    try:
        data = request.get_json()
        if not data or 'skin_disease' not in data or 'allergies' not in data:
            return jsonify({'error': 'Please provide skin_disease and allergies in request body'}), 400

        skin_disease = data['skin_disease']
        allergies = data['allergies']



        if not isinstance(skin_disease, str) or not skin_disease.strip():
            return jsonify({'error': 'skin_disease cannot be empty'}), 400

        # If allergies is a string, strip it; if it's a list, keep as is
        if isinstance(allergies, str):
            allergies = allergies.strip()
            if not allergies:
                return jsonify({'error': 'allergies cannot be empty'}), 400
        elif isinstance(allergies, list):
            if not allergies:
                return jsonify({'error': 'allergies cannot be empty'}), 400
        else:
            return jsonify({'error': 'allergies must be a string or list'}), 400

        logger.info(f"Getting recommendations for: {skin_disease}")
        recommendations = get_skin_disease_recommendations(skin_disease, allergies)
        return jsonify(recommendations)
    except Exception as e:
        logger.error(f"Error in recommend endpoint: {e}")
        return jsonify({'error': 'Internal server error'}), 500

def process_image_in_background(task_id, temp_path):
    """Function to run the AI model in a separate thread."""
    logger = logging.getLogger(__name__)
    logger.info(f"Task {task_id}: Starting prediction in background...")
    try:
        prediction = predict_image(temp_path)
        logger.info(f"Task {task_id}: Prediction result: {prediction}")  # ✅ Log the actual prediction
        task_results[task_id] = { 'status': 'completed',
    'prediction': prediction.get("predicted_class", "unknown"),  # ✅ direct diagnosis string
    'confidence': prediction.get("confidence", 0.0),
    'full_output': prediction  # optional: keep full dict if needed later
    }

        logger.info(f"Task {task_id}: Prediction complete.")
    except Exception as e:
        task_results[task_id] = {'status': 'failed', 'error': str(e)}
        logger.error(f"Task {task_id}: Prediction failed: {e}")
    finally:
        # Clean up temporary file
        try:
            os.unlink(temp_path)
        except Exception as cleanup_error:
            logger.warning(f"Task {task_id}: Could not clean up temp file: {cleanup_error}")
@app.route('/upload', methods=['POST'])
def upload_image():
    logger = logging.getLogger(__name__)
    if 'image' not in request.files:
        return jsonify({'error': 'Missing "image" field'}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    # Save to a temporary file
    with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as temp_file:
        temp_path = temp_file.name
        file.save(temp_path)

    # Generate a unique ID for this task
    task_id = str(uuid.uuid4())
    task_results[task_id] = {'status': 'processing'}
    
    # Start the prediction in a background thread
    thread = threading.Thread(target=process_image_in_background, args=(task_id, temp_path))
    thread.start()
    
    # Immediately return the task ID to the client
    return jsonify({
        'success': True,
        'message': 'Image upload accepted, processing in background.',
        'task_id': task_id,
        'status_url': f'/result/{task_id}' # Tell client where to check
    }), 202 # Use 202 Accepted status code

@app.route('/result/<task_id>', methods=['GET'])
def get_result(task_id):
    result = task_results.get(task_id, {'status': 'not_found'})
    return jsonify(result)

# Add this helper function
def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in {'png', 'jpg', 'jpeg'}

@app.route('/health')
def health():
    """Simple health check"""
    return jsonify({'status': 'API is running'})

if __name__ == '__main__':
    print("Starting Simple Skin Disease Recommendation API...")
    print("Make sure to set GEMINI_API_KEY environment variable")
    print("Usage: POST to /recommend with {'skin_disease': 'acne'}")
    app.run(debug=True, host='0.0.0.0', port=8000)

if __name__ != '__main__':
    app.logger.handlers = []
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[logging.StreamHandler()]
    )