from main import app
from utils.postman_generator import generate_postman_collection
import os

if __name__ == "__main__":
    postman_path = os.path.join(os.getcwd(), "postman.json")
    generate_postman_collection(app, postman_path)
    print(f"Postman collection generated at {postman_path}")
