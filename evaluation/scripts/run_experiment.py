#!/usr/bin/env python3
"""
Experiment Runner

Executes controlled test cases against both Baseline and Verion AI systems.
Captures raw results, end-to-end latency, errors, and metadata in evaluation/baseline_results/ and evaluation/verion_results/.
Communicates exclusively via HTTP API endpoints.
"""

import sys
import os
import json
import time
import argparse
import urllib.request
import urllib.error
import uuid
import mimetypes
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Optional, Tuple, List

# Base Evaluation Path
SCRIPT_DIR = Path(__file__).resolve().parent
EVALUATION_DIR = SCRIPT_DIR.parent
TEST_CASES_DIR = EVALUATION_DIR / "test_cases"
BASELINE_RESULTS_DIR = EVALUATION_DIR / "baseline_results"
VERION_RESULTS_DIR = EVALUATION_DIR / "verion_results"

# Default API endpoints
DEFAULT_BASELINE_URL = os.getenv("BASELINE_API_URL", "http://localhost:8001/generate")
DEFAULT_VERION_URL = os.getenv("VERION_API_URL", "http://localhost:8000/api/generate")

def load_test_cases(test_cases_dir: Path) -> Dict[str, Dict[str, Any]]:
    """Discover and load all valid test cases."""
    cases = {}
    if not test_cases_dir.exists():
        return cases

    for item in sorted(test_cases_dir.iterdir()):
        input_file = item / "input.json"
        if item.is_dir() and input_file.exists():
            try:
                with open(input_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    tc_id = data.get("test_case_id", item.name)
                    cases[tc_id] = {
                        "dir": item,
                        "data": data
                    }
            except Exception as e:
                print(f"Warning: Could not load {input_file}: {e}")
    return cases

def send_http_post_json(url: str, payload: Dict[str, Any], timeout: int = 60) -> Tuple[bool, float, Optional[Dict[str, Any]], Optional[str]]:
    """Send an HTTP POST request with JSON payload and measure latency."""
    start_time = time.perf_counter()
    headers = {"Content-Type": "application/json"}
    json_bytes = json.dumps(payload).encode("utf-8")

    req = urllib.request.Request(url, data=json_bytes, headers=headers, method="POST")

    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)
            resp_body = resp.read().decode("utf-8")
            try:
                response_data = json.loads(resp_body)
                return True, elapsed_ms, response_data, None
            except json.JSONDecodeError:
                return True, elapsed_ms, {"raw_body": resp_body}, None
    except urllib.error.HTTPError as e:
        elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)
        err_body = e.read().decode("utf-8") if e.fp else str(e)
        return False, elapsed_ms, None, f"HTTP Error {e.code}: {e.reason} - {err_body}"
    except urllib.error.URLError as e:
        elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)
        return False, elapsed_ms, None, f"Connection Error: {e.reason}"
    except Exception as e:
        elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)
        return False, elapsed_ms, None, f"Unexpected Error: {str(e)}"

def encode_multipart_formdata(fields: Dict[str, str], files: List[Tuple[str, str, bytes, str]]) -> Tuple[bytes, str]:
    """Encode fields and files into multipart/form-data."""
    boundary = uuid.uuid4().hex
    body = bytearray()
    
    for name, value in fields.items():
        if value is None:
            continue
        body.extend(f'--{boundary}\r\n'.encode('utf-8'))
        body.extend(f'Content-Disposition: form-data; name="{name}"\r\n\r\n'.encode('utf-8'))
        body.extend(f'{value}\r\n'.encode('utf-8'))
        
    for field_name, filename, file_data, mimetype in files:
        body.extend(f'--{boundary}\r\n'.encode('utf-8'))
        body.extend(f'Content-Disposition: form-data; name="{field_name}"; filename="{filename}"\r\n'.encode('utf-8'))
        body.extend(f'Content-Type: {mimetype}\r\n\r\n'.encode('utf-8'))
        body.extend(file_data)
        body.extend(b'\r\n')
        
    body.extend(f'--{boundary}--\r\n'.encode('utf-8'))
    return bytes(body), boundary

def send_http_post_multipart(url: str, fields: Dict[str, str], files: List[Tuple[str, str, bytes, str]], timeout: int = 120) -> Tuple[bool, float, Optional[Dict[str, Any]], Optional[str]]:
    """Send an HTTP POST request with multipart/form-data payload and measure latency."""
    start_time = time.perf_counter()
    
    body, boundary = encode_multipart_formdata(fields, files)
    headers = {"Content-Type": f"multipart/form-data; boundary={boundary}"}
    
    req = urllib.request.Request(url, data=body, headers=headers, method="POST")
    
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)
            resp_body = resp.read().decode("utf-8")
            try:
                response_data = json.loads(resp_body)
                return True, elapsed_ms, response_data, None
            except json.JSONDecodeError:
                return True, elapsed_ms, {"raw_body": resp_body}, None
    except urllib.error.HTTPError as e:
        elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)
        err_body = e.read().decode("utf-8") if e.fp else str(e)
        return False, elapsed_ms, None, f"HTTP Error {e.code}: {e.reason} - {err_body}"
    except urllib.error.URLError as e:
        elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)
        return False, elapsed_ms, None, f"Connection Error: {e.reason}"
    except Exception as e:
        elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)
        return False, elapsed_ms, None, f"Unexpected Error: {str(e)}"

def run_baseline_case(tc_id: str, tc_data: Dict[str, Any], url: str, exp_id: str) -> Dict[str, Any]:
    """Execute a test case against the Baseline API."""
    payload = {
        "product_name": tc_data.get("product_name", ""),
        "brand": tc_data.get("brand"),
        "description": tc_data.get("description"),
        "specifications": tc_data.get("specifications"),
        "price": tc_data.get("price"),
        "condition": tc_data.get("condition"),
        "target_platform": tc_data.get("target_platform"),
        "images": tc_data.get("images")
    }

    success, latency_ms, resp_data, error_msg = send_http_post_json(url, payload)

    result = {
        "experiment_id": exp_id,
        "test_case_id": tc_id,
        "system": "baseline",
        "timestamp": datetime.now().isoformat(),
        "success": success and (resp_data.get("success", True) if resp_data else False),
        "latency_ms": resp_data.get("latency_ms", latency_ms) if resp_data else latency_ms,
        "model": resp_data.get("model", "unknown") if resp_data else "unknown",
        "raw_output": resp_data.get("output") if resp_data else None,
        "token_usage": resp_data.get("token_usage") if resp_data else None,
        "estimated_cost": resp_data.get("estimated_cost") if resp_data else None,
        "error": error_msg or (resp_data.get("error") if resp_data else None),
        "capability_metadata": {
            "image_processing_supported": False,
            "privacy_anonymization": False,
            "rag_context": False,
            "multi_agent_workflow": False
        }
    }
    return result

def run_verion_case(tc_id: str, tc_data: Dict[str, Any], tc_dir: Path, url: str, exp_id: str) -> Dict[str, Any]:
    """Execute a test case against the Verion AI API."""
    # Build raw_description
    desc_parts = []
    if tc_data.get("product_name"): desc_parts.append(f"Product Name: {tc_data['product_name']}")
    if tc_data.get("brand"): desc_parts.append(f"Brand: {tc_data['brand']}")
    if tc_data.get("price"): desc_parts.append(f"Price: {tc_data['price']}")
    if tc_data.get("condition"): desc_parts.append(f"Condition: {tc_data['condition']}")
    if tc_data.get("category"): desc_parts.append(f"Category: {tc_data['category']}")
    if tc_data.get("description"): desc_parts.append(f"Description: {tc_data['description']}")
    if tc_data.get("specifications"): 
        specs = ", ".join(f"{k}: {v}" for k, v in tc_data["specifications"].items())
        desc_parts.append(f"Specifications: {specs}")
    
    raw_description = "\n".join(desc_parts)
    platform = tc_data.get("target_platform", "olx")

    fields = {
        "raw_description": raw_description,
        "platform": platform
    }
    
    files = []
    images = tc_data.get("images", [])
    if images:
        for img_rel_path in images:
            img_path = tc_dir / img_rel_path
            if img_path.exists():
                mime_type, _ = mimetypes.guess_type(str(img_path))
                mime_type = mime_type or 'application/octet-stream'
                with open(img_path, "rb") as f:
                    files.append(("images", img_path.name, f.read(), mime_type))

    success, latency_ms, resp_data, error_msg = send_http_post_multipart(url, fields, files)

    result = {
        "experiment_id": exp_id,
        "test_case_id": tc_id,
        "system": "verion",
        "timestamp": datetime.now().isoformat(),
        "success": success and (resp_data.get("status") == "success" if resp_data else False),
        "latency_ms": latency_ms,
        "model": "multi-agent",
        "raw_output": resp_data,
        "complete_response": resp_data,
        "token_usage": resp_data.get("token_usage") if resp_data else None, # Might not be directly exposed in Verion's current response
        "estimated_cost": resp_data.get("estimated_cost") if resp_data else None,
        "cache_hit": resp_data.get("cache_hit") if resp_data else None,
        "error": error_msg or (resp_data.get("message") if resp_data and resp_data.get("status") != "success" else None),
        "capability_metadata": {
            "image_processing_supported": True,
            "privacy_anonymization": True,
            "rag_context": True,
            "multi_agent_workflow": True
        }
    }
    return result

def run_experiment(baseline_url: str = DEFAULT_BASELINE_URL, verion_url: str = DEFAULT_VERION_URL):
    """Main experiment runner execution."""
    test_cases = load_test_cases(TEST_CASES_DIR)

    if not test_cases:
        print("No evaluation test cases found in evaluation/test_cases/. Add test cases before running the experiment.")
        return

    exp_id = f"EXP_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    print(f"Starting Experiment ID: {exp_id} with {len(test_cases)} test case(s)...")

    # Prepare result output directories
    exp_baseline_dir = BASELINE_RESULTS_DIR / exp_id
    exp_verion_dir = VERION_RESULTS_DIR / exp_id
    exp_baseline_dir.mkdir(parents=True, exist_ok=True)
    exp_verion_dir.mkdir(parents=True, exist_ok=True)

    # Save experiment metadata
    exp_metadata = {
        "experiment_id": exp_id,
        "timestamp": datetime.now().isoformat(),
        "total_test_cases": len(test_cases),
        "baseline_url": baseline_url,
        "verion_url": verion_url,
        "test_case_ids": list(test_cases.keys())
    }

    with open(exp_baseline_dir / "experiment_metadata.json", "w", encoding="utf-8") as f:
        json.dump(exp_metadata, f, indent=2)
    with open(exp_verion_dir / "experiment_metadata.json", "w", encoding="utf-8") as f:
        json.dump(exp_metadata, f, indent=2)

    for tc_id, tc_info in test_cases.items():
        print(f"\nProcessing Test Case: {tc_id}...")
        
        # 1. Run Baseline
        print(f"  -> Sending {tc_id} to Baseline ({baseline_url})...")
        baseline_res = run_baseline_case(tc_id, tc_info["data"], baseline_url, exp_id)
        with open(exp_baseline_dir / f"{tc_id}.json", "w", encoding="utf-8") as f:
            json.dump(baseline_res, f, indent=2)
        print(f"     Baseline Status: {baseline_res['success']} | Latency: {baseline_res['latency_ms']} ms")

        # 2. Run Verion AI
        print(f"  -> Sending {tc_id} to Verion AI ({verion_url})...")
        verion_res = run_verion_case(tc_id, tc_info["data"], tc_info["dir"], verion_url, exp_id)
        with open(exp_verion_dir / f"{tc_id}.json", "w", encoding="utf-8") as f:
            json.dump(verion_res, f, indent=2)
        print(f"     Verion Status: {verion_res['success']} | Latency: {verion_res['latency_ms']} ms")

    print(f"\nExperiment {exp_id} completed successfully!")
    print(f"Baseline raw results saved to: {exp_baseline_dir}")
    print(f"Verion raw results saved to: {exp_verion_dir}")

def main():
    parser = argparse.ArgumentParser(description="Run evaluation experiment across Baseline and Verion AI.")
    parser.add_argument("--baseline-url", type=str, default=DEFAULT_BASELINE_URL, help="Baseline API URL")
    parser.add_argument("--verion-url", type=str, default=DEFAULT_VERION_URL, help="Verion API URL")
    args = parser.parse_args()

    run_experiment(args.baseline_url, args.verion_url)

if __name__ == "__main__":
    main()
