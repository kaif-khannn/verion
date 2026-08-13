#!/usr/bin/env python3
"""
Test Case Validator

Validates the structure, fields, JSON schema, and image paths of test cases inside evaluation/test_cases/.
Exits gracefully with an informative message if no test cases are present.
"""

import sys
import json
import argparse
from pathlib import Path
from typing import List, Dict, Any, Tuple

# Base Evaluation Path
SCRIPT_DIR = Path(__file__).resolve().parent
EVALUATION_DIR = SCRIPT_DIR.parent
TEST_CASES_DIR = EVALUATION_DIR / "test_cases"

REQUIRED_FIELDS = {
    "test_case_id": str,
    "product_name": str,
}

OPTIONAL_FIELDS = {
    "brand": (str, type(None)),
    "description": (str, type(None)),
    "specifications": (dict, type(None)),
    "price": (str, type(None)),
    "condition": (str, type(None)),
    "target_platform": (str, type(None)),
    "images": (list, type(None)),
    "category": (str, type(None)),
    "metadata": (dict, type(None)),
    "expected_facts": (dict, type(None)),
    "visual_facts": (list, type(None)),
    "pii": (dict, bool, type(None)),
    "expected_checks": (dict, type(None)),
}

def discover_test_cases(base_dir: Path) -> List[Path]:
    """Find all subdirectories containing an input.json file."""
    test_case_dirs = []
    if not base_dir.exists():
        return test_case_dirs

    for item in base_dir.iterdir():
        if item.is_dir() and (item / "input.json").exists():
            test_case_dirs.append(item)
    
    return sorted(test_case_dirs)

def validate_single_test_case(tc_dir: Path) -> Tuple[bool, List[str], Dict[str, Any]]:
    """Validate a single test case directory and its input.json."""
    errors = []
    input_file = tc_dir / "input.json"
    data = {}

    if not input_file.exists():
        errors.append(f"[{tc_dir.name}] Missing input.json file.")
        return False, errors, data

    try:
        with open(input_file, "r", encoding="utf-8") as f:
            data = json.load(f)
    except json.JSONDecodeError as e:
        errors.append(f"[{tc_dir.name}] Malformed JSON in input.json: {e}")
        return False, errors, data
    except Exception as e:
        errors.append(f"[{tc_dir.name}] Unable to read input.json: {e}")
        return False, errors, data

    # Check required fields
    for field, expected_type in REQUIRED_FIELDS.items():
        if field not in data:
            errors.append(f"[{tc_dir.name}] Missing required field '{field}'.")
        elif not isinstance(data[field], expected_type):
            errors.append(f"[{tc_dir.name}] Field '{field}' must be of type {expected_type.__name__}, got {type(data[field]).__name__}.")

    # Check optional fields
    for field, expected_types in OPTIONAL_FIELDS.items():
        if field in data and data[field] is not None:
            if not isinstance(data[field], expected_types):
                errors.append(f"[{tc_dir.name}] Field '{field}' has invalid type {type(data[field]).__name__}.")

    # Validate image paths if specified
    if "images" in data and isinstance(data["images"], list):
        for img_rel_path in data["images"]:
            img_full_path = tc_dir / img_rel_path
            if not img_full_path.exists():
                errors.append(f"[{tc_dir.name}] Referenced image file does not exist: {img_rel_path}")

    is_valid = len(errors) == 0
    return is_valid, errors, data

def validate_all_test_cases(test_cases_dir: Path = TEST_CASES_DIR) -> bool:
    """Validate all discovered test cases."""
    tc_dirs = discover_test_cases(test_cases_dir)

    if not tc_dirs:
        print("No evaluation test cases found. Add test cases before running the experiment.")
        return True

    print(f"Discovered {len(tc_dirs)} test case(s) in {test_cases_dir}...")
    seen_ids = set()
    all_valid = True
    total_errors = []

    for tc_dir in tc_dirs:
        is_valid, errors, data = validate_single_test_case(tc_dir)
        if not is_valid:
            all_valid = False
            total_errors.extend(errors)
            continue

        tc_id = data.get("test_case_id")
        if tc_id in seen_ids:
            all_valid = False
            total_errors.append(f"[{tc_dir.name}] Duplicate test_case_id found: '{tc_id}'. IDs must be unique.")
        else:
            seen_ids.add(tc_id)

    if all_valid:
        print(f"SUCCESS: All {len(tc_dirs)} test case(s) passed validation cleanly.")
        return True
    else:
        print(f"FAILED: Found {len(total_errors)} validation error(s):")
        for err in total_errors:
            print(f"  - {err}")
        return False

def main():
    parser = argparse.ArgumentParser(description="Validate evaluation test cases.")
    parser.add_argument("--test-cases-dir", type=str, default=str(TEST_CASES_DIR), help="Path to test cases directory")
    args = parser.parse_args()

    tc_dir = Path(args.test_cases_dir)
    success = validate_all_test_cases(tc_dir)
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
