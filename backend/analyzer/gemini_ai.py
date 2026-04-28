"""
SportShield AI — Gemini 2.0 Pro AI Assessment Module
The central AI brain that aggregates all forensic results and provides
a final, contextual, sports-aware verdict.
"""
import io
import base64
import os
import google.generativeai as genai
from PIL import Image
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))


def run_gemini_assessment(image_bytes: bytes, module_results: dict) -> dict:
    """
    Use Gemini to analyze the image with full context from
    all other forensic modules, providing a final sports-aware verdict.
    """
    try:
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")

        # Resize for API (max 1024px)
        max_dim = 1024
        if max(img.size) > max_dim:
            ratio = max_dim / max(img.size)
            img = img.resize((int(img.width * ratio), int(img.height * ratio)))

        prompt = _build_prompt(module_results)

        # Try multiple models in order of preference
        models_to_try = ["gemini-2.0-flash", "gemini-1.5-flash"]
        ai_text = None

        for model_name in models_to_try:
            try:
                import time as _time
                model = genai.GenerativeModel(model_name)
                response = model.generate_content([prompt, img])
                ai_text = response.text if response.text else None
                if ai_text:
                    break
            except Exception as model_err:
                err_str = str(model_err)
                if "429" in err_str or "quota" in err_str:
                    _time.sleep(2)  # Brief wait before trying next model
                    continue
                raise model_err

        if not ai_text:
            raise Exception("All Gemini models rate-limited")

        verdict, confidence = _parse_verdict(ai_text, module_results)

        return {
            "module": "Gemini AI Assessment",
            "score": 100 - confidence if verdict == "TAMPERED" else confidence,
            "verdict": verdict,
            "confidence": confidence,
            "explanation": ai_text,
            "model_used": "gemini-2.0-flash",
            "status": verdict,
        }
    except Exception as e:
        verdict, confidence = _fallback_verdict(module_results)
        return {
            "module": "Gemini AI Assessment",
            "score": 100 - confidence if verdict == "TAMPERED" else confidence,
            "verdict": verdict,
            "confidence": confidence,
            "explanation": f"Analysis completed using multi-module forensic assessment. The verdict is based on combined results from ELA ({module_results.get('ela', {}).get('score', 0)}/100), DCT ({module_results.get('dct', {}).get('score', 0)}/100), Face Forensics ({module_results.get('face', {}).get('score', 0)}/100), and Metadata ({module_results.get('metadata', {}).get('score', 0)}/100) analysis modules.",
            "model_used": "multi-module-fallback",
            "status": verdict,
        }


def _build_prompt(module_results: dict) -> str:
    """Build a detailed prompt for Gemini analysis."""
    return f"""You are SportShield AI, an expert digital forensics analyst specializing in sports media integrity.

Analyze this image for signs of digital manipulation, deepfakes, or AI generation. This is specifically for SPORTS MEDIA verification.

Here are the results from our automated forensic analysis modules:

1. **Error Level Analysis (ELA):**
   - Tampering Score: {module_results.get('ela', {}).get('score', 'N/A')}/100
   - Status: {module_results.get('ela', {}).get('status', 'N/A')}
   - Tampered Ratio: {module_results.get('ela', {}).get('tampered_ratio', 'N/A')}%

2. **DCT Frequency Analysis:**
   - AI-Generation Score: {module_results.get('dct', {}).get('score', 'N/A')}/100
   - Is AI Generated: {module_results.get('dct', {}).get('is_ai_generated', 'N/A')}
   - High Frequency Ratio: {module_results.get('dct', {}).get('high_freq_ratio', 'N/A')}%

3. **Face Forensics:**
   - Deepfake Score: {module_results.get('face', {}).get('score', 'N/A')}/100
   - Faces Found: {module_results.get('face', {}).get('faces_found', 'N/A')}
   - Status: {module_results.get('face', {}).get('status', 'N/A')}

4. **Metadata Verification:**
   - Integrity Score: {module_results.get('metadata', {}).get('integrity_score', 'N/A')}/100
   - Anomalies Found: {module_results.get('metadata', {}).get('anomaly_count', 'N/A')}
   - Status: {module_results.get('metadata', {}).get('status', 'N/A')}

Based on the image AND these forensic results, provide:

1. **VERDICT**: Exactly one of: AUTHENTIC, TAMPERED, or SUSPICIOUS
2. **CONFIDENCE**: A percentage (0-100%)
3. **EXPLANATION**: 2-3 sentences explaining your assessment in simple terms
4. **SPORTS CONTEXT**: If this is sports media, comment on the sports-specific context
5. **TAMPERING TYPE**: If tampered, specify the type (deepfake, splicing, copy-move, AI-generated, metadata manipulation)

Format your response clearly with these sections labeled."""


def _parse_verdict(ai_text: str, module_results: dict) -> tuple:
    """Parse Gemini's response to extract verdict and confidence."""
    text_upper = ai_text.upper()

    if "TAMPERED" in text_upper:
        verdict = "TAMPERED"
    elif "SUSPICIOUS" in text_upper:
        verdict = "SUSPICIOUS"
    else:
        verdict = "AUTHENTIC"

    # Extract confidence
    import re
    confidence_matches = re.findall(r"(\d{1,3})%", ai_text)
    if confidence_matches:
        confidence = int(confidence_matches[0])
        confidence = min(99, max(1, confidence))
    else:
        # Calculate from module scores
        scores = [
            module_results.get("ela", {}).get("score", 0),
            module_results.get("dct", {}).get("score", 0),
            module_results.get("face", {}).get("score", 0),
            module_results.get("metadata", {}).get("score", 0),
        ]
        avg = sum(scores) / len(scores)
        confidence = max(60, min(98, int(100 - avg) if verdict == "AUTHENTIC" else int(avg + 20)))

    return verdict, confidence


def _fallback_verdict(module_results: dict) -> tuple:
    """Fallback verdict when Gemini is unavailable."""
    scores = [
        module_results.get("ela", {}).get("score", 0),
        module_results.get("dct", {}).get("score", 0),
        module_results.get("face", {}).get("score", 0),
        module_results.get("metadata", {}).get("score", 0),
    ]
    avg = sum(scores) / len(scores)

    if avg > 60:
        return "TAMPERED", min(95, int(avg + 10))
    elif avg > 30:
        return "SUSPICIOUS", int(50 + avg / 2)
    else:
        return "AUTHENTIC", max(70, int(100 - avg))
