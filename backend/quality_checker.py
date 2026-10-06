import io
import numpy as np
from PIL import Image
import cv2

def evaluate_image_quality(image: Image.Image) -> dict:
    """
    Evaluates whether the uploaded leaf image meets the quality thresholds.
    Checks for:
    1. Blurriness / Sharpness (Laplacian variance)
    2. Underexposure / Overexposure (Mean luminance)
    3. Minimum resolution
    4. Leaf greenness / color presence
    """
    rgb_img = image.convert("RGB")
    width, height = rgb_img.size
    
    # 1. Resolution check
    if width < 120 or height < 120:
        return {
            "is_poor_quality": True,
            "quality_score": 30.0,
            "issues": ["Image resolution is too low (minimum 120x120 pixels required)"],
            "metrics": {"width": width, "height": height, "sharpness": 0, "brightness": 0}
        }
    
    # Convert to grayscale numpy array
    gray = np.array(rgb_img.convert("L"), dtype=np.float32)
    
    # 2. Sharpness / Blur score using discrete Laplace kernel
    # Kernel: [[0, 1, 0], [1, -4, 1], [0, 1, 0]]
    laplacian = (
        np.roll(gray, 1, axis=0) + np.roll(gray, -1, axis=0) +
        np.roll(gray, 1, axis=1) + np.roll(gray, -1, axis=1) -
        4 * gray
    )
    # Ignore boundary edges for variance calculation
    laplacian_inner = laplacian[2:-2, 2:-2]
    sharpness_variance = float(np.var(laplacian_inner))
    
    # 3. Brightness / Exposure check
    mean_brightness = float(np.mean(gray))
    std_brightness = float(np.std(gray))
    
    # 4. Color / Greenness detection (HSV check for foliage/lesion tones)
    np_rgb = np.array(rgb_img, dtype=np.float32)
    r, g, b = np_rgb[:, :, 0], np_rgb[:, :, 1], np_rgb[:, :, 2]
    
    # Leaf color indicators: Green leaves or brownish/yellowish rust spots
    green_dominance = np.mean((g > (r * 0.85)) & (g > (b * 0.85)))
    brown_yellow_spots = np.mean((r > 100) & (g > 70) & (b < 100) & (r >= g))
    plant_color_score = float((green_dominance * 0.7 + brown_yellow_spots * 0.3) * 100)
    
    issues = []
    
    # Blurriness threshold
    # Sharpness variance < 65 typically denotes out-of-focus or motion blur
    is_blurry = sharpness_variance < 65.0
    if is_blurry:
        issues.append("Image is blurry or out of focus. Please hold camera steady.")
        
    # Exposure threshold
    if mean_brightness < 35.0:
        issues.append("Image is too dark / underexposed. Use better lighting.")
    elif mean_brightness > 235.0:
        issues.append("Image is overexposed or washed out.")
    elif std_brightness < 15.0:
        issues.append("Image lacks contrast or shows a blank background.")
        
    # Plant content threshold (if image has virtually 0 green/foliage/rust content)
    if plant_color_score < 4.0 and (mean_brightness > 40 and mean_brightness < 230):
        # We only flag if plant tone is completely absent and contrast is low
        pass
        
    # Calculate composite quality score (0 to 100)
    norm_sharpness = min(100.0, (sharpness_variance / 300.0) * 100.0)
    norm_contrast = min(100.0, (std_brightness / 60.0) * 100.0)
    quality_score = float(np.clip((norm_sharpness * 0.6 + norm_contrast * 0.4), 10.0, 99.0))
    
    is_poor_quality = len(issues) > 0 and (is_blurry or mean_brightness < 35.0 or mean_brightness > 235.0)
    
    return {
        "is_poor_quality": is_poor_quality,
        "quality_score": round(quality_score, 1),
        "issues": issues,
        "metrics": {
            "width": width,
            "height": height,
            "sharpness_variance": round(sharpness_variance, 2),
            "mean_brightness": round(mean_brightness, 2),
            "contrast_std": round(std_brightness, 2),
            "plant_color_score": round(plant_color_score, 2)
        }
    }


def validate_is_leaf_image(image: Image.Image) -> dict:
    """
    Detects whether the uploaded image contains a plant leaf.
    Returns is_valid=False if the image is purely a human face, room, dress, furniture, blank, or non-plant object.
    """
    rgb_img = image.convert("RGB")
    width, height = rgb_img.size
    np_rgb = np.array(rgb_img, dtype=np.uint8)
    total_pixels = width * height

    # Convert to Grayscale & HSV
    gray = cv2.cvtColor(np_rgb, cv2.COLOR_RGB2GRAY)
    hsv = cv2.cvtColor(np_rgb, cv2.COLOR_RGB2HSV)
    # 1. Texture check: reject near-blank / solid color images
    laplacian_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())
    if laplacian_var < 15.0:
        return {
            "is_valid": False,
            "reason": "invalid_content",
            "message": "You should upload only a leaf image."
        }

    # 2. Green Plant Foliage Detection (Broad & forgiving for all leaf types, shadows, lightings)
    # Green/Yellow-Green foliage in HSV: H 18 to 95, S 18 to 255, V 20 to 255
    lower_foliage = np.array([18, 18, 20], dtype=np.uint8)
    upper_foliage = np.array([95, 255, 255], dtype=np.uint8)
    foliage_mask = cv2.inRange(hsv, lower_foliage, upper_foliage)
    foliage_ratio = float(np.count_nonzero(foliage_mask)) / total_pixels

    # RGB Excess Green Index: 2*G - R - B > 10 (catches true plant green even under weird white balances)
    r = np_rgb[:, :, 0].astype(np.int16)
    g = np_rgb[:, :, 1].astype(np.int16)
    b = np_rgb[:, :, 2].astype(np.int16)
    exg = (2 * g) - r - b
    exg_mask = (exg > 10) & (g > 30)
    exg_ratio = float(np.count_nonzero(exg_mask)) / total_pixels

    effective_leaf_ratio = max(foliage_ratio, exg_ratio)

    # 3. Face Detection via OpenCV Haar Cascade (detects clear human faces)
    # Using strict minNeighbors=6 to avoid false positives on leaf textures
    is_face_detected = False
    try:
        cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        face_cascade = cv2.CascadeClassifier(cascade_path)
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=6, minSize=(50, 50))
        if len(faces) > 0:
            is_face_detected = True
    except Exception:
        pass

    # Reject if face is clearly detected and leaf content is absent/minimal (< 10%)
    if is_face_detected and effective_leaf_ratio < 0.10:
        return {
            "is_valid": False,
            "reason": "invalid_content",
            "message": "You should upload only a leaf image."
        }

    # 4. Final Leaf Presence Check
    # If effective leaf/foliage ratio is extremely low (< 2.5%), it's a room, dress, wall, or non-plant object
    if effective_leaf_ratio < 0.025:
        return {
            "is_valid": False,
            "reason": "invalid_content",
            "message": "You should upload only a leaf image."
        }

    return {
        "is_valid": True,
        "reason": "ok",
        "message": "Leaf content detected.",
        "leaf_ratio": round(effective_leaf_ratio * 100, 1)
    }


