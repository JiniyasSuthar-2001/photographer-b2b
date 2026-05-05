import json
import os
from fastapi.openapi.utils import get_openapi

def generate_postman_collection(app, output_path: str = "../postman.json"):
    """
    Generates a Postman Collection (v2.1.0) from a FastAPI application's OpenAPI schema.
    """
    openapi_schema = app.openapi()
    
    # Postman Collection Base Structure
    postman_collection = {
        "info": {
            "name": openapi_schema.get("info", {}).get("title", "FastAPI Collection"),
            "description": openapi_schema.get("info", {}).get("description", ""),
            "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
        },
        "item": [],
        "variable": [
            {
                "key": "baseUrl",
                "value": "http://localhost:8000",
                "type": "string"
            }
        ]
    }

    # Group endpoints by tags if available, otherwise just flat
    paths = openapi_schema.get("paths", {})
    
    for path, methods in paths.items():
        for method, details in methods.items():
            if method.lower() not in ["get", "post", "put", "delete", "patch", "options", "head"]:
                continue

            # Basic request structure
            request = {
                "name": details.get("summary", path),
                "request": {
                    "method": method.upper(),
                    "header": [],
                    "url": {
                        "raw": "{{baseUrl}}" + path,
                        "host": ["{{baseUrl}}"],
                        "path": [p for p in path.split("/") if p]
                    }
                },
                "response": []
            }

            # Add description if available
            if details.get("description"):
                request["request"]["description"] = details["description"]

            # Add tags as folders if they exist
            tags = details.get("tags", [])
            if tags:
                tag_name = tags[0]
                # Find or create folder
                folder = next((item for item in postman_collection["item"] if item.get("name") == tag_name), None)
                if not folder:
                    folder = {"name": tag_name, "item": []}
                    postman_collection["item"].append(folder)
                folder["item"].append(request)
            else:
                postman_collection["item"].append(request)

    # Resolve output path relative to the script location if needed
    # But usually it's better to pass an absolute path
    try:
        with open(output_path, "w") as f:
            json.dump(postman_collection, f, indent=4)
        print(f"Successfully generated Postman collection at {output_path}")
    except Exception as e:
        print(f"Error generating Postman collection: {e}")

if __name__ == "__main__":
    # Example usage if run directly (though intended to be called from main.py)
    pass
