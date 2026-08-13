#!/usr/bin/env python3
"""
Chart Visualizer

Generates graphical charts comparing Baseline vs Verion AI metrics.
Saves rendered image charts in evaluation/comparison/charts/.
Executes ONLY when real comparison data exists.
"""

import sys
import os
import json
import argparse
from pathlib import Path
from typing import Dict, Any, Optional

# Base Evaluation Path
SCRIPT_DIR = Path(__file__).resolve().parent
EVALUATION_DIR = SCRIPT_DIR.parent
COMPARISON_DIR = EVALUATION_DIR / "comparison"
CHARTS_DIR = COMPARISON_DIR / "charts"

def find_latest_comparison_file() -> Optional[Path]:
    """Find the latest comparison JSON file."""
    if not COMPARISON_DIR.exists():
        return None
    comp_files = sorted([f for f in COMPARISON_DIR.glob("*_comparison.json")])
    if not comp_files:
        return None
    return comp_files[-1]

def generate_charts(exp_id: Optional[str] = None):
    """Generate visual comparison charts."""
    if exp_id:
        comp_file = COMPARISON_DIR / f"{exp_id}_comparison.json"
    else:
        comp_file = find_latest_comparison_file()

    if not comp_file or not comp_file.exists():
        print("No comparison data found in evaluation/comparison/. Run compare_results.py first.")
        return

    print(f"Generating charts for comparison file: {comp_file.name}...")

    with open(comp_file, "r", encoding="utf-8") as f:
        comp_data = json.load(f)

    exp_id = comp_data.get("experiment_id", comp_file.stem.replace("_comparison", ""))
    comparisons = comp_data.get("comparisons", {})

    if not comparisons:
        print("No comparison metrics found to visualize.")
        return

    try:
        import matplotlib
        matplotlib.use("Agg") # Non-interactive backend
        import matplotlib.pyplot as plt
    except ImportError:
        print("Warning: 'matplotlib' library is not installed. Skipping graphical PNG chart generation.")
        print("Comparison summary:")
        for metric, data in comparisons.items():
            print(f"  - {metric}: Baseline={data['baseline_value']}, Verion={data['verion_value']} (Diff: {data['absolute_difference']})")
        return

    CHARTS_DIR.mkdir(parents=True, exist_ok=True)

    # 1. Metric Overview Bar Chart
    metrics_to_plot = ["success_rate_pct", "overall_completeness_pct", "pii_protection_rate_pct"]
    labels = []
    baseline_vals = []
    verion_vals = []

    for m in metrics_to_plot:
        if m in comparisons:
            labels.append(m.replace("_pct", "").replace("_", " ").title())
            baseline_vals.append(comparisons[m]["baseline_value"])
            verion_vals.append(comparisons[m]["verion_value"])

    if labels:
        x = range(len(labels))
        width = 0.35

        fig, ax = plt.subplots(figsize=(10, 6))
        rects1 = ax.bar([i - width/2 for i in x], baseline_vals, width, label='Baseline', color='#7f8c8d')
        rects2 = ax.bar([i + width/2 for i in x], verion_vals, width, label='Verion AI', color='#2ecc71')

        ax.set_ylabel('Score / Rate (%)')
        ax.set_title(f'Quality & Reliability Comparison ({exp_id})')
        ax.set_xticks(list(x))
        ax.set_xticklabels(labels)
        ax.set_ylim(0, 110)
        ax.legend()

        ax.bar_label(rects1, padding=3, fmt='%.1f')
        ax.bar_label(rects2, padding=3, fmt='%.1f')

        chart_path = CHARTS_DIR / f"{exp_id}_quality_overview.png"
        plt.tight_layout()
        plt.savefig(chart_path, dpi=300)
        plt.close()
        print(f"Saved overview chart to: {chart_path}")

    # 2. Latency Comparison Chart
    if "avg_latency_ms" in comparisons:
        fig, ax = plt.subplots(figsize=(8, 5))
        lat_data = comparisons["avg_latency_ms"]
        systems = ['Baseline', 'Verion AI']
        latencies = [lat_data["baseline_value"], lat_data["verion_value"]]

        bars = ax.bar(systems, latencies, color=['#3498db', '#e74c3c'], width=0.5)
        ax.set_ylabel('Average End-to-End Latency (ms)')
        ax.set_title(f'Average Latency Comparison ({exp_id})')
        ax.bar_label(bars, padding=3, fmt='%.1f ms')

        chart_path = CHARTS_DIR / f"{exp_id}_latency_comparison.png"
        plt.tight_layout()
        plt.savefig(chart_path, dpi=300)
        plt.close()
        print(f"Saved latency chart to: {chart_path}")

    print("Chart generation completed cleanly.")

def main():
    parser = argparse.ArgumentParser(description="Generate charts from comparison metrics.")
    parser.add_argument("--experiment-id", type=str, default=None, help="Experiment ID to visualize")
    args = parser.parse_args()

    generate_charts(args.experiment_id)

if __name__ == "__main__":
    main()
