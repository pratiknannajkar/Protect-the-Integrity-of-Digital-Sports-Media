"""
SportShield AI — Error Level Analysis (ELA) Module
Detects pixel-level tampering by analyzing JPEG compression artifacts.
"""
import io
import base64
import numpy as np
from PIL import Image, ImageChops, ImageEnhance


def run_ela(image_bytes, quality=90, scale=15):
    try:
        original = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        buffer = io.BytesIO()
        original.save(buffer, "JPEG", quality=quality)
        buffer.seek(0)
        resaved = Image.open(buffer).convert("RGB")

        diff = ImageChops.difference(original, resaved)
        extrema = diff.getextrema()
        max_diff = max([ex[1] for ex in extrema])
        if max_diff == 0:
            max_diff = 1
        amplification = 255.0 / max_diff * scale
        enhancer = ImageEnhance.Brightness(diff)
        ela_image = enhancer.enhance(amplification)

        ela_array = np.array(ela_image)
        mean_error = float(np.mean(ela_array))
        max_error = float(np.max(ela_array))
        std_error = float(np.std(ela_array))

        threshold = mean_error + 2 * std_error
        tampered_mask = np.mean(ela_array, axis=2) > threshold
        tampered_ratio = float(np.sum(tampered_mask)) / tampered_mask.size

        score = min(100, int(tampered_ratio * 500 + (std_error / 30) * 50))

        heatmap_buffer = io.BytesIO()
        ela_image.save(heatmap_buffer, format="PNG")
        heatmap_base64 = base64.b64encode(heatmap_buffer.getvalue()).decode("utf-8")

        regions = []
        try:
            from scipy import ndimage
            labeled, num_features = ndimage.label(tampered_mask)
            for i in range(1, min(num_features + 1, 6)):
                ys, xs = np.where(labeled == i)
                if len(ys) > 50:
                    regions.append({
                        "x": int(np.min(xs)), "y": int(np.min(ys)),
                        "width": int(np.max(xs) - np.min(xs)),
                        "height": int(np.max(ys) - np.min(ys)),
                    })
        except ImportError:
            pass

        return {
            "module": "Error Level Analysis (ELA)",
            "score": score,
            "mean_error": round(mean_error, 2),
            "max_error": round(max_error, 2),
            "std_error": round(std_error, 2),
            "tampered_ratio": round(tampered_ratio * 100, 2),
            "tampered_regions": regions[:5],
            "heatmap_base64": heatmap_base64,
            "status": "SUSPICIOUS" if score > 40 else "CLEAN",
        }
    except Exception as e:
        return {"module": "Error Level Analysis (ELA)", "score": 0, "error": str(e), "status": "ERROR"}
