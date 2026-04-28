"""
SportShield AI — Face Forensics Detection Module
Detects face swaps and deepfakes using facial landmark analysis.
"""
import io
import base64
import numpy as np
import cv2


def run_face_forensics(image_bytes: bytes) -> dict:
    """
    Detect potential face manipulations using OpenCV face detection
    and consistency analysis.
    """
    try:
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        h, w = img.shape[:2]

        # Load Haar cascade for face detection
        face_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        )
        faces = face_cascade.detectMultiScale(gray, 1.1, 5, minSize=(30, 30))

        if len(faces) == 0:
            return {
                "module": "Face Forensics",
                "score": 0,
                "faces_found": 0,
                "deepfake_probability": 0,
                "face_regions": [],
                "status": "NO_FACES",
                "detail": "No faces detected in image",
            }

        face_results = []
        total_score = 0

        for i, (x, y, fw, fh) in enumerate(faces):
            face_roi = img[y:y + fh, x:x + fw]
            face_gray = gray[y:y + fh, x:x + fw]

            # Analyze face region for manipulation artifacts
            # 1. Edge consistency check
            edges = cv2.Canny(face_gray, 50, 150)
            edge_density = float(np.sum(edges > 0)) / edges.size

            # 2. Blur detection (deepfakes often have inconsistent blur)
            laplacian_var = float(cv2.Laplacian(face_gray, cv2.CV_64F).var())

            # 3. Color consistency between face and surrounding area
            margin = 20
            surr_y1 = max(0, y - margin)
            surr_y2 = min(h, y + fh + margin)
            surr_x1 = max(0, x - margin)
            surr_x2 = min(w, x + fw + margin)
            surrounding = img[surr_y1:surr_y2, surr_x1:surr_x2]

            face_mean = np.mean(face_roi, axis=(0, 1))
            surr_mean = np.mean(surrounding, axis=(0, 1))
            color_diff = float(np.linalg.norm(face_mean - surr_mean))

            # 4. Noise analysis
            noise = cv2.fastNlMeansDenoising(face_gray) - face_gray
            noise_level = float(np.std(noise.astype(float)))

            # Score calculation
            face_score = 0
            if edge_density > 0.15:
                face_score += 20
            if laplacian_var < 100:
                face_score += 25
            if color_diff > 40:
                face_score += 30
            if noise_level > 8:
                face_score += 25

            face_score = min(100, face_score)
            total_score += face_score

            face_results.append({
                "face_id": i + 1,
                "x": int(x), "y": int(y),
                "width": int(fw), "height": int(fh),
                "score": face_score,
                "edge_density": round(edge_density, 4),
                "blur_variance": round(laplacian_var, 2),
                "color_consistency": round(color_diff, 2),
                "noise_level": round(noise_level, 2),
            })

        avg_score = total_score // len(faces) if faces is not None and len(faces) > 0 else 0

        # Draw faces on image for visualization
        vis_img = img.copy()
        for f in face_results:
            color = (0, 255, 0) if f["score"] < 40 else (0, 0, 255)
            cv2.rectangle(vis_img, (f["x"], f["y"]),
                          (f["x"] + f["width"], f["y"] + f["height"]),
                          color, 2)
            cv2.putText(vis_img, f"{f['score']}%",
                        (f["x"], f["y"] - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)

        _, buf = cv2.imencode(".png", vis_img)
        vis_base64 = base64.b64encode(buf.tobytes()).decode("utf-8")

        return {
            "module": "Face Forensics",
            "score": avg_score,
            "faces_found": len(faces),
            "deepfake_probability": avg_score,
            "face_regions": face_results,
            "visualization_base64": vis_base64,
            "status": "SUSPICIOUS" if avg_score > 40 else "CLEAN",
        }
    except Exception as e:
        return {
            "module": "Face Forensics",
            "score": 0,
            "error": str(e),
            "status": "ERROR",
        }
