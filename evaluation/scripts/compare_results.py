#!/usr/bin/env python3
"""
Results Comparator

Compares Baseline vs Verion AI metrics for an experiment.
Respects metric direction (higher is better vs lower is better).
Outputs comparison data to evaluation/comparison/ as JSON and CSV files.
Handles missing metrics files gracefully.
"""

import sys
import os
import json
import csv
import argparse
from pathlib import Path
from typing import Dict, Any, Optional

# Base Evaluation Path
SCRIPT_DIR = Path(__file__).resolve().parent
EVALUATION_DIR = SCRIPT_DIR.parent
METRICS_DIR = EVALUATION_DIR / "metrics"
COMPARISON_DIR = EVALUATION_DIR / "comparison"

METRIC_DIRECTIONS = {
    "success_rate_pct": "higher_is_better",
    "failure_rate_pct": "lower_is_better",
    "avg_latency_ms": "lower_is_better",
    "median_latency_ms": "lower_is_better",
    "p95_latency_ms": "lower_is_better",
    "overall_completeness_pct": "higher_is_better",
    "information_coverage_pct": "higher_is_better",
    "specification_accuracy_pct": "higher_is_better",
    "unsupported_claim_rate_pct": "lower_is_better",
    "visual_attribute_recall_pct": "higher_is_better",
    "pii_protection_rate_pct": "higher_is_better",
    "pii_leakage_rate_pct": "lower_is_better"
}

def find_latest_metrics_file() -> Optional[Path]:
    """Find the latest metrics JSON file in evaluation/metrics/."""
    if not METRICS_DIR.exists():
        return None
    metric_files = sorted([f for f in METRICS_DIR.glob("*_metrics.json")])
    if not metric_files:
        return None
    return metric_files[-1]

def calculate_metric_delta(baseline_val: float, verion_val: float, direction: str) -> Dict[str, Any]:
    """Calculate absolute difference and directional percentage improvement."""
    abs_diff = round(verion_val - baseline_val, 2)
    
    if baseline_val == 0:
        rel_improvement_pct = 0.0
    else:
        if direction == "higher_is_better":
            rel_improvement_pct = round(((verion_val - baseline_val) / abs(baseline_val)) * 100, 2)
        elif direction == "lower_is_better":
            rel_improvement_pct = round(((baseline_val - verion_val) / abs(baseline_val)) * 100, 2)
        else:
            rel_improvement_pct = 0.0

    return {
        "baseline_value": baseline_val,
        "verion_value": verion_val,
        "absolute_difference": abs_diff,
        "directional_improvement_pct": rel_improvement_pct,
        "direction": direction
    }

def run_comparison(exp_id: Optional[str] = None):
    """Execute results comparison."""
    if exp_id:
        metrics_file = METRICS_DIR / f"{exp_id}_metrics.json"
    else:
        metrics_file = find_latest_metrics_file()

    if not metrics_file or not metrics_file.exists():
        print("No metrics files found in evaluation/metrics/. Calculate metrics using calculate_metrics.py first.")
        return

    print(f"Comparing results from metrics file: {metrics_file.name}...")

    with open(metrics_file, "r", encoding="utf-8") as f:
        metrics_data = json.load(f)

    exp_id = metrics_data.get("experiment_id", metrics_file.stem.replace("_metrics", ""))
    baseline_m = metrics_data.get("baseline", {})
    verion_m = metrics_data.get("verion", {})

    comparison_results = {
        "experiment_id": exp_id,
        "metrics_source": metrics_file.name,
        "comparisons": {}
    }

    # 1. Reliability Comparison
    b_rel = baseline_m.get("reliability", {})
    v_rel = verion_m.get("reliability", {})
    comparison_results["comparisons"]["success_rate_pct"] = calculate_metric_delta(
        b_rel.get("success_rate_pct", 0.0), v_rel.get("success_rate_pct", 0.0), "higher_is_better"
    )

    # 2. Performance Comparison
    b_perf = baseline_m.get("performance", {})
    v_perf = verion_m.get("performance", {})
    comparison_results["comparisons"]["avg_latency_ms"] = calculate_metric_delta(
        b_perf.get("avg_latency_ms", 0.0), v_perf.get("avg_latency_ms", 0.0), "lower_is_better"
    )
    comparison_results["comparisons"]["p95_latency_ms"] = calculate_metric_delta(
        b_perf.get("p95_latency_ms", 0.0), v_perf.get("p95_latency_ms", 0.0), "lower_is_better"
    )

    # 3. Content Completeness Comparison
    b_comp = baseline_m.get("content_completeness", {})
    v_comp = verion_m.get("content_completeness", {})
    comparison_results["comparisons"]["overall_completeness_pct"] = calculate_metric_delta(
        b_comp.get("overall_completeness_pct", 0.0), v_comp.get("overall_completeness_pct", 0.0), METRIC_DIRECTIONS["overall_completeness_pct"]
    )
    comparison_results["comparisons"]["information_coverage_pct"] = calculate_metric_delta(
        b_comp.get("information_coverage_pct", 0.0), v_comp.get("information_coverage_pct", 0.0), METRIC_DIRECTIONS["information_coverage_pct"]
    )
    comparison_results["comparisons"]["specification_accuracy_pct"] = calculate_metric_delta(
        b_comp.get("specification_accuracy_pct", 0.0), v_comp.get("specification_accuracy_pct", 0.0), METRIC_DIRECTIONS["specification_accuracy_pct"]
    )
    comparison_results["comparisons"]["unsupported_claim_rate_pct"] = calculate_metric_delta(
        b_comp.get("unsupported_claim_rate_pct", 0.0), v_comp.get("unsupported_claim_rate_pct", 0.0), METRIC_DIRECTIONS["unsupported_claim_rate_pct"]
    )
    comparison_results["comparisons"]["visual_attribute_recall_pct"] = calculate_metric_delta(
        b_comp.get("visual_attribute_recall_pct", 0.0), v_comp.get("visual_attribute_recall_pct", 0.0), METRIC_DIRECTIONS["visual_attribute_recall_pct"]
    )

    # 4. Privacy Comparison
    b_priv = baseline_m.get("privacy", {})
    v_priv = verion_m.get("privacy", {})
    comparison_results["comparisons"]["pii_protection_rate_pct"] = calculate_metric_delta(
        b_priv.get("pii_protection_rate_pct", 0.0), v_priv.get("pii_protection_rate_pct", 0.0), METRIC_DIRECTIONS["pii_protection_rate_pct"]
    )
    comparison_results["comparisons"]["pii_leakage_rate_pct"] = calculate_metric_delta(
        b_priv.get("pii_leakage_rate_pct", 0.0), v_priv.get("pii_leakage_rate_pct", 0.0), METRIC_DIRECTIONS["pii_leakage_rate_pct"]
    )

    COMPARISON_DIR.mkdir(parents=True, exist_ok=True)
    json_out = COMPARISON_DIR / f"{exp_id}_comparison.json"
    csv_out = COMPARISON_DIR / f"{exp_id}_comparison.csv"

    with open(json_out, "w", encoding="utf-8") as f:
        json.dump(comparison_results, f, indent=2)

    with open(csv_out, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["Metric", "Baseline", "Verion AI", "Abs Difference", "Improvement (%)", "Metric Goal"])
        for metric_name, comp_data in comparison_results["comparisons"].items():
            writer.writerow([
                metric_name,
                comp_data["baseline_value"],
                comp_data["verion_value"],
                comp_data["absolute_difference"],
                f"{comp_data['directional_improvement_pct']}%",
                comp_data["direction"]
            ])

    print(f"Comparison data saved cleanly to:\n  - {json_out}\n  - {csv_out}")

def main():
    parser = argparse.ArgumentParser(description="Compare Baseline vs Verion metrics.")
    parser.add_argument("--experiment-id", type=str, default=None, help="Experiment ID to process")
    args = parser.parse_args()

    run_comparison(args.experiment_id)

if __name__ == "__main__":
    main()
