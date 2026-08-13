#!/usr/bin/env python3
"""
Report Generator

Compiles quantitative evaluation data, metrics, and comparisons into a formal Markdown evaluation report.
Executes ONLY when real experimental evaluation data exists.
Outputs report files to evaluation/reports/.
"""

import sys
import os
import json
import argparse
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Optional

# Base Evaluation Path
SCRIPT_DIR = Path(__file__).resolve().parent
EVALUATION_DIR = SCRIPT_DIR.parent
METRICS_DIR = EVALUATION_DIR / "metrics"
COMPARISON_DIR = EVALUATION_DIR / "comparison"
REPORTS_DIR = EVALUATION_DIR / "reports"

def find_latest_comparison_file() -> Optional[Path]:
    """Find the latest comparison file."""
    if not COMPARISON_DIR.exists():
        return None
    comp_files = sorted([f for f in COMPARISON_DIR.glob("*_comparison.json")])
    if not comp_files:
        return None
    return comp_files[-1]

def generate_report(exp_id: Optional[str] = None):
    """Generate final Markdown evaluation report from actual results."""
    if exp_id:
        comp_file = COMPARISON_DIR / f"{exp_id}_comparison.json"
        metrics_file = METRICS_DIR / f"{exp_id}_metrics.json"
    else:
        comp_file = find_latest_comparison_file()
        if comp_file:
            exp_id = comp_file.stem.replace("_comparison", "")
            metrics_file = METRICS_DIR / f"{exp_id}_metrics.json"
        else:
            metrics_file = None

    if not comp_file or not comp_file.exists() or not metrics_file or not metrics_file.exists():
        print("No evaluation data found. Complete an evaluation experiment first before generating a report.")
        return

    print(f"Generating evaluation report for Experiment ID: {exp_id}...")

    with open(comp_file, "r", encoding="utf-8") as f:
        comp_data = json.load(f)

    with open(metrics_file, "r", encoding="utf-8") as f:
        metrics_data = json.load(f)

    baseline_m = metrics_data.get("baseline", {})
    verion_m = metrics_data.get("verion", {})
    comparisons = comp_data.get("comparisons", {})

    report_lines = []
    report_lines.append(f"# Verion AI vs. Single-LLM Baseline: Experimental Evaluation Report")
    report_lines.append(f"**Experiment ID:** `{exp_id}`  ")
    report_lines.append(f"**Report Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}  \n")
    report_lines.append("---")

    report_lines.append("## 1. Executive Summary")
    report_lines.append("This document provides an objective, quantitative experimental evaluation comparing the Verion AI multi-agent platform against a conventional single-LLM baseline system.")
    report_lines.append("")

    report_lines.append("## 2. Project / Evaluation Objective")
    report_lines.append("The objective is to measure the quantitative and qualitative performance differences between an end-to-end multi-agent e-commerce content generation architecture (Verion AI) and a standard single-LLM generation solution.")
    report_lines.append("")

    report_lines.append("## 3. Research Question")
    report_lines.append("> *What measurable benefits in content completeness, specification consistency, privacy protection, and reliability does Verion AI's multi-agent architecture provide over a conventional single-LLM approach, and what are the associated latency/performance trade-offs?*")
    report_lines.append("")

    report_lines.append("## 4. Baseline Description")
    report_lines.append("- Architecture: Conventional Single-LLM (Fixed Prompt + Single API Call)")
    report_lines.append("- Primary Model: Groq `llama-3.1-8b-instant`")
    report_lines.append("- Scope: Converts seller text input into a standard product listing without additional agents, RAG, or image processing.")
    report_lines.append("")

    report_lines.append("## 5. Verion AI Description")
    report_lines.append("- Architecture: Specialized Multi-Agent Platform (PrivacyAgent, VisionAgent, RAGAgent, ContentGenerationAgent, COPE Engine, QualityAgent)")
    report_lines.append("- Scope: Full end-to-end multimodal e-commerce content generation pipeline with privacy anonymization, vector context retrieval, vision analysis, marketing variant scoring, and validation loops.")
    report_lines.append("")

    report_lines.append("## 6. Experimental Setup")
    report_lines.append("- Test Dataset: Identical controlled test cases provided to both systems.")
    report_lines.append("- Execution: External HTTP API calls executed via `run_experiment.py`.")
    report_lines.append("")

    report_lines.append("## 7. Metrics Definitions")
    report_lines.append("- **Success Rate (%)**: Percentage of requests completed without runtime error.")
    report_lines.append("- **Average Latency (ms)**: End-to-end execution time per request.")
    report_lines.append("- **Content Completeness (%)**: Presence of required listing components (Title, Short Description, Features, Detailed Description, Specs, SEO Keywords).")
    report_lines.append("- **PII Protection Rate (%)**: Percentage of sensitive input PII scrubbed from output.")
    report_lines.append("")

    report_lines.append("## 8. Quantitative Results")
    report_lines.append("| Metric | Baseline | Verion AI | Absolute Delta | Directional Improvement |")
    report_lines.append("| :--- | :---: | :---: | :---: | :---: |")

    for metric_key, c_info in comparisons.items():
        m_name = metric_key.replace("_pct", "").replace("_", " ").title()
        report_lines.append(
            f"| **{m_name}** | {c_info['baseline_value']} | {c_info['verion_value']} | {c_info['absolute_difference']} | {c_info['directional_improvement_pct']}% |"
        )
    report_lines.append("")

    report_lines.append("## 9. Performance & Latency Trade-offs")
    b_lat = comparisons.get("avg_latency_ms", {}).get("baseline_value", "N/A")
    v_lat = comparisons.get("avg_latency_ms", {}).get("verion_value", "N/A")
    report_lines.append(f"- Baseline Average Latency: `{b_lat} ms`")
    report_lines.append(f"- Verion AI Average Latency: `{v_lat} ms`")
    report_lines.append("Multi-agent pipelines incur higher latency due to multi-step agent reasoning, privacy scanning, vision analysis, and quality validation loops.")
    report_lines.append("")

    report_lines.append("## 10. Privacy & Protection Results")
    b_priv = comparisons.get("pii_protection_rate_pct", {}).get("baseline_value", "N/A")
    v_priv = comparisons.get("pii_protection_rate_pct", {}).get("verion_value", "N/A")
    report_lines.append(f"- Baseline PII Protection Rate: `{b_priv}%`")
    report_lines.append(f"- Verion AI PII Protection Rate: `{v_priv}%`")
    report_lines.append("")

    report_lines.append("## 11. Verion-Specific Capabilities & COPE")
    report_lines.append("- **Vision Processing**: Supported by Verion AI via `VisionAgent` (N/A for Baseline).")
    report_lines.append("- **RAG Context**: Vector retrieval of marketplace context supported by Verion AI (N/A for Baseline).")
    report_lines.append("- **COPE Simulation**: *COPE scores represent synthetic / estimated simulations, not actual ground-truth conversion or CTR.*")
    report_lines.append("")

    report_lines.append("## 12. Limitations")
    report_lines.append("- Baseline is intentionally simple and single-prompt.")
    report_lines.append("- Evaluation relies on controlled input specifications and API responses.")
    report_lines.append("")

    report_lines.append("## 13. Conclusion")
    report_lines.append("The experimental data demonstrates the quantitative trade-offs between a single-LLM baseline and Verion's multi-agent architecture.")

    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    report_file = REPORTS_DIR / f"{exp_id}_evaluation_report.md"
    with open(report_file, "w", encoding="utf-8") as f:
        f.write("\n".join(report_lines))

    print(f"Evaluation report generated cleanly: {report_file}")

def main():
    parser = argparse.ArgumentParser(description="Generate evaluation report from experiment metrics.")
    parser.add_argument("--experiment-id", type=str, default=None, help="Experiment ID to process")
    args = parser.parse_args()

    generate_report(args.experiment_id)

if __name__ == "__main__":
    main()
