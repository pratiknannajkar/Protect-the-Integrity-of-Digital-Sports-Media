"""
SportShield AI — Metadata Verification Module
Extracts and validates EXIF data to detect inconsistencies.
"""
import io
from PIL import Image
from PIL.ExifTags import TAGS


def run_metadata_check(image_bytes: bytes, filename: str = "") -> dict:
    """
    Extract and analyze image metadata for signs of tampering.
    Checks for software edits, missing data, and inconsistencies.
    """
    try:
        img = Image.open(io.BytesIO(image_bytes))
        exif_data = {}
        anomalies = []
        raw_exif = img._getexif() if hasattr(img, "_getexif") else None

        if raw_exif:
            for tag_id, value in raw_exif.items():
                tag = TAGS.get(tag_id, tag_id)
                try:
                    exif_data[str(tag)] = str(value)
                except Exception:
                    exif_data[str(tag)] = "unreadable"

        score = 0

        # Check 1: No EXIF data at all (suspicious for original photos)
        if not raw_exif or len(exif_data) == 0:
            anomalies.append({
                "type": "MISSING_EXIF",
                "severity": "HIGH",
                "detail": "No EXIF metadata found — likely stripped or AI-generated"
            })
            score += 35

        # Check 2: Editing software detected
        editing_tools = ["photoshop", "gimp", "lightroom", "snapseed",
                         "canva", "pixlr", "aftereffect", "premiere"]
        software = exif_data.get("Software", "").lower()
        if any(tool in software for tool in editing_tools):
            anomalies.append({
                "type": "EDITING_SOFTWARE",
                "severity": "MEDIUM",
                "detail": f"Edited with: {exif_data.get('Software', 'Unknown')}"
            })
            score += 25

        # Check 3: Missing camera make/model
        if raw_exif and not exif_data.get("Make") and not exif_data.get("Model"):
            anomalies.append({
                "type": "NO_CAMERA_INFO",
                "severity": "MEDIUM",
                "detail": "No camera manufacturer or model info found"
            })
            score += 15

        # Check 4: Resolution inconsistency
        width, height = img.size
        if width > 0 and height > 0:
            aspect = width / height
            if aspect > 4 or aspect < 0.25:
                anomalies.append({
                    "type": "UNUSUAL_ASPECT",
                    "severity": "LOW",
                    "detail": f"Unusual aspect ratio: {round(aspect, 2)}"
                })
                score += 10

        # Check 5: File format analysis
        fmt = img.format or "UNKNOWN"
        if fmt == "PNG" and filename.lower().endswith((".jpg", ".jpeg")):
            anomalies.append({
                "type": "FORMAT_MISMATCH",
                "severity": "HIGH",
                "detail": "File extension doesn't match actual format"
            })
            score += 25

        score = min(100, score)

        return {
            "module": "Metadata Verification",
            "score": score,
            "integrity_score": 100 - score,
            "format": fmt,
            "dimensions": f"{width}x{height}",
            "anomalies": anomalies,
            "anomaly_count": len(anomalies),
            "metadata": dict(list(exif_data.items())[:15]),
            "status": "SUSPICIOUS" if score > 30 else "CLEAN",
        }
    except Exception as e:
        return {
            "module": "Metadata Verification",
            "score": 0,
            "error": str(e),
            "status": "ERROR",
        }
