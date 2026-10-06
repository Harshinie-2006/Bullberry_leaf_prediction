import os
import io
import json
import uuid
import datetime
import hashlib
from typing import Optional, List
from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Header, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from PIL import Image

from quality_checker import evaluate_image_quality, validate_is_leaf_image
from model_runner import BerryIoModelRunner
from lan_ip import get_local_ip, list_lan_ips

app = FastAPI(
    title="BerryIO AI - Plant Health & Leaf Disease Detection API",
    description="Backend service for leaf disease diagnosis, Grad-CAM attention visualizer, severity estimation, and multi-user accounts.",
    version="2.0.0"
)

# Enable CORS for web, desktop, and mobile clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Model Runner
runner = BerryIoModelRunner()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
HISTORY_FILE = os.path.join(BASE_DIR, "scan_history.json")
USERS_FILE = os.path.join(BASE_DIR, "users.json")
PASSWORD_SALT = "berryio_salt_2026"
TOKEN_SECRET = "berryio_secret_key_2026"

# ----------------- Helper Functions & Auth -----------------

def hash_password(password: str) -> str:
    return hashlib.sha256((password + PASSWORD_SALT).encode("utf-8")).hexdigest()

def make_token(username: str) -> str:
    sig = hashlib.sha256((username + TOKEN_SECRET).encode("utf-8")).hexdigest()[:16]
    return f"{username}:{sig}"

def verify_token(token: str) -> Optional[str]:
    if not token or ":" not in token:
        return None
    try:
        username, sig = token.split(":", 1)
        expected_sig = hashlib.sha256((username + TOKEN_SECRET).encode("utf-8")).hexdigest()[:16]
        if sig == expected_sig:
            return username
    except Exception:
        return None
    return None


def load_users() -> list:
    if os.path.exists(USERS_FILE):
        try:
            with open(USERS_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                return data.get("users", [])
        except Exception as e:
            print(f"[BerryIO] Failed to load users: {e}")
    return []

def save_users(users: list):
    try:
        with open(USERS_FILE, "w", encoding="utf-8") as f:
            json.dump({"users": users}, f, indent=2)
    except Exception as e:
        print(f"[BerryIO] Failed to save users: {e}")

def init_default_users():
    users = load_users()
    if not users:
        demo_users = [
            {
                "username": "john",
                "password_hash": hash_password("password123"),
                "name": "Farmer John",
                "role": "Orchard Grower",
                "avatar": "👨‍🌾",
                "created_at": datetime.datetime.now().isoformat()
            },
            {
                "username": "sarah",
                "password_hash": hash_password("password123"),
                "name": "Dr. Sarah Agri",
                "role": "Plant Pathologist",
                "avatar": "👩‍🔬",
                "created_at": datetime.datetime.now().isoformat()
            }
        ]
        save_users(demo_users)

init_default_users()

def load_history() -> list:
    if os.path.exists(HISTORY_FILE):
        try:
            with open(HISTORY_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return []
    return []

def save_history(history: list):
    try:
        with open(HISTORY_FILE, "w", encoding="utf-8") as f:
            json.dump(history, f, indent=2)
    except Exception as e:
        print(f"[BerryIO] Failed to save history: {e}")

def resolve_username(
    authorization: Optional[str] = None,
    username: Optional[str] = None
) -> str:
    """Resolves active user from Bearer Token or query/form field."""
    if authorization:
        token = authorization.replace("Bearer ", "").strip()
        parsed_user = verify_token(token)
        if parsed_user:
            return parsed_user
    if username and username.strip():
        return username.strip().lower()
    return "john"

# ----------------- Request Models -----------------

class RegisterRequest(BaseModel):
    username: str
    password: str
    name: Optional[str] = None
    role: Optional[str] = "Farmer"
    avatar: Optional[str] = "🌿"

class LoginRequest(BaseModel):
    username: str
    password: str

# ----------------- Endpoints -----------------

@app.get("/")
def root():
    local_ip = get_local_ip()
    return {
        "status": "online",
        "service": "BerryIO AI Backend",
        "version": "2.0.0",
        "local_ip": local_ip,
        "mobile_api_url": f"http://{local_ip}:8000",
        "endpoints": [
            "/api/predict",
            "/api/history",
            "/api/model-info",
            "/api/auth/login",
            "/api/auth/register",
            "/api/auth/demo-users",
            "/api/network-info"
        ]
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "app": "BerryIO AI Backend",
        "version": "2.0.0",
        "timestamp": datetime.datetime.now().isoformat()
    }

@app.get("/api/network-info")
def get_network_info():
    ips = list_lan_ips()
    local_ip = ips[0] if ips else get_local_ip()
    mobile_urls = [f"http://{ip}:8000" for ip in ips] or [f"http://{local_ip}:8000"]
    return {
        "status": "success",
        "local_ip": local_ip,
        "lan_ips": ips,
        "port": 8000,
        "mobile_url": mobile_urls[0],
        "mobile_urls": mobile_urls,
        "pc_url": "http://127.0.0.1:8000"
    }

# ----------------- Authentication Endpoints -----------------

@app.get("/api/auth/demo-users")
def get_demo_users():
    """Returns pre-configured demo users for 1-click login and testing."""
    users = load_users()
    demo_list = [
        {
            "username": u["username"],
            "name": u["name"],
            "role": u.get("role", "User"),
            "avatar": u.get("avatar", "🌿"),
            "token": make_token(u["username"])
        }
        for u in users
    ]
    return {
        "status": "success",
        "users": demo_list
    }

@app.post("/api/auth/register")
def register_user(req: RegisterRequest):
    username = req.username.strip().lower()
    if not username or len(username) < 3:
        raise HTTPException(status_code=400, detail="Username must be at least 3 characters.")
    if not req.password or len(req.password) < 4:
        raise HTTPException(status_code=400, detail="Password must be at least 4 characters.")

    users = load_users()
    for u in users:
        if u["username"].lower() == username:
            raise HTTPException(status_code=400, detail="Username already exists. Please pick another.")

    new_user = {
        "username": username,
        "password_hash": hash_password(req.password),
        "name": req.name.strip() if req.name else username.capitalize(),
        "role": req.role or "Farmer",
        "avatar": req.avatar or "🌿",
        "created_at": datetime.datetime.now().isoformat()
    }
    users.append(new_user)
    save_users(users)

    token = make_token(username)
    return {
        "status": "success",
        "message": f"User {username} registered successfully.",
        "token": token,
        "user": {
            "username": new_user["username"],
            "name": new_user["name"],
            "role": new_user["role"],
            "avatar": new_user["avatar"]
        }
    }

@app.post("/api/auth/login")
def login_user(req: LoginRequest):
    username = req.username.strip().lower()
    users = load_users()
    matched = None
    for u in users:
        if u["username"].lower() == username:
            matched = u
            break

    if not matched or matched["password_hash"] != hash_password(req.password):
        raise HTTPException(status_code=401, detail="Invalid username or password.")

    token = make_token(username)
    return {
        "status": "success",
        "message": "Login successful.",
        "token": token,
        "user": {
            "username": matched["username"],
            "name": matched["name"],
            "role": matched.get("role", "User"),
            "avatar": matched.get("avatar", "🌿")
        }
    }

@app.get("/api/auth/me")
def get_current_user_profile(
    authorization: Optional[str] = Header(None),
    username: Optional[str] = Query(None)
):
    active_user = resolve_username(authorization, username)
    users = load_users()
    for u in users:
        if u["username"].lower() == active_user.lower():
            return {
                "status": "success",
                "user": {
                    "username": u["username"],
                    "name": u["name"],
                    "role": u.get("role", "User"),
                    "avatar": u.get("avatar", "🌿")
                }
            }
    # If not found in users, return standard fallback profile
    return {
        "status": "success",
        "user": {
            "username": active_user,
            "name": active_user.capitalize(),
            "role": "Grower",
            "avatar": "🌱"
        }
    }

# ----------------- Inference & Model Endpoints -----------------

@app.get("/api/model-info")
def get_model_info():
    info = runner.get_status()
    info["app_name"] = "BerryIO AI"
    return info

@app.post("/api/model/reload")
def reload_model(custom_path: Optional[str] = Form(None)):
    status = runner.reload_model(custom_path)
    return {
        "status": "success",
        "model_status": status
    }

@app.post("/api/predict")
async def predict_leaf(
    file: UploadFile = File(...),
    force: Optional[str] = Form("false"),
    username: Optional[str] = Form(None),
    authorization: Optional[str] = Header(None)
):
    """
    Analyzes an uploaded leaf image:
    1. Validates image sharpness and quality.
    2. Checks whether the image contains plant foliage.
    3. Runs AI diagnosis pipeline (predictions, Grad-CAM, lesion mask).
    4. Records scan history tagged with the active user.
    """
    try:
        active_user = resolve_username(authorization, username)
        contents = await file.read()
        if not contents:
            raise HTTPException(status_code=400, detail="Uploaded file is empty.")
            
        try:
            image_pil = Image.open(io.BytesIO(contents)).convert("RGB")
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid image file format.")

        # 0. Validate that image is a leaf (not a human or unrelated object)
        leaf_validation = validate_is_leaf_image(image_pil)
        if not leaf_validation["is_valid"]:
            return JSONResponse(
                status_code=200,
                content={
                    "status": "invalid_image",
                    "reason": leaf_validation["reason"],
                    "message": leaf_validation["message"],
                    "alert": leaf_validation["message"]
                }
            )

        # 1. Check Image Quality
        quality_result = evaluate_image_quality(image_pil)
        is_force_override = force.lower() in ["true", "1", "yes"]
        
        if quality_result["is_poor_quality"] and not is_force_override:
            return JSONResponse(
                status_code=200,
                content={
                    "status": "poor_quality",
                    "quality_check": quality_result,
                    "message": "Image quality is insufficient for accurate disease diagnosis.",
                    "tips": [
                        "Keep the leaf fully visible and in frame",
                        "Ensure bright, natural lighting",
                        "Hold camera steady to avoid motion blur",
                        "Capture closer to leaf surface to see lesions clearly"
                    ]
                }
            )

        # 2. Run Full AI Diagnosis Pipeline
        prediction_result = runner.predict(contents)
        
        # 3. Create Scan History Entry tagged with username
        now = datetime.datetime.now()
        scan_id = str(uuid.uuid4())
        sev_level = prediction_result["severity"]["level"].lower()
        
        history_item = {
            "id": scan_id,
            "username": active_user,
            "class_name": prediction_result["prediction"]["class_name"],
            "confidence": prediction_result["prediction"]["confidence"],
            "severity_level": prediction_result["severity"]["level"],
            "affected_area_percent": prediction_result["severity"]["affected_area_percent"],
            "timestamp": now.strftime("%b %d, %Y · %I:%M %p"),
            "status_type": sev_level,
            "thumbnail": prediction_result["visualizations"]["original"],
            "recommendation_summary": prediction_result["recommendations"][0] if prediction_result["recommendations"] else ""
        }
        
        # Save to local history
        current_hist = load_history()
        current_hist.insert(0, history_item)
        # Keep latest 100 scans
        save_history(current_hist[:100])

        return {
            "status": "success",
            "quality_check": quality_result,
            "data": prediction_result,
            "scan_id": scan_id,
            "saved_for_user": active_user
        }

    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")

# ----------------- User-Isolated Scan History Endpoints -----------------

@app.get("/api/history")
def get_scan_history(
    username: Optional[str] = Query(None),
    authorization: Optional[str] = Header(None)
):
    """Returns scan history exclusively for the requested user."""
    active_user = resolve_username(authorization, username)
    all_history = load_history()
    
    # Filter scans matching this username
    user_scans = [item for item in all_history if item.get("username", "john").lower() == active_user.lower()]

    return {
        "status": "success",
        "username": active_user,
        "count": len(user_scans),
        "history": user_scans
    }

@app.delete("/api/history")
def clear_scan_history(
    username: Optional[str] = Query(None),
    authorization: Optional[str] = Header(None)
):
    """Clears scan history ONLY for the active user."""
    active_user = resolve_username(authorization, username)
    all_history = load_history()
    
    # Retain scans of all OTHER users
    remaining = [item for item in all_history if item.get("username", "john").lower() != active_user.lower()]
    save_history(remaining)

    return {
        "status": "success",
        "username": active_user,
        "message": f"Scan history for {active_user} cleared successfully."
    }

if __name__ == "__main__":
    import uvicorn
    local_ip = get_local_ip()
    extra = list_lan_ips()
    print("==================================================")
    print("  BerryIO AI Backend is starting on 0.0.0.0:8000")
    print(f"  Local PC:       http://127.0.0.1:8000")
    print(f"  Mobile App URL: http://{local_ip}:8000")
    if len(extra) > 1:
        print("  Other LAN IPs:  " + ", ".join(f"http://{ip}:8000" for ip in extra[1:]))
    print("==================================================")
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=False)
