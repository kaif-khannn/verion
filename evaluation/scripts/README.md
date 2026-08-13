# Evaluation Automation Scripts

## Current Status

> **Evaluation scripts are fully implemented.** No test cases or experimental runs have been executed yet.

---

## Execution Order & Pipeline

The evaluation pipeline is executed in six sequential steps:

```
                CONTROLLED TEST CASES
                          │
                          ▼
             1. validate_test_cases.py
                          │
                          ▼
               2. run_experiment.py
                          │
               ┌──────────┴──────────┐
               ▼                     ▼
          BASELINE                VERION
         Single LLM             Multi-Agent
               │                     │
               ▼                     ▼
     baseline_results/        verion_results/
               │                     │
               └──────────┬──────────┘
                          ▼
               3. calculate_metrics.py
                          │
                          ▼
                     metrics/
                          │
                          ▼
                 4. compare_results.py
                          │
                          ▼
                    comparison/
                          │
                          ▼
               5. generate_charts.py
                          │
                          ▼
               comparison/charts/
                          │
                          ▼
               6. generate_report.py
                          │
                          ▼
                      reports/
```

---

## Script Reference

### 1. `validate_test_cases.py`
- **Purpose**: Validates test case schema, required fields, field types, ID uniqueness, and referenced image paths inside `evaluation/test_cases/`.
- **Consumes**: `evaluation/test_cases/*/input.json` and `evaluation/test_cases/*/images/`
- **Produces**: Validation status summary and error logs. Exits safely if no test cases are present.

### 2. `run_experiment.py`
- **Purpose**: Main experiment runner. Sends identical test case inputs to Baseline and Verion AI HTTP API endpoints.
- **Consumes**: Validated test cases from `evaluation/test_cases/`
- **Produces**:
  - `evaluation/baseline_results/EXP_YYYYMMDD_HHMMSS/*.json`
  - `evaluation/verion_results/EXP_YYYYMMDD_HHMMSS/*.json`

### 3. `calculate_metrics.py`
- **Purpose**: Calculates quantitative metrics from raw execution results (reliability, latency percentiles, completeness, PII protection rates).
- **Consumes**: `evaluation/baseline_results/EXP_.../` and `evaluation/verion_results/EXP_.../`
- **Produces**:
  - `evaluation/metrics/EXP_YYYYMMDD_HHMMSS_metrics.json`
  - `evaluation/metrics/EXP_YYYYMMDD_HHMMSS_metrics.csv`

### 4. `compare_results.py`
- **Purpose**: Compares Baseline vs Verion AI metrics. Respects metric direction (higher is better vs lower is better).
- **Consumes**: `evaluation/metrics/EXP_..._metrics.json`
- **Produces**:
  - `evaluation/comparison/EXP_YYYYMMDD_HHMMSS_comparison.json`
  - `evaluation/comparison/EXP_YYYYMMDD_HHMMSS_comparison.csv`

### 5. `generate_charts.py`
- **Purpose**: Renders visual PNG chart visualizations from comparison data.
- **Consumes**: `evaluation/comparison/EXP_..._comparison.json`
- **Produces**: Image chart assets in `evaluation/comparison/charts/`

### 6. `generate_report.py`
- **Purpose**: Compiles quantitative metrics, comparisons, and analysis into a comprehensive Markdown evaluation report.
- **Consumes**: `evaluation/comparison/EXP_..._comparison.json` and `evaluation/metrics/EXP_..._metrics.json`
- **Produces**: `evaluation/reports/EXP_YYYYMMDD_HHMMSS_evaluation_report.md`
