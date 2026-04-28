"""
SportShield AI — DCT Frequency Analysis Module
Detects AI-generated content through Discrete Cosine Transform frequency patterns.
"""
import io
import base64
import numpy as np
from PIL import Image
import cv2


def run_dct(image_bytes: bytes) -> dict:
    """
    Perform DCT frequency analysis to detect AI-generated or manipulated content.
    AI-generated images have distinct frequency signatures vs. real photographs.
    """
    try:
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        # Resize for consistent analysis
        gray = cv2.resize(gray, (256, 256))
        gray_float = np.float32(gray)

        # Apply DCT
        dct_result = cv2.dct(gray_float)

        # Analyze frequency distribution
        # AI-generated images tend to have unusual high-frequency patterns
        h, w = dct_result.shape
        low_freq = dct_result[:h // 4, :w // 4]
        mid_freq = dct_result[h // 4:h // 2, w // 4:w // 2]
        high_freq = dct_result[h // 2:, w // 2:]

        low_energy = float(np.sum(np.abs(low_freq)))
        mid_energy = float(np.sum(np.abs(mid_freq)))
        high_energy = float(np.sum(np.abs(high_freq)))
        total_energy = low_energy + mid_energy + high_energy + 1e-10

        # Ratio analysis — AI images have abnormal frequency distributions
        high_ratio = high_energy / total_energy
        mid_ratio = mid_energy / total_energy

        # AI-generated images often have suppressed mid-frequencies
        # and unusual high-frequency patterns
        anomaly_score = 0
        if high_ratio > 0.15:
            anomaly_score += 30
        if mid_ratio < 0.05:
            anomaly_score += 25
        if high_ratio / (mid_ratio + 1e-10) > 3.0:
            anomaly_score += 25

        # Check for periodic patterns (common in GAN artifacts)
        spectrum = np.log1p(np.abs(dct_result))
        spectrum_std = float(np.std(spectrum))
        if spectrum_std < 1.5:
            anomaly_score += 20

        score = min(100, anomaly_score)

        # Generate frequency visualization
        vis = np.log1p(np.abs(dct_result))
        vis = (vis / vis.max() * 255).astype(np.uint8)
        vis_colored = cv2.applyColorMap(vis, cv2.COLORMAP_JET)
        _, buf = cv2.imencode(".png", vis_colored)
        freq_map_base64 = base64.b64encode(buf.tobytes()).decode("utf-8")

        return {
            "module": "DCT Frequency Analysis",
            "score": score,
            "is_ai_generated": score > 50,
            "low_freq_energy": round(low_energy, 2),
            "mid_freq_energy": round(mid_energy, 2),
            "high_freq_energy": round(high_energy, 2),
            "high_freq_ratio": round(high_ratio * 100, 2),
            "frequency_map_base64": freq_map_base64,
            "status": "SUSPICIOUS" if score > 40 else "CLEAN",
        }
    except Exception as e:
        return {
            "module": "DCT Frequency Analysis",
            "score": 0,
            "error": str(e),
            "status": "ERROR",
        }
