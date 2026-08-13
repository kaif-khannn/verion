# Verion AI vs. Single-LLM Baseline Evaluation Framework

## Current Status

> **Evaluation infrastructure and scripts are implemented. Controlled test cases have not yet been added and the formal experiment has not yet been executed.**

---

## Purpose

The `evaluation` directory contains the complete external experimental harness used to compare Verion AI against a conventional single-LLM baseline.

The goal is to quantitatively and qualitatively evaluate whether Verion's multi-agent architecture provides measurable benefits over a conventional single-LLM approach across metrics such as content completeness, specification consistency, latency, token cost, and PII privacy protection.

---

## Experimental Design & Fairness Rules

To ensure a rigorous and fair comparison:
- **Identical Inputs**: The **SAME** test cases, product information, specifications, and product images will be provided to both systems.
- **No Manipulated Inputs**: Inputs are passed directly without manual modification between systems.
- **Independent Execution**:
  - **Baseline**: Operates as a conventional single-LLM system using a single fixed prompt (`baseline/`).
  - **Verion AI**: Operates through its full end-to-end multi-agent pipeline (`backend/`).
- **Preservation of Failures**: Requests that fail are recorded as failures; no silent omissions or cherry-picking.
- **Metric Direction Respect**: Metrics are evaluated based on their goal (higher is better for success rate/completeness/privacy; lower is better for latency/cost).
- **Capability Metadata**: Unavailable baseline features (such as Vision analysis, Privacy scrubbing, or RAG context) are recorded transparently as `N/A`.

---

## Directory Structure

```
evaluation/
├── test_cases/
│   ├── README.md
│   └── images/
│       └── .gitkeep
├── baseline_results/
│   └── .gitkeep
├── verion_results/
│   └── .gitkeep
├── metrics/
│   └── .gitkeep
├── comparison/
│   ├── charts/
│   │   └── .gitkeep
│   └── .gitkeep
├── reports/
│   └── .gitkeep
├── scripts/
│   ├── validate_test_cases.py
│   ├── run_experiment.py
│   ├── calculate_metrics.py
│   ├── compare_results.py
│   ├── generate_charts.py
│   ├── generate_report.py
│   └── README.md
└── README.md
```

---

## Future Test Case Schema

When test cases are added in a future phase, each test case will be stored in `evaluation/test_cases/TCXXX/input.json`:

```json
{
  "test_case_id": "TC001",
  "category": "smartphone",
  "product_name": "Apple iPhone 14",
  "brand": "Apple",
  "description": "128GB Midnight Blue",
  "specifications": {
    "Display": "6.1 inches",
    "Storage": "128 GB"
  },
  "price": "₹64,900",
  "condition": "New",
  "target_platform": "Shopify",
  "images": [
    "images/image_1.jpg"
  ]
}
```

---

## Execution Workflow

1. Validate Dataset: `python evaluation/scripts/validate_test_cases.py`
2. Run Experiment: `python evaluation/scripts/run_experiment.py`
3. Calculate Metrics: `python evaluation/scripts/calculate_metrics.py`
4. Compare Results: `python evaluation/scripts/compare_results.py`
5. Generate Visual Charts: `python evaluation/scripts/generate_charts.py`
6. Render Evaluation Report: `python evaluation/scripts/generate_report.py`
