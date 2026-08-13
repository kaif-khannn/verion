#!/usr/bin/env python3
"""
Metrics Calculator

Calculates evaluation metrics from raw result files in evaluation/baseline_results/ and evaluation/verion_results/.
Outputs computed metrics to evaluation/metrics/ as JSON and CSV files.
Handles empty result directories gracefully.
"""

import sys
import os
import re
import json
import csv
import argparse
from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple

# Base Evaluation Path
SCRIPT_DIR = Path(__file__).resolve().parent
EVALUATION_DIR = SCRIPT_DIR.parent
TEST_CASES_DIR = EVALUATION_DIR / "test_cases"
BASELINE_RESULTS_DIR = EVALUATION_DIR / "baseline_results"
VERION_RESULTS_DIR = EVALUATION_DIR / "verion_results"
METRICS_DIR = EVALUATION_DIR / "metrics"

COMPONENTS_TO_CHECK = [
    "title",
    "short_description",
    "key_features",
    "detailed_description",
    "specifications",
    "seo_keywords"
]

def find_latest_experiment_id() -> Optional[str]:
    """Discover the latest EXP_... directory."""
    exp_ids = set()
    for d in [BASELINE_RESULTS_DIR, VERION_RESULTS_DIR]:
        if d.exists():
            for item in d.iterdir():
                if item.is_dir() and item.name.startswith("EXP_"):
                    exp_ids.add(item.name)
    if not exp_ids:
        return None
    return sorted(list(exp_ids))[-1]

def load_system_results(results_dir: Path, exp_id: str) -> Dict[str, Dict[str, Any]]:
    """Load all test case result JSON files for a system and experiment."""
    tc_results = {}
    exp_dir = results_dir / exp_id
    if not exp_dir.exists():
        return tc_results

    for item in sorted(exp_dir.iterdir()):
        if item.name.endswith(".json") and item.name != "experiment_metadata.json":
            tc_id = item.stem
            try:
                with open(item, "r", encoding="utf-8") as f:
                    tc_results[tc_id] = json.load(f)
            except Exception as e:
                print(f"Warning: Could not read {item}: {e}")
    return tc_results

def compute_percentiles(values: List[float], percentile: float) -> float:
    """Calculate percentile value from a list of numbers."""
    if not values:
        return 0.0
    sorted_vals = sorted(values)
    k = (len(sorted_vals) - 1) * (percentile / 100.0)
    f = int(k)
    c = f + 1
    if c >= len(sorted_vals):
        return round(sorted_vals[-1], 2)
    d0 = sorted_vals[f] * (c - k)
    d1 = sorted_vals[c] * (k - f)
    return round(d0 + d1, 2)

def evaluate_completeness(output_text: Optional[str]) -> Dict[str, bool]:
    """Check for the presence of key e-commerce components in text or structured output."""
    presence = {comp: False for comp in COMPONENTS_TO_CHECK}
    if not output_text:
        return presence

    text_lower = output_text.lower()
    
    # Title
    if "title" in text_lower or len(output_text) > 10:
        presence["title"] = True
    # Short description
    if "short description" in text_lower or "summary" in text_lower or "overview" in text_lower or len(output_text) > 50:
        presence["short_description"] = True
    # Key features
    if "feature" in text_lower or "bullet" in text_lower or "highlight" in text_lower or "-" in text_lower or "•" in text_lower:
        presence["key_features"] = True
    # Detailed description
    if "detailed description" in text_lower or "description" in text_lower or len(output_text) > 150:
        presence["detailed_description"] = True
    # Specifications
    if "specification" in text_lower or "spec" in text_lower or ":" in text_lower:
        presence["specifications"] = True
    # SEO keywords
    if "seo" in text_lower or "keyword" in text_lower or "tag" in text_lower:
        presence["seo_keywords"] = True

    return presence

def evaluate_pii_protection(output_text: Optional[str], test_case_input: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    """Check whether PII present in test case input appears in the output text."""
    if not output_text or not test_case_input:
        return {"exposed_pii_count": 0, "protected_pii_count": 0, "pii_protection_rate_pct": 100.0}

    input_text = json.dumps(test_case_input).lower()
    
    # Simple regex for PII patterns in test input
    email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
    phone_pattern = r'\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b'

    emails_in_input = set(re.findall(email_pattern, input_text))
    phones_in_input = set(re.findall(phone_pattern, input_text))

    pii_items = emails_in_input.union(phones_in_input)

    if not pii_items:
        return {"exposed_pii_count": 0, "protected_pii_count": 0, "pii_protection_rate_pct": 100.0}

    output_lower = output_text.lower()
    exposed = 0
    protected = 0

    for pii in pii_items:
        if pii in output_lower:
            exposed += 1
        else:
            protected += 1

    protection_rate = round((protected / len(pii_items)) * 100, 2)
    return {
        "exposed_pii_count": exposed,
        "protected_pii_count": protected,
        "pii_protection_rate_pct": protection_rate
    }

def clean_fact_value(value: str) -> str:
    """Clean fact values by removing common annotations like (probable)."""
    val = value.lower()
    val = re.sub(r'\(probable\)', '', val)
    val = re.sub(r'\(conflicting\)', '', val)
    return val.strip()

def calculate_information_coverage(output_text: str, expected_facts: dict) -> float:
    """Calculate the percentage of expected facts present in the output text."""
    if not expected_facts:
        return 100.0
    output_lower = (output_text or "").lower()
    matched = 0
    for k, v in expected_facts.items():
        if isinstance(v, list):
            v_str = " ".join(v)
        else:
            v_str = str(v)
        cleaned_val = clean_fact_value(v_str)
        # Check if any significant word of the fact is present
        words = [w for w in cleaned_val.split() if len(w) > 2]
        if not words:
            if cleaned_val in output_lower:
                matched += 1
            continue
        if any(w in output_lower for w in words):
            matched += 1
            
    return round((matched / len(expected_facts)) * 100, 2)

def calculate_specification_accuracy(output_text: str, expected_facts: dict) -> float:
    """Calculate accuracy of extracted facts."""
    # Approximate implementation: if fact is covered, is it accurate?
    # Simple logic: assume if the expected fact words are in output, they are accurate.
    # In a full system, we would check for contradictions. Here, we proxy with coverage.
    if not expected_facts:
        return 100.0
    return calculate_information_coverage(output_text, expected_facts)

def calculate_hallucination_rate(output_text: str, expected_facts: dict, visual_facts: list) -> float:
    """Calculate rate of unsupported claims. 
    A real implementation requires NLP. Here we return 0.0 as a baseline unless known false keywords appear."""
    if not output_text:
        return 0.0
    output_lower = output_text.lower()
    # Dummy hallucination detection: if it mentions specific features not in input
    hallucination_triggers = ["1tb", "4k display", "leather", "gold", "exclusive"]
    detected = sum(1 for t in hallucination_triggers if t in output_lower)
    return min(detected * 10.0, 100.0)

def evaluate_pii_v2(output_text: str, pii_data: dict, input_text: str) -> dict:
    """Evaluate PII using the v2 schema."""
    out_dict = {
        "detection_rate_pct": 100.0, # Assumed unless we check agent logs
        "leakage_rate_pct": 0.0,
        "removal_rate_pct": 100.0,
        "false_removal_rate_pct": 0.0,
        "exposed_pii_count": 0,
        "protected_pii_count": 0
    }
    if isinstance(pii_data, bool):
        is_present = pii_data
    elif isinstance(pii_data, dict):
        is_present = pii_data.get("present", False)
    else:
        is_present = False

    if not is_present:
        return out_dict

    output_lower = (output_text or "").lower()
    
    # Extract actual PII from input_text
    email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
    phone_pattern = r'\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b'

    emails_in_input = set(re.findall(email_pattern, input_text.lower()))
    phones_in_input = set(re.findall(phone_pattern, input_text.lower()))
    pii_items = emails_in_input.union(phones_in_input)

    if not pii_items:
        return out_dict

    exposed = 0
    protected = 0

    for pii in pii_items:
        if pii in output_lower:
            exposed += 1
        else:
            protected += 1
            
    out_dict["exposed_pii_count"] = exposed
    out_dict["protected_pii_count"] = protected
    out_dict["leakage_rate_pct"] = round((exposed / len(pii_items)) * 100, 2)
    out_dict["removal_rate_pct"] = round((protected / len(pii_items)) * 100, 2)
    
    return out_dict

def calculate_visual_attribute_recall(output_text: str, visual_facts: list) -> float:
    """Calculate recall of visual attributes in the output."""
    if not visual_facts:
        return 100.0
    output_lower = (output_text or "").lower()
    matched = 0
    for fact in visual_facts:
        cleaned_val = clean_fact_value(fact)
        words = [w for w in cleaned_val.split() if len(w) > 3]
        if not words:
            if cleaned_val in output_lower:
                matched += 1
            continue
        if any(w in output_lower for w in words):
            matched += 1
    return round((matched / len(visual_facts)) * 100, 2)

def calculate_system_metrics(system_name: str, results: Dict[str, Dict[str, Any]], test_cases: Dict[str, Dict[str, Any]]) -> Dict[str, Any]:
    """Calculate aggregated metrics for a single system."""
    total = len(results)
    if total == 0:
        return {}

    successful = [r for r in results.values() if r.get("success")]
    failed = [r for r in results.values() if not r.get("success")]

    success_rate = round((len(successful) / total) * 100, 2)
    failure_rate = round((len(failed) / total) * 100, 2)

    latencies = [r.get("latency_ms", 0.0) for r in results.values() if r.get("latency_ms") is not None]
    avg_latency = round(sum(latencies) / len(latencies), 2) if latencies else 0.0
    min_latency = round(min(latencies), 2) if latencies else 0.0
    max_latency = round(max(latencies), 2) if latencies else 0.0
    median_latency = compute_percentiles(latencies, 50)
    p95_latency = compute_percentiles(latencies, 95)

    # Component completeness & new metrics
    completeness_counts = {comp: 0 for comp in COMPONENTS_TO_CHECK}
    total_pii_exposed = 0
    total_pii_protected = 0
    
    info_coverage_list = []
    spec_accuracy_list = []
    hallucination_list = []
    visual_recall_list = []
    pii_leakage_list = []

    for tc_id, res in results.items():
        out_text = str(res.get("raw_output") or "")
        tc_data = test_cases.get(tc_id, {}).get("data", {})
        
        comp_presence = evaluate_completeness(out_text)
        for comp, present in comp_presence.items():
            if present:
                completeness_counts[comp] += 1

        # V2 Metrics
        expected_facts = tc_data.get("expected_facts", {})
        visual_facts = tc_data.get("visual_facts", [])
        pii_data = tc_data.get("pii", {"present": False, "fields": []})
        input_str = json.dumps(tc_data.get("product_input", {}))
        
        info_coverage_list.append(calculate_information_coverage(out_text, expected_facts))
        spec_accuracy_list.append(calculate_specification_accuracy(out_text, expected_facts))
        hallucination_list.append(calculate_hallucination_rate(out_text, expected_facts, visual_facts))
        visual_recall_list.append(calculate_visual_attribute_recall(out_text, visual_facts))
        
        pii_eval = evaluate_pii_v2(out_text, pii_data, input_str)
        is_pii_present = pii_data.get("present") if isinstance(pii_data, dict) else bool(pii_data)
        if is_pii_present:
            pii_leakage_list.append(pii_eval["leakage_rate_pct"])
            total_pii_exposed += pii_eval["exposed_pii_count"]
            total_pii_protected += pii_eval["protected_pii_count"]

    component_presence_rates = {
        comp: round((cnt / total) * 100, 2) for comp, cnt in completeness_counts.items()
    }
    overall_completeness_pct = round(sum(component_presence_rates.values()) / len(COMPONENTS_TO_CHECK), 2)

    total_pii_checked = total_pii_exposed + total_pii_protected
    pii_protection_rate = round((total_pii_protected / total_pii_checked) * 100, 2) if total_pii_checked > 0 else 100.0
    avg_pii_leakage = round(sum(pii_leakage_list) / len(pii_leakage_list), 2) if pii_leakage_list else 0.0

    avg_info_coverage = round(sum(info_coverage_list) / len(info_coverage_list), 2) if info_coverage_list else 0.0
    avg_spec_accuracy = round(sum(spec_accuracy_list) / len(spec_accuracy_list), 2) if spec_accuracy_list else 0.0
    avg_hallucination = round(sum(hallucination_list) / len(hallucination_list), 2) if hallucination_list else 0.0
    avg_visual_recall = round(sum(visual_recall_list) / len(visual_recall_list), 2) if visual_recall_list else 0.0

    per_case = {}
    for i, tc_id in enumerate(results.keys()):
        tc_data = test_cases.get(tc_id, {}).get("data", {})
        condition = tc_data.get("input_condition", "Unknown")
        per_case[tc_id] = {
            "condition": condition,
            "success": results[tc_id].get("success", False),
            "info_coverage": info_coverage_list[i] if i < len(info_coverage_list) else 0.0,
            "spec_accuracy": spec_accuracy_list[i] if i < len(spec_accuracy_list) else 0.0,
            "visual_recall": visual_recall_list[i] if i < len(visual_recall_list) else 0.0,
            "hallucination": hallucination_list[i] if i < len(hallucination_list) else 0.0
        }

    metrics = {
        "system": system_name,
        "per_case": per_case,
        "reliability": {
            "total_executions": total,
            "successful_executions": len(successful),
            "failed_executions": len(failed),
            "success_rate_pct": success_rate,
            "failure_rate_pct": failure_rate
        },
        "performance": {
            "avg_latency_ms": avg_latency,
            "median_latency_ms": median_latency,
            "min_latency_ms": min_latency,
            "max_latency_ms": max_latency,
            "p95_latency_ms": p95_latency
        },
        "content_completeness": {
            "overall_completeness_pct": overall_completeness_pct,
            "component_presence_rates_pct": component_presence_rates,
            "information_coverage_pct": avg_info_coverage,
            "specification_accuracy_pct": avg_spec_accuracy,
            "unsupported_claim_rate_pct": avg_hallucination,
            "visual_attribute_recall_pct": avg_visual_recall
        },
        "privacy": {
            "total_pii_checked": total_pii_checked,
            "exposed_pii_count": total_pii_exposed,
            "protected_pii_count": total_pii_protected,
            "pii_protection_rate_pct": pii_protection_rate,
            "pii_leakage_rate_pct": avg_pii_leakage
        },
        "cope_simulation_note": "COPE scores represent synthetic / estimated simulations, not actual ground-truth conversion or CTR."
    }
    return metrics

def run_metrics_calculation(exp_id: Optional[str] = None):
    """Execute metric calculation pipeline."""
    if not exp_id:
        exp_id = find_latest_experiment_id()

    if not exp_id:
        print("No experiment results found in evaluation/baseline_results/ or evaluation/verion_results/. Run an experiment using run_experiment.py first.")
        return

    print(f"Calculating metrics for Experiment ID: {exp_id}...")

    baseline_results = load_system_results(BASELINE_RESULTS_DIR, exp_id)
    verion_results = load_system_results(VERION_RESULTS_DIR, exp_id)

    if not baseline_results and not verion_results:
        print(f"No result JSON files found for experiment '{exp_id}'. Exiting.")
        return

    # Load test cases for reference facts & PII
    tc_inputs = {}
    if TEST_CASES_DIR.exists():
        for item in TEST_CASES_DIR.iterdir():
            input_file = item / "input.json"
            if item.is_dir() and input_file.exists():
                try:
                    with open(input_file, "r", encoding="utf-8") as f:
                        data = json.load(f)
                        tc_id = data.get("test_case_id", item.name)
                        tc_inputs[tc_id] = {"data": data}
                except Exception:
                    pass

    baseline_metrics = calculate_system_metrics("baseline", baseline_results, tc_inputs)
    verion_metrics = calculate_system_metrics("verion", verion_results, tc_inputs)

    combined_metrics = {
        "experiment_id": exp_id,
        "baseline": baseline_metrics,
        "verion": verion_metrics
    }

    METRICS_DIR.mkdir(parents=True, exist_ok=True)
    json_out_file = METRICS_DIR / f"{exp_id}_metrics.json"
    csv_out_file = METRICS_DIR / f"{exp_id}_metrics.csv"

    with open(json_out_file, "w", encoding="utf-8") as f:
        json.dump(combined_metrics, f, indent=2)

    # Write CSV summary
    with open(csv_out_file, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["Metric", "Baseline", "Verion AI"])
        
        b_rel = baseline_metrics.get("reliability", {})
        v_rel = verion_metrics.get("reliability", {})
        writer.writerow(["Success Rate (%)", b_rel.get("success_rate_pct", "N/A"), v_rel.get("success_rate_pct", "N/A")])

        b_perf = baseline_metrics.get("performance", {})
        v_perf = verion_metrics.get("performance", {})
        writer.writerow(["Average Latency (ms)", b_perf.get("avg_latency_ms", "N/A"), v_perf.get("avg_latency_ms", "N/A")])
        writer.writerow(["P95 Latency (ms)", b_perf.get("p95_latency_ms", "N/A"), v_perf.get("p95_latency_ms", "N/A")])

        b_comp = baseline_metrics.get("content_completeness", {})
        v_comp = verion_metrics.get("content_completeness", {})
        writer.writerow(["Overall Completeness (%)", b_comp.get("overall_completeness_pct", "N/A"), v_comp.get("overall_completeness_pct", "N/A")])
        writer.writerow(["Information Coverage (%)", b_comp.get("information_coverage_pct", "N/A"), v_comp.get("information_coverage_pct", "N/A")])
        writer.writerow(["Specification Accuracy (%)", b_comp.get("specification_accuracy_pct", "N/A"), v_comp.get("specification_accuracy_pct", "N/A")])
        writer.writerow(["Unsupported Claim Rate (%)", b_comp.get("unsupported_claim_rate_pct", "N/A"), v_comp.get("unsupported_claim_rate_pct", "N/A")])
        writer.writerow(["Visual Attribute Recall (%)", b_comp.get("visual_attribute_recall_pct", "N/A"), v_comp.get("visual_attribute_recall_pct", "N/A")])

        b_priv = baseline_metrics.get("privacy", {})
        v_priv = verion_metrics.get("privacy", {})
        writer.writerow(["PII Leakage Rate (%)", b_priv.get("pii_leakage_rate_pct", "N/A"), v_priv.get("pii_leakage_rate_pct", "N/A")])

    print(f"Metrics saved cleanly to:\n  - {json_out_file}\n  - {csv_out_file}")

def main():
    parser = argparse.ArgumentParser(description="Calculate metrics from raw experiment results.")
    parser.add_argument("--experiment-id", type=str, default=None, help="Experiment ID to process (e.g., EXP_20260813_120000)")
    args = parser.parse_args()

    run_metrics_calculation(args.experiment_id)

if __name__ == "__main__":
    main()
