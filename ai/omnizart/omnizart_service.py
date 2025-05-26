from flask import Flask, request, jsonify, Blueprint
import subprocess
import os

omnizart_api = Blueprint('omnizart', __name__, url_prefix='/omnizart')

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STORAGE_PATH = os.path.join(BASE_DIR, "..", "storage")
os.makedirs(STORAGE_PATH, exist_ok=True)

app = Flask(__name__)

@omnizart_api.route('/drum', methods=['POST'])
def transcribe_drum():
    data = request.get_json()
    if not data or 'filename' not in data:
        return jsonify({"error": "Missing filename in request"}), 400

    filename = data['filename']
    input_path = os.path.join(STORAGE_PATH, filename)
    output_filename = os.path.splitext(filename)[0] + ".mid"
    output_path = os.path.join(STORAGE_PATH, output_filename)

    if not os.path.exists(input_path):
        return jsonify({"error": "Input file does not exist"}), 404

    try:
        subprocess.run(
            ["omnizart", "drum", "transcribe", "-o", output_path, input_path],
            check=True,
            capture_output=True,
            text=True
        )
        return jsonify({
            "message": "Transcription successful",
            "output_file": output_filename
        }), 200

    except subprocess.CalledProcessError as e:
        return jsonify({
            "error": f"Transcription failed: {e.stderr}"
        }), 500
    
@omnizart_api.route('/music', methods=['POST'])
def transcribe_music():
    data = request.get_json()
    if not data or 'filename' not in data:
        return jsonify({"error": "Missing filename in request"}), 400

    filename = data['filename']
    input_path = os.path.join(STORAGE_PATH, filename)
    output_filename = os.path.splitext(filename)[0] + ".mid"
    output_path = os.path.join(STORAGE_PATH, output_filename)

    if not os.path.exists(input_path):
        return jsonify({"error": "Input file does not exist"}), 404

    try:
        subprocess.run(
            ["omnizart", "music", "transcribe", "-o", output_path, input_path],
            check=True,
            capture_output=True,
            text=True
        )
        return jsonify({
            "message": "Transcription successful",
            "output_file": output_filename
        }), 200

    except subprocess.CalledProcessError as e:
        return jsonify({
            "error": f"Transcription failed: {e.stderr}"
        }), 500

app.register_blueprint(omnizart_api)