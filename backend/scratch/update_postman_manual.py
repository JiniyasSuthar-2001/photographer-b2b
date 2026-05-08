import sys
import os

# Add the backend directory to sys.path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(backend_dir)

from main import app
from utils.postman_generator import generate_postman_collection

# Output path in the root directory
output_path = os.path.join(os.path.dirname(backend_dir), "postman.json")

generate_postman_collection(app, output_path)
print(f"Manually updated postman.json at {output_path}")
