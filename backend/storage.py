import json
import os
import csv
from utils import OUTPUT_DIR

def ensure_output_dir(path: str = OUTPUT_DIR):
    """Create output directory if it doesn't exist."""
    os.makedirs(path, exist_ok=True)

def save_json(data: dict, filename: str = "report.json") -> str:
    """Save a dict as a formatted JSON file. Returns the file path."""
    ensure_output_dir()
    path = os.path.join(OUTPUT_DIR, filename)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, default=str)
    print(f"[storage] JSON saved → {path}")
    return path

def load_json(filename: str = "report.json") -> dict:
    """Load a JSON file from the output directory."""
    path = os.path.join(OUTPUT_DIR, filename)
    if not os.path.exists(path):
        raise FileNotFoundError(f"No file found at {path}")
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def save_csv(rows: list, headers: list, filename: str = "repos.csv") -> str:
    """Save a list of dicts as a CSV file. Returns the file path."""
    ensure_output_dir()
    path = os.path.join(OUTPUT_DIR, filename)
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=headers, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)
    print(f"[storage] CSV saved → {path}")
    return path