"""
SportShield AI — Provenance Chain Module
Creates tamper-proof hash chains for verified media assets.
"""
import hashlib
import time
import json
import io
import base64
import qrcode


# In-memory provenance store (Firestore in production)
_provenance_store = {}


def create_provenance_record(
    media_hash: str,
    analysis_result: dict,
    creator: str = "SportShield AI",
) -> dict:
    """Create a new provenance record in the chain."""
    timestamp = time.time()

    # Find previous hash in chain
    previous_hash = ""
    if media_hash in _provenance_store:
        chain = _provenance_store[media_hash]
        if chain:
            previous_hash = chain[-1]["record_hash"]

    record = {
        "media_hash": media_hash,
        "timestamp": timestamp,
        "timestamp_iso": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(timestamp)),
        "creator": creator,
        "action": "VERIFICATION",
        "verdict": analysis_result.get("final_verdict", "UNKNOWN"),
        "confidence": analysis_result.get("confidence", 0),
        "previous_hash": previous_hash,
    }

    # Generate record hash (blockchain-style)
    record_string = json.dumps(record, sort_keys=True)
    record["record_hash"] = hashlib.sha256(record_string.encode()).hexdigest()

    # Store
    if media_hash not in _provenance_store:
        _provenance_store[media_hash] = []
    _provenance_store[media_hash].append(record)

    # Generate QR code
    qr_data = json.dumps({
        "platform": "SportShield AI",
        "media_hash": media_hash[:16] + "...",
        "verdict": record["verdict"],
        "verified_at": record["timestamp_iso"],
        "record_hash": record["record_hash"][:16] + "...",
    })
    record["qr_code_base64"] = _generate_qr(qr_data)

    return record


def get_provenance_chain(media_hash: str) -> list:
    """Get the full provenance chain for a media asset."""
    return _provenance_store.get(media_hash, [])


def compute_media_hash(media_bytes: bytes) -> str:
    """Compute SHA-256 hash of media content."""
    return hashlib.sha256(media_bytes).hexdigest()


def verify_chain_integrity(media_hash: str) -> dict:
    """Verify the integrity of a provenance chain."""
    chain = _provenance_store.get(media_hash, [])
    if not chain:
        return {"valid": False, "error": "No chain found"}

    is_valid = True
    for i in range(1, len(chain)):
        if chain[i]["previous_hash"] != chain[i - 1]["record_hash"]:
            is_valid = False
            break

    return {
        "valid": is_valid,
        "chain_length": len(chain),
        "first_verified": chain[0]["timestamp_iso"],
        "last_verified": chain[-1]["timestamp_iso"],
    }


def _generate_qr(data: str) -> str:
    """Generate a QR code as base64 PNG."""
    qr = qrcode.make(data)
    buf = io.BytesIO()
    qr.save(buf, format="PNG")
    return base64.b64encode(buf.getvalue()).decode("utf-8")
