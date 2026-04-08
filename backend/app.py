import json
import os
from datetime import date
from typing import List, Dict, Any

from flask import Flask, jsonify, request
from flask_cors import CORS

from models import StandupUpdate

app = Flask(__name__)
CORS(app)

DATA_FILE = os.path.join(os.path.dirname(__file__), "data.json")


def ensure_data_file() -> None:
    if not os.path.exists(DATA_FILE):
        with open(DATA_FILE, "w", encoding="utf-8") as file:
            json.dump([], file, indent=2)


def read_updates() -> List[Dict[str, Any]]:
    ensure_data_file()
    with open(DATA_FILE, "r", encoding="utf-8") as file:
        try:
            data = json.load(file)
            return data if isinstance(data, list) else []
        except json.JSONDecodeError:
            return []


def write_updates(updates: List[Dict[str, Any]]) -> None:
    with open(DATA_FILE, "w", encoding="utf-8") as file:
        json.dump(updates, file, indent=2)


@app.route("/api/update", methods=["POST"])
def post_update():
    payload = request.get_json(silent=True) or {}
    required_fields = ["name", "did", "willdo", "date"]
    if any(not str(payload.get(field, "")).strip() for field in required_fields):
        return jsonify({"success": False, "error": "Missing required fields"}), 400

    entry = StandupUpdate.from_payload(payload).to_dict()
    updates = read_updates()
    updates.append(entry)
    write_updates(updates)
    return jsonify({"success": True})


@app.route("/api/updates", methods=["GET"])
def get_updates():
    selected_date = request.args.get("date") or date.today().isoformat()
    updates = [item for item in read_updates() if item.get("date") == selected_date]
    updates.sort(key=lambda item: item.get("submitted_at", ""), reverse=True)
    return jsonify(updates)


@app.route("/api/dates", methods=["GET"])
def get_dates():
    updates = read_updates()
    unique_dates = sorted({item.get("date") for item in updates if item.get("date")}, reverse=True)
    return jsonify(unique_dates)


@app.route("/api/updates/all", methods=["GET"])
def get_all_updates():
    updates = read_updates()
    updates.sort(
        key=lambda item: (item.get("date", ""), item.get("submitted_at", "")),
        reverse=True,
    )
    return jsonify(updates)


if __name__ == "__main__":
    ensure_data_file()
    app.run(port=5000, debug=True)
