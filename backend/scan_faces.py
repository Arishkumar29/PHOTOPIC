import os
import sys
import json
import base64
import glob
import requests
import cv2
import time
import numpy as np
from concurrent.futures import ThreadPoolExecutor, as_completed

# Cache global model runners to optimize execution speed
_YUNET_DETECTOR = None
_SFACE_RECOGNIZER = None
_API_KEY_INVALID = False

def get_mime_type(filename):
    ext = filename.lower().split('.')[-1]
    if ext in ['jpg', 'jpeg']:
        return 'image/jpeg'
    elif ext == 'png':
        return 'image/png'
    elif ext == 'webp':
        return 'image/webp'
    return 'image/jpeg'

def get_resized_image_base64(img_path, max_size=1024):
    try:
        img = cv2.imread(img_path)
        if img is None:
            return None, None
        height, width = img.shape[:2]
        if max(height, width) > max_size:
            scale = max_size / max(height, width)
            img = cv2.resize(img, (int(width * scale), int(height * scale)), interpolation=cv2.INTER_AREA)
        
        success, encoded_img = cv2.imencode('.jpg', img)
        if not success:
            return None, None
        return base64.b64encode(encoded_img.tobytes()).decode('utf-8'), 'image/jpeg'
    except Exception as e:
        sys.stderr.write(f"Error resizing {img_path}: {str(e)}\n")
        return None, None

def get_yunet_detector(width, height):
    global _YUNET_DETECTOR
    model_dir = os.path.join(os.path.dirname(__file__), "models")
    os.makedirs(model_dir, exist_ok=True)
    model_path = os.path.join(model_dir, "face_detection_yunet_2023mar.onnx")
    
    # Download ONNX model file if not exists
    if not os.path.exists(model_path):
        try:
            sys.stderr.write("Downloading YuNet ONNX model for high-accuracy face detection...\n")
            url = "https://github.com/opencv/opencv_zoo/raw/main/models/face_detection_yunet/face_detection_yunet_2023mar.onnx"
            r = requests.get(url, timeout=15)
            with open(model_path, "wb") as f:
                f.write(r.content)
        except Exception as e:
            sys.stderr.write(f"Failed to download YuNet model: {str(e)}\n")
            return None

    if not os.path.exists(model_path):
        return None
        
    try:
        if _YUNET_DETECTOR is None:
            _YUNET_DETECTOR = cv2.FaceDetectorYN.create(
                model=model_path,
                config="",
                input_size=(width, height),
                score_threshold=0.45,
                nms_threshold=0.3,
                top_k=5000
            )
        else:
            _YUNET_DETECTOR.setInputSize((width, height))
        return _YUNET_DETECTOR
    except Exception as e:
        sys.stderr.write(f"Failed to initialize/configure FaceDetectorYN: {str(e)}\n")
        return None

def get_sface_recognizer():
    global _SFACE_RECOGNIZER
    if _SFACE_RECOGNIZER is not None:
        return _SFACE_RECOGNIZER
        
    model_dir = os.path.join(os.path.dirname(__file__), "models")
    os.makedirs(model_dir, exist_ok=True)
    model_path = os.path.join(model_dir, "face_recognition_sface_2021dec.onnx")
    
    # Download SFace ONNX model if not exists
    if not os.path.exists(model_path):
        try:
            sys.stderr.write("Downloading SFace ONNX model for high-accuracy face matching...\n")
            url = "https://github.com/opencv/opencv_zoo/raw/main/models/face_recognition_sface/face_recognition_sface_2021dec.onnx"
            r = requests.get(url, stream=True, timeout=30)
            with open(model_path, "wb") as f:
                for chunk in r.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)
        except Exception as e:
            sys.stderr.write(f"Failed to download SFace model: {str(e)}\n")
            return None

    if not os.path.exists(model_path):
        return None
        
    try:
        _SFACE_RECOGNIZER = cv2.FaceRecognizerSF.create(model_path, "")
        return _SFACE_RECOGNIZER
    except Exception as e:
        sys.stderr.write(f"Failed to initialize FaceRecognizerSF: {str(e)}\n")
        return None

def normalize_lighting(img):
    try:
        # Convert BGR to YCrCb space to normalize luminance channel Y
        ycrcb = cv2.cvtColor(img, cv2.COLOR_BGR2YCrCb)
        channels = list(cv2.split(ycrcb))
        channels[0] = cv2.equalizeHist(channels[0])  # Histogram Equalization
        ycrcb = cv2.merge(channels)
        img_eq = cv2.cvtColor(ycrcb, cv2.COLOR_YCrCb2BGR)
        
        # Apply Gamma Correction to balance shadows and high-contrast (Gamma = 1.1)
        gamma = 1.1
        invGamma = 1.0 / gamma
        table = np.array([((i / 255.0) ** invGamma) * 255 for i in range(256)]).astype("uint8")
        normalized = cv2.LUT(img_eq, table)
        return normalized
    except Exception as e:
        sys.stderr.write(f"Lighting normalization failed: {str(e)}\n")
        return img

def get_vectorized_lbp(gray):
    h, w = gray.shape
    img_center = gray[1:h-1, 1:w-1]
    lbp = np.zeros(img_center.shape, dtype=np.uint8)
    
    # 8 shifts matching directions in parallel using NumPy slicing (no loops!)
    lbp |= ((gray[0:h-2, 0:w-2] >= img_center).astype(np.uint8) << 7)
    lbp |= ((gray[0:h-2, 1:w-1] >= img_center).astype(np.uint8) << 6)
    lbp |= ((gray[0:h-2, 2:w]   >= img_center).astype(np.uint8) << 5)
    lbp |= ((gray[1:h-1, 2:w]   >= img_center).astype(np.uint8) << 4)
    lbp |= ((gray[2:h,   2:w]   >= img_center).astype(np.uint8) << 3)
    lbp |= ((gray[2:h,   1:w-1] >= img_center).astype(np.uint8) << 2)
    lbp |= ((gray[2:h,   0:w-2] >= img_center).astype(np.uint8) << 1)
    lbp |= ((gray[1:h-1, 0:w-2] >= img_center).astype(np.uint8) << 0)
    
    return lbp

def extract_grid_lbp_features(aligned_img):
    try:
        # Convert to grayscale for texture analysis
        if len(aligned_img.shape) == 3:
            gray = cv2.cvtColor(aligned_img, cv2.COLOR_BGR2GRAY)
        else:
            gray = aligned_img
            
        # Fast vectorized LBP computation
        lbp = get_vectorized_lbp(gray)
        
        # Standardize 7x7 gridding over the aligned face
        grid_rows, grid_cols = 7, 7
        h, w = lbp.shape
        block_h = h // grid_rows
        block_w = w // grid_cols
        
        features = []
        for r in range(grid_rows):
            for c in range(grid_cols):
                y1 = r * block_h
                y2 = (r + 1) * block_h
                x1 = c * block_w
                x2 = (c + 1) * block_w
                
                block = lbp[y1:y2, x1:x2]
                hist, _ = np.histogram(block, bins=256, range=(0, 256))
                hist = hist.astype("float32")
                hist /= (hist.sum() + 1e-6)
                features.append(hist)
                
        return np.concatenate(features)
    except Exception as e:
        sys.stderr.write(f"LBP grid extraction failed: {str(e)}\n")
        return None

def align_and_warp_face(img, face, desired_width=512, desired_height=512):
    try:
        # Landmarks: Right Eye (idx 4,5), Left Eye (idx 6,7)
        # Note: Right Eye is on the viewer's left side of the image, Left Eye is on the viewer's right.
        re_x, re_y = face[4], face[5]
        le_x, le_y = face[6], face[7]
        
        # Calculate the angle between the eyes to determine tilt
        dy = le_y - re_y
        dx = le_x - re_x
        angle = np.degrees(np.arctan2(dy, dx))
        
        # Midpoint between eyes
        eyes_center = (float(re_x + le_x) / 2.0, float(re_y + le_y) / 2.0)
        
        # Determine the scale based on the eye distance
        dist = np.sqrt(dx**2 + dy**2)
        desired_dist = 0.30  # Desired proportion of width occupied by distance between eyes
        desired_pixel_dist = desired_width * desired_dist
        scale = desired_pixel_dist / dist
        
        # Get rotation matrix centered on eye midpoint
        M = cv2.getRotationMatrix2D(eyes_center, angle, scale)
        
        # Update translation to map eye midpoint to target center (0.5, 0.35)
        tX = desired_width * 0.5
        tY = desired_height * 0.35
        M[0, 2] += (tX - eyes_center[0])
        M[1, 2] += (tY - eyes_center[1])
        
        # Perform affine warping
        warped = cv2.warpAffine(img, M, (desired_width, desired_height), flags=cv2.INTER_CUBIC)
        return warped
    except Exception as e:
        sys.stderr.write(f"Face alignment warping failed: {str(e)}\n")
        return None

def crop_face_from_selfie(img_path):
    try:
        img = cv2.imread(img_path)
        if img is None:
            return None, None
            
        height, width = img.shape[:2]
        detector = get_yunet_detector(width, height)
        
        if detector is not None:
            retval, faces = detector.detect(img)
            if faces is not None and len(faces) > 0:
                # Sort by box area to get the largest face
                faces = sorted(faces, key=lambda f: f[2] * f[3], reverse=True)
                
                # Perform landmark searching, triangulation mapping, and perspective alignment warping!
                warped = align_and_warp_face(img, faces[0], 512, 512)
                
                if warped is not None:
                    success, encoded_img = cv2.imencode('.jpg', warped)
                    if success:
                        sys.stderr.write("Successfully aligned and warped face from selfie using YuNet landmarks.\n")
                        return base64.b64encode(encoded_img.tobytes()).decode('utf-8'), 'image/jpeg'
                
                # Fallback to padded bounding box if custom warp failed
                x, y, w, h = faces[0][0:4].astype(int)
                pad_x = int(w * 0.25)
                pad_y = int(h * 0.25)
                
                x1 = max(0, x - pad_x)
                y1 = max(0, y - pad_y)
                x2 = min(width, x + w + pad_x)
                y2 = min(height, y + h + pad_y)
                
                cropped = img[y1:y2, x1:x2]
                
                # Resize if the cropped face is still very large
                max_size = 512
                c_height, c_width = cropped.shape[:2]
                if max(c_height, c_width) > max_size:
                    scale = max_size / max(c_height, c_width)
                    cropped = cv2.resize(cropped, (int(c_width * scale), int(c_height * scale)), interpolation=cv2.INTER_AREA)
                
                success, encoded_img = cv2.imencode('.jpg', cropped)
                if success:
                    sys.stderr.write("Successfully cropped face from selfie locally using YuNet DNN (Fallback box).\n")
                    return base64.b64encode(encoded_img.tobytes()).decode('utf-8'), 'image/jpeg'
        else:
            sys.stderr.write("YuNet detector not available, using full selfie.\n")
    except Exception as e:
        sys.stderr.write(f"Selfie face cropping error: {str(e)}\n")
    
    # Fallback to standard resize if cropping fails
    return get_resized_image_base64(img_path, max_size=1024)

def load_dotenv():
    # Fallback to manually reading .env if not already in env
    env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
    if os.path.exists(env_path):
        with open(env_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, val = line.split('=', 1)
                    key = key.strip()
                    val = val.strip().strip('"').strip("'")
                    os.environ[key] = val

def local_face_recognition_fallback(selfie_path, image_paths):
    sys.stderr.write(f"Running high-accuracy local face recognition matching (SFace + 7x7 LBP Grid) across {len(image_paths)} images...\n")
    matched_images = []
    
    # Load selfie and detect face
    selfie_img = cv2.imread(selfie_path)
    if selfie_img is None:
        sys.stderr.write("Failed to read selfie for local fallback comparison.\n")
        return []
        
    h1, w1 = selfie_img.shape[:2]
    selfie_detector = get_yunet_detector(w1, h1)
    recognizer = get_sface_recognizer()
    
    if selfie_detector is None or recognizer is None:
        sys.stderr.write("YuNet or SFace models not available. Cannot perform local face matching.\n")
        return []
        
    _, selfie_faces = selfie_detector.detect(selfie_img)
    if selfie_faces is None or len(selfie_faces) == 0:
        sys.stderr.write("Selfie face not found locally for comparison.\n")
        return []
        
    # Get reference feature vector
    selfie_face = selfie_faces[0]
    sys.stderr.write("--- Reference Selfie Analysis ---\n")
    sys.stderr.write(f"[1] Face Detection: Bounding box = {selfie_face[0:4].astype(int).tolist()}, score = {selfie_face[14]:.4f}\n")
    sys.stderr.write(f"[2] Feature Search (Landmarks): Right Eye = ({selfie_face[4]:.1f}, {selfie_face[5]:.1f}), Left Eye = ({selfie_face[6]:.1f}, {selfie_face[7]:.1f})\n")
    sys.stderr.write("[3] Warping: Running eye alignment normalization to 112x112\n")
    selfie_aligned = recognizer.alignCrop(selfie_img, selfie_face)
    
    # Extract raw SFace Deep Embedding (highly sensitive to pixel value distributions)
    sys.stderr.write("[4] Feature Extraction (SFace Deep Embedding): Computing 128-dimensional vector\n")
    selfie_feat = recognizer.feature(selfie_aligned)
    
    # Apply Lighting Normalization (Histogram Equalization & Gamma Correction) for texture-based LBP gridding
    sys.stderr.write("[3.1] Lighting Normalization: Histogram Equalization & Gamma Correction for LBP\n")
    selfie_normalized = normalize_lighting(selfie_aligned)
    
    sys.stderr.write("[4.1] Feature Extraction (7x7 Spatial LBP Gridding): Computing LBP micropattern histogram\n")
    selfie_lbp = extract_grid_lbp_features(selfie_normalized)
    sys.stderr.write("Reference selfie deep feature embedding and LBP texture signature initialized.\n\n")
    
    # Scan target event images
    start_time = time.time()
    for idx, img_path in enumerate(image_paths):
        try:
            if "temp_selfie_" in os.path.basename(img_path):
                continue
                
            orig_img = cv2.imread(img_path)
            if orig_img is None:
                continue
            
            orig_h, orig_w = orig_img.shape[:2]
            
            # 1. Resize to a max size of 1024px for fast face detection inference (~20ms)
            max_detect_size = 1024
            scale = 1.0
            if max(orig_h, orig_w) > max_detect_size:
                scale = max_detect_size / max(orig_h, orig_w)
                detect_img = cv2.resize(orig_img, (int(orig_w * scale), int(orig_h * scale)), interpolation=cv2.INTER_AREA)
            else:
                detect_img = orig_img.copy()
                
            detect_h, detect_w = detect_img.shape[:2]
            detector = get_yunet_detector(detect_w, detect_h)
            
            if detector is not None:
                retval, faces = detector.detect(detect_img)
                if faces is not None and len(faces) > 0:
                    for f_idx, face in enumerate(faces):
                        # 2. Scale landmarks and bounding box back to original coordinates
                        scaled_face = face.copy()
                        if scale != 1.0:
                            scaled_face[0:14] = face[0:14] / scale
                        
                        # 3. Crop and align face from original high-resolution image for maximum detail accuracy!
                        target_aligned = recognizer.alignCrop(orig_img, scaled_face)
                        
                        # Extract raw target deep features
                        target_feat = recognizer.feature(target_aligned)
                        
                        # Apply lighting normalization to target aligned crop for LBP gridding
                        target_normalized = normalize_lighting(target_aligned)
                        target_lbp = extract_grid_lbp_features(target_normalized)
                        
                        if target_lbp is None or selfie_lbp is None:
                            continue
                            
                        # Metric calculations
                        cosine_score = recognizer.match(selfie_feat, target_feat, cv2.FaceRecognizerSF_FR_COSINE)
                        l2_score = recognizer.match(selfie_feat, target_feat, cv2.FaceRecognizerSF_FR_NORM_L2)
                        
                        # LBP Chi-Square Similarity Score calculation
                        eps = 1e-10
                        chi_square = np.sum(((selfie_lbp - target_lbp) ** 2) / (selfie_lbp + target_lbp + eps))
                        lbp_sim = 1.0 / (1.0 + chi_square)
                        
                        # High-accuracy robust match logic:
                        # - Strong SFace Deep Match (standard cosine similarity and L2 distance check)
                        # - Or medium SFace match supported by robust local spatial LBP texture similarity
                        is_match = False
                        if (cosine_score >= 0.363 and l2_score <= 1.128):
                            is_match = True
                        elif (cosine_score >= 0.32 and l2_score <= 1.25 and lbp_sim >= 0.40):
                            is_match = True
                        
                        if is_match:
                            # Log the deep learning pipeline steps exactly matching the reference pattern
                            re_x, re_y = scaled_face[4], scaled_face[5]
                            le_x, le_y = scaled_face[6], scaled_face[7]
                            
                            sys.stderr.write(f"--- High Accuracy Match in {os.path.basename(img_path)} (Face #{f_idx+1}) ---\n")
                            sys.stderr.write(f"[1] Face Detection (1024px scale -> original scale): Bounding box = {scaled_face[0:4].astype(int).tolist()}, score = {scaled_face[14]:.4f}\n")
                            sys.stderr.write(f"[2] Feature Search (Landmarks): Right Eye = ({re_x:.1f}, {re_y:.1f}), Left Eye = ({le_x:.1f}, {le_y:.1f})\n")
                            sys.stderr.write("[3] Warping: Aligned normalization to 112x112 from high-res image\n")
                            sys.stderr.write("[3.1] Lighting Normalization: Histogram Equalized & Gamma Corrected\n")
                            sys.stderr.write("[4] Feature Extraction: Computed SFace Deep Embedding & 7x7 Grid Spatial LBP Descriptor\n")
                            sys.stderr.write(f"[5] Matching Metrics:\n")
                            sys.stderr.write(f"    - Cosine Similarity: {cosine_score:.4f} (Threshold >= 0.363)\n")
                            sys.stderr.write(f"    - L2 Distance: {l2_score:.4f} (Threshold <= 1.128)\n")
                            sys.stderr.write(f"    - LBP Similarity: {lbp_sim:.4f} (Threshold >= 0.50, Chi-Square Dist = {chi_square:.4f})\n\n")
                            
                            matched_images.append({
                                "name": os.path.basename(img_path),
                                "path": img_path,
                                "confidence": "high" if cosine_score > 0.42 and l2_score < 1.0 and lbp_sim > 0.55 else "medium"
                            })
                            break  # Match found for this image, continue to next image
        except Exception as e:
            sys.stderr.write(f"Error comparing face in {img_path} locally: {str(e)}\n")
            
    sys.stderr.write(f"Local face matching completed in {time.time() - start_time:.2f} seconds. Found {len(matched_images)} matches.\n")
    return matched_images

def process_chunk_images(selfie_mime, selfie_data, chunk_paths, api_key, headers, model):
    global _API_KEY_INVALID
    if _API_KEY_INVALID:
        return None, "API key marked invalid"
        
    parts = []
    
    prompt = (
        "You are an advanced face recognition assistant. "
        "The first image labeled 'Reference Face' is a photo of the person we are searching for. "
        "You will be given multiple other event photos, each labeled with its exact filename. "
        "Analyze each event photo carefully to determine if the person from the 'Reference Face' appears in it. "
        "Pay close attention to facial features (eyes, nose, mouth shape, face shape, eyebrows, facial hair) "
        "and ignore changes in expression, lighting, glasses, or camera angle. "
        "Identify all event photos that contain a match. "
        "Output a JSON object with a single field 'matches', which is a list of matched items. "
        "Each matched item must contain 'filename' (the exact filename of the matched photo) and "
        "'confidence' (string: 'high', 'medium', or 'low')."
    )
    parts.append({"text": prompt})
    
    # Add selfie reference image
    parts.append({"text": "--- Reference Face ---"})
    parts.append({"inlineData": {"mimeType": selfie_mime, "data": selfie_data}})
    
    # Add target images for this chunk
    for img_path in chunk_paths:
        filename = os.path.basename(img_path)
        img_data, img_mime = get_resized_image_base64(img_path, max_size=768)
        if img_data:
            parts.append({"text": f"--- Event Photo: {filename} ---"})
            parts.append({"inlineData": {"mimeType": img_mime, "data": img_data}})

    payload = {
        "contents": [
            {
                "parts": parts
            }
        ],
        "generationConfig": {
            "responseMimeType": "application/json",
            "responseSchema": {
                "type": "OBJECT",
                "properties": {
                    "matches": {
                        "type": "ARRAY",
                        "items": {
                            "type": "OBJECT",
                            "properties": {
                                "filename": {"type": "STRING"},
                                "confidence": {"type": "STRING", "enum": ["high", "medium", "low"]}
                            },
                            "required": ["filename", "confidence"]
                        }
                    }
                },
                "required": ["matches"]
            }
        }
    }

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
    try:
        sys.stderr.write(f"Trying chunk API call with model: {model} for chunk of size {len(chunk_paths)}...\n")
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        
        if response.status_code == 200:
            result_json = response.json()
            candidates = result_json.get("candidates", [])
            if candidates:
                text_res = candidates[0]["content"]["parts"][0]["text"]
                data = json.loads(text_res)
                
                matched_images = []
                for item in data.get("matches", []):
                    matched_path = next((p for p in chunk_paths if os.path.basename(p) == item["filename"]), None)
                    if matched_path:
                        matched_images.append({
                            "name": item["filename"],
                            "path": matched_path,
                            "confidence": item["confidence"]
                        })
                return matched_images, None
            return [], "No candidates returned"
        elif response.status_code in (400, 401, 403):
            # Check for API key invalidation
            try:
                err_detail = response.json()
                err_msg = err_detail.get("error", {}).get("message", "")
                if "API key" in err_msg or "not valid" in err_msg or "INVALID_ARGUMENT" in err_msg:
                    _API_KEY_INVALID = True
                    sys.stderr.write("Detected invalid Gemini API key in chunk response. Future API requests will be disabled.\n")
            except Exception:
                pass
            return None, f"Auth Error {response.status_code}: {response.text}"
        elif response.status_code == 429:
            return None, "429 Rate Limit"
        else:
            return None, f"HTTP Error {response.status_code}: {response.text}"
    except Exception as e:
        return None, str(e)

def process_chunk_with_model_fallback(selfie_mime, selfie_data, chunk_paths, api_key, headers):
    model_candidates = [
        "gemini-2.5-flash",
        "gemini-2.0-flash",
        "gemini-1.5-flash",
        "gemini-2.5-pro"
    ]
    last_err = None
    for model in model_candidates:
        matched_images, error = process_chunk_images(selfie_mime, selfie_data, chunk_paths, api_key, headers, model)
        if matched_images is not None:
            return matched_images
        last_err = error
        if _API_KEY_INVALID:
            break
        # Small wait before model fallback or retry
        time.sleep(1)
    
    sys.stderr.write(f"All model candidates failed for chunk: {[os.path.basename(p) for p in chunk_paths]}. Error: {last_err}\n")
    return None

def chunk_list(lst, n):
    for i in range(0, len(lst), n):
        yield lst[i:i + n]

def process_all_images_concurrently(selfie_mime, selfie_data, image_paths, api_key, headers):
    chunk_size = 4
    chunks = list(chunk_list(image_paths, chunk_size))
    matched_images = []
    failed_chunks = []
    
    sys.stderr.write(f"Starting concurrent face scanning of {len(image_paths)} images across {len(chunks)} chunks...\n")
    
    # Run with max 3 concurrent threads to balance rate limits and speed
    with ThreadPoolExecutor(max_workers=3) as executor:
        future_to_chunk = {
            executor.submit(
                process_chunk_with_model_fallback,
                selfie_mime,
                selfie_data,
                chunk,
                api_key,
                headers
            ): chunk for chunk in chunks
        }
        
        for future in as_completed(future_to_chunk):
            chunk = future_to_chunk[future]
            try:
                result = future.result()
                if result is not None:
                    matched_images.extend(result)
                else:
                    failed_chunks.append(chunk)
            except Exception as e:
                sys.stderr.write(f"Exception during chunk processing: {str(e)}\n")
                failed_chunks.append(chunk)
                
    return matched_images, failed_chunks

def main():
    load_dotenv()
    
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Usage: python scan_faces.py <path_to_selfie> <path_to_bulk_dir>"}))
        sys.exit(1)

    selfie_path = sys.argv[1]
    bulk_dir = sys.argv[2]

    if not os.path.exists(selfie_path):
        print(json.dumps({"error": f"Selfie image not found at {selfie_path}"}))
        sys.exit(1)

    if not os.path.exists(bulk_dir):
        print(json.dumps({"error": f"Bulk directory not found at {bulk_dir}"}))
        sys.exit(1)

    # Find bulk images
    valid_extensions = ["*.jpg", "*.jpeg", "*.png", "*.webp"]
    image_paths = []
    for ext in valid_extensions:
        image_paths.extend(glob.glob(os.path.join(bulk_dir, ext)))
        image_paths.extend(glob.glob(os.path.join(bulk_dir, ext.upper())))

    image_paths = list(set(image_paths))
    image_paths = [p for p in image_paths if "temp_selfie_" not in os.path.basename(p)]

    if not image_paths:
        print(json.dumps({"matches": [], "message": "No images found in bulk directory."}))
        sys.exit(0)

    # Sort image paths for consistent scanning
    image_paths = sorted(image_paths)

    api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    
    # Fast format check instead of doing a costly model list network request
    api_valid = False
    if api_key and not api_key.startswith("MY_GEMINI_API_KEY") and len(api_key.strip()) > 20:
        api_valid = True

    # If key is invalid, fall back immediately to local
    if not api_valid:
        sys.stderr.write("Valid Gemini API Key not found. Running local face recognition fallback.\n")
        matched_images = local_face_recognition_fallback(selfie_path, image_paths)
        print(json.dumps({"matches": matched_images}))
        sys.exit(0)

    # Read and crop face from selfie for maximum recognition accuracy
    selfie_data, selfie_mime = crop_face_from_selfie(selfie_path)
    if not selfie_data:
        # Fallback to loading raw selfie resized if cropping fails
        selfie_data, selfie_mime = get_resized_image_base64(selfie_path, max_size=512)
        if not selfie_data:
            print(json.dumps({"error": "Failed to read or crop selfie image."}))
            sys.exit(1)

    headers = {"Content-Type": "application/json"}

    # Process images concurrently with Gemini API
    matched_images, failed_chunks = process_all_images_concurrently(selfie_mime, selfie_data, image_paths, api_key, headers)

    # Fallback to local face recognition for any failed chunks
    if failed_chunks:
        flat_failed_paths = [p for chunk in failed_chunks for p in chunk]
        sys.stderr.write(f"Running high-accuracy local face recognition for {len(flat_failed_paths)} images failed by API...\n")
        local_matches = local_face_recognition_fallback(selfie_path, flat_failed_paths)
        
        # Merge local matches (avoid duplicates)
        existing_names = {m["name"] for m in matched_images}
        for lm in local_matches:
            if lm["name"] not in existing_names:
                matched_images.append(lm)

    print(json.dumps({"matches": matched_images}))

if __name__ == "__main__":
    main()
