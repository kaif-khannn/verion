import re
from typing import List, Tuple
from presidio_analyzer import AnalyzerEngine, PatternRecognizer, Pattern
from presidio_analyzer.nlp_engine import NlpEngineProvider
from presidio_anonymizer import AnonymizerEngine

# Allowlist of common e-commerce brand, tech product, and spec unit terms to prevent false positives.
# spaCy en_core_web_sm incorrectly tags many tech abbreviations as GPE (Geo-Political Entities):
# - "GB" → Great Britain, "TB" → Tanzania, "MB" → Manitoba, "GHz" → misread acronyms, etc.
ECOMMERCE_BRAND_ALLOWLIST = {
    # Apple ecosystem
    "macbook", "iphone", "ipad", "airpods", "imac", "mac", "apple",
    # Gaming / consoles
    "playstation", "xbox", "nintendo",
    # PC brands
    "thinkpad", "dell", "hp", "lenovo", "asus", "acer", "msi",
    # Chips / GPU
    "nvidia", "intel", "amd", "rtx", "gtx", "m1", "m2", "m3", "m4",
    # Mobile brands
    "samsung", "galaxy", "pixel", "xiaomi", "redmi", "oneplus", "realme",
    "oppo", "vivo", "motorola", "nokia", "sony",
    # Audio / Camera
    "canon", "nikon", "bose", "jbl",
    # Generic product category words
    "laptop", "smartphone", "phone", "camera", "watch", "desktop", "tablet",
    # ── Tech specification units that spaCy GPE-tags ──────────────────────────
    # Storage & Memory
    "gb", "tb", "mb", "kb", "pb",           # gigabyte, terabyte, megabyte…
    "gib", "tib", "mib",                     # gibibyte variants
    "ram", "rom", "ssd", "hdd", "emmc",     # storage type labels
    # Frequency / Speed
    "ghz", "mhz", "hz",                     # clock speeds
    # Display & Camera
    "mp", "fps", "hdr", "oled", "amoled", "lcd", "ips", "qhd", "fhd", "uhd",
    "4k", "8k", "1080p", "720p", "144hz", "120hz", "90hz", "60hz",
    # Battery
    "mah", "wh",                             # milliamp-hours, watt-hours
    # Power / Charging
    "w", "watt", "watts", "v", "volt",
    # Network / Connectivity
    "5g", "4g", "lte", "nfc", "wifi", "wi-fi", "bluetooth", "usb", "hdmi",
    "thunderbolt", "ufs",
    # Condition terms
    "refurbished", "renewed", "unlocked", "open-box",
}


class PrivacyAgent:
    """
    Pure Python & Presidio PII Masker.
    Zero LLM usage. Does NOT rewrite text, change tone, alter numbers, or add new content.
    Strictly masks phone numbers, emails, and physical street addresses in-place.
    """

    def __init__(self):
        configuration = {
            "nlp_engine_name": "spacy",
            "models": [{"lang_code": "en", "model_name": "en_core_web_sm"}],
        }
        provider = NlpEngineProvider(nlp_configuration=configuration)
        nlp_engine = provider.create_engine()

        self.analyzer = AnalyzerEngine(nlp_engine=nlp_engine, supported_languages=["en"])

        # Add a custom regex recognizer for loose phone numbers
        phone_pattern = Pattern(
            name="loose_phone",
            regex=r"\b\+?\d[\d\s\-\(\)]{6,13}\d\b",
            score=0.5
        )
        custom_phone_recognizer = PatternRecognizer(
            supported_entity="PHONE_NUMBER",
            patterns=[phone_pattern],
            context=["phone", "contact", "call", "whatsapp", "number"]
        )
        self.analyzer.registry.add_recognizer(custom_phone_recognizer)
        self.anonymizer = AnonymizerEngine()

    def sanitize(self, text: str) -> str:
        if not isinstance(text, str) or not text.strip():
            return text

        # Analyze ONLY for PII entities: PHONE_NUMBER, EMAIL_ADDRESS, LOCATION (Address)
        results = self.analyzer.analyze(
            text=text,
            entities=["PHONE_NUMBER", "EMAIL_ADDRESS", "LOCATION"],
            language="en"
        )

        # Filter out false-positive matches for product brands, models, and spec units.
        # spaCy tags many tech abbreviations (GB, TB, GHz, MP, etc.) as LOCATION/GPE.
        # We check both whole-word tokens AND substrings to catch cases like "8GB".
        filtered_results = []
        for res in results:
            entity_text = text[res.start:res.end].lower()
            tokens = set(entity_text.split())
            # Check if any allowlist word is an exact token OR a substring of the entity text
            is_allowlisted = bool(tokens & ECOMMERCE_BRAND_ALLOWLIST) or any(
                term in entity_text for term in ECOMMERCE_BRAND_ALLOWLIST
            )
            if res.entity_type == "LOCATION" and is_allowlisted:
                continue
            filtered_results.append(res)

        # Anonymize ONLY detected PII in-place (no text rewriting)
        anonymized_result = self.anonymizer.anonymize(text=text, analyzer_results=filtered_results)
        return anonymized_result.text
