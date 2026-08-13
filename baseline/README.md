# Conventional Single-LLM Baseline Solution

## Baseline Purpose

This is a conventional single-LLM reference implementation used to experimentally compare against Verion AI. It serves as an independent baseline system to evaluate the quantitative and qualitative benefits of Verion's multi-agent architecture.

## Architecture

```
Product Input
    │
    ▼
Fixed Prompt (baseline_prompt.txt)
    │
    ▼
Single LLM Call (Groq API)
    │
    ▼
Basic E-commerce Listing
```

## Features

Generates standard listing sections using a single prompt:
- Product Title
- Short Description
- Key Features
- Detailed Description
- Specifications
- SEO Keywords

## Explicit Limitations

The baseline intentionally does **NOT** provide:
- PII anonymization / Privacy protection
- Dedicated image analysis / Multimodal vision reasoning
- RAG / External knowledge retrieval
- Competitor intelligence integration
- Multi-agent orchestration
- Synthetic buyer simulation & feedback
- Variant scoring & decision engine selection
- Quality-agent validation & automated retry loops

These architectural capabilities belong exclusively to Verion AI and will be measured in subsequent experimental comparisons.

## Running the Baseline

### 1. Environment Setup

From the `baseline/` directory (or workspace root), ensure Python 3.10+ is active:

```bash
cd baseline
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate
```

### 2. Installing Requirements

Install lightweight dependencies:

```bash
pip install -r requirements.txt
```

### 3. Configuring the API Key & Settings

Set environment variables in your shell or create a `.env` file inside `baseline/`:

```env
BASELINE_LLM_MODEL=llama-3.1-8b-instant
BASELINE_API_KEY=your_groq_api_key_here
BASELINE_TEMPERATURE=0.7
BASELINE_MAX_TOKENS=1024
BASELINE_HOST=0.0.0.0
BASELINE_PORT=8001
```

*(If `BASELINE_API_KEY` is not explicitly set, the baseline falls back to `GROQ_API_KEY` if present).*

### 4. Starting the FastAPI Server

Launch the application:

```bash
python -m app.main
# Or using uvicorn directly:
uvicorn app.main:app --host 0.0.0.0 --port 8001
```

### 5. Calling `/generate`

Send a `POST` request to `http://localhost:8001/generate`:

#### Example Request (`POST /generate`)

```json
{
  "product_name": "Apple iPhone 14",
  "brand": "Apple",
  "description": "Apple iPhone 14 with 128GB storage in Midnight blue condition.",
  "specifications": {
    "Display": "6.1 inches Super Retina XDR",
    "Storage": "128 GB",
    "Camera": "Dual 12 MP"
  },
  "price": "₹64,900",
  "condition": "New",
  "target_platform": "Shopify"
}
```

#### Example Response (`200 OK`)

```json
{
  "success": true,
  "output": "1. Product Title:\nApple iPhone 14 (128GB, Midnight Blue)...\n\n2. Short Description:...",
  "latency_ms": 845.21,
  "model": "llama-3.1-8b-instant",
  "error": null
}
```
