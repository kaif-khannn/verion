# Evaluation Test Cases Dataset

## Current Status

> **No actual test cases are created yet.** This directory contains only the documentation and directory structure for the future shared experimental dataset.

---

## Purpose

The `test_cases/` directory is reserved for the single, shared experimental dataset used by both systems:
1. **Baseline** (Conventional Single-LLM System)
2. **Verion AI** (Multi-Agent Platform)

Using an identical dataset guarantees a controlled, fair experimental comparison.

---

## Future Test Case Folder Structure

When test cases are created in a later phase, each test case will be stored in its own isolated folder:

```
evaluation/test_cases/
├── README.md
├── images/
│   └── .gitkeep
└── TC001/
    ├── input.json
    └── images/
        ├── image_1.jpg
        ├── image_2.jpg
        └── image_3.jpg
```

---

## Controlled Input Specification (`input.json`)

Future `input.json` files may specify the following fields:
- `test_case_id`: Unique identifier (e.g., `TC001`)
- `product_name`: Primary product title or name
- `brand`: Brand or manufacturer name
- `description`: Raw seller description or bullet points
- `specifications`: Key-value structured product specifications (e.g., display size, weight, storage)
- `price`: Product price and currency
- `condition`: Item condition (e.g., `New`, `Refurbished`, `Used`)
- `target_platform`: E-commerce channel (e.g., `Shopify`, `Amazon`, `eBay`)
- `category`: Product taxonomy category
- `images`: List of relative paths to product image files inside `images/`
- `metadata`: Optional controlled experimental flags or tags

---

## Multimodal Image Handling

- Product image files will be placed inside each test case's `images/` subfolder.
- The **Baseline** system will ignore image files and generate content using text metadata only.
- **Verion AI** will process both textual metadata and image files via its native `VisionAgent`.
