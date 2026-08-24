import os
import requests
import json

def load_dotenv():
    env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))
    if os.path.exists(env_path):
        with open(env_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, val = line.split('=', 1)
                    key = key.strip()
                    val = val.strip().strip('"').strip("'")
                    os.environ[key] = val

load_dotenv()
api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
test_url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"
r = requests.get(test_url)
models_data = r.json()
names = [m['name'] for m in models_data.get('models', [])]
print(json.dumps(names, indent=2))
