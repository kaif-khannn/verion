import re
import json
import logging
from typing import Dict, Any

logger = logging.getLogger("json_utils")


def strip_think_tags(text: str) -> str:
    """
    Aggressively removes <think>...</think> blocks, unclosed <think>... blocks,
    and standalone <think> or </think> tags.
    """
    if not isinstance(text, str):
        return text
    # 1. Remove complete <think>...</think> blocks
    clean = re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL | re.IGNORECASE)
    # 2. Remove unclosed <think>... blocks trailing to the end of string
    clean = re.sub(r"<think>.*$", "", clean, flags=re.DOTALL | re.IGNORECASE)
    # 3. Strip any remaining lone <think> or </think> tags
    clean = re.sub(r"</?think>", "", clean, flags=re.IGNORECASE)
    return clean.strip()


def clean_html_text(text: str) -> str:
    """
    Converts or strips raw HTML tags (<p>, <h3>, <br>, <ul>, <li>) into clean readable plain text.
    """
    if not isinstance(text, str):
        return text
    s = re.sub(r"<(p|h[1-6]|ul|ol|li|div|br\s*/?)\b[^>]*>", "\n", text, flags=re.IGNORECASE)
    s = re.sub(r"<[^>]+>", "", s)
    lines = [line.strip() for line in s.splitlines()]
    clean_lines = [line for line in lines if line]
    return "\n\n".join(clean_lines)


def safe_parse_json(text: str) -> Dict[str, Any]:
    """
    Robust JSON parser:
    1. Strips <think> tags.
    2. Tries standard json.loads().
    3. If loads fails, attempts to extract JSON using regex matching the first '{' to last '}'.
    4. Raises ValueError if valid JSON cannot be extracted.
    """
    if not isinstance(text, str) or not text.strip():
        raise ValueError("Empty or invalid input string for JSON parsing.")

    cleaned_text = strip_think_tags(text)

    # Attempt 1: Direct JSON parse
    try:
        return json.loads(cleaned_text)
    except Exception:
        pass

    # Attempt 2: Regex extraction of JSON block
    match = re.search(r"(\{.*\})", cleaned_text, re.DOTALL)
    if match:
        json_str = match.group(1).strip()
        try:
            return json.loads(json_str)
        except Exception:
            pass

    # Attempt 3: Strip markdown code blocks ```json ... ```
    md_match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", cleaned_text, re.DOTALL)
    if md_match:
        try:
            return json.loads(md_match.group(1).strip())
        except Exception:
            pass

    raise ValueError(f"Failed to parse valid JSON from LLM response: {cleaned_text[:200]}...")


def validate_pipeline_output(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Validates final pipeline data payload before returning to frontend:
    - Ensures 'seo' exists and contains title
    - Ensures at least 3 generated variants exist
    - Ensures pricing is valid
    - Ensures no <think> tags are present in any string output field
    """
    if not isinstance(data, dict):
        raise ValueError("Pipeline output must be a dictionary.")

    seo = data.get("seo")
    if not seo or not isinstance(seo, dict) or not seo.get("title"):
        raise ValueError("Validation Error: SEO data or SEO title is missing.")

    variants = data.get("generated_variants", [])
    if not isinstance(variants, list) or len(variants) < 3:
        raise ValueError(f"Validation Error: Expected at least 3 generated variants, found {len(variants)}.")

    def _check_no_think(obj: Any, path: str = "data"):
        if isinstance(obj, str):
            if "<think>" in obj.lower() or "</think>" in obj.lower():
                raise ValueError(f"Validation Error: Unwanted <think> reasoning tag detected in output field '{path}'.")
        elif isinstance(obj, dict):
            for k, v in obj.items():
                _check_no_think(v, f"{path}.{k}")
        elif isinstance(obj, list):
            for idx, item in enumerate(obj):
                _check_no_think(item, f"{path}[{idx}]")

    _check_no_think(data)
    return data
