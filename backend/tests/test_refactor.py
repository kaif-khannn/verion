import unittest
import asyncio
import time
import os
import sys

# Ensure backend directory is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from models.product_context import ProductContext
from services.context_builder import ContextBuilder
from services.prompt_loader import PromptLoader, PromptNotFoundError
from services.cache import LLMCache
from services.llm_gateway import LLMGateway
from services.json_utils import safe_parse_json, strip_think_tags, clean_html_text, validate_pipeline_output
from agents.vision_agent import VisionAgent
from agents.privacy_agent import PrivacyAgent


class TestProductContext(unittest.TestCase):
    def test_immutability(self):
        ctx = ProductContext(user_input="Test Product", platform="olx")
        self.assertEqual(ctx.user_input, "Test Product")
        self.assertEqual(ctx.sanitized_text, "Test Product")
        self.assertEqual(ctx.sanitized_input, "Test Product")
        with self.assertRaises(AttributeError):
            ctx.user_input = "Modified"

    def test_to_prompt_context(self):
        ctx = ProductContext(
            user_input="Red Bicycle",
            platform="shopify",
            vision_data="Good condition",
            market_data="Similar retail price ₹5000",
        )
        prompt_str = ctx.to_prompt_context()
        self.assertIn("--- USER INPUT ---\nRed Bicycle", prompt_str)
        self.assertIn("--- VISION DATA ---\nGood condition", prompt_str)
        self.assertIn("Similar retail price ₹5000", prompt_str)

    def test_context_builder(self):
        ctx = ContextBuilder.build(
            sanitized_input="Wireless Mouse",
            vision_analysis="Black optical mouse",
            platform="woocommerce",
        )
        self.assertIsInstance(ctx, ProductContext)
        self.assertEqual(ctx.user_input, "Wireless Mouse")
        self.assertEqual(ctx.platform, "woocommerce")


class TestJsonUtils(unittest.TestCase):
    def test_strip_think_tags(self):
        text = "<think>Internal reasoning here</think>Clean Output"
        self.assertEqual(strip_think_tags(text), "Clean Output")

    def test_clean_html_text(self):
        html = "<p>Paragraph 1</p><h3>Header</h3><ul><li>Item 1</li></ul>"
        clean = clean_html_text(html)
        self.assertNotIn("<p>", clean)
        self.assertNotIn("<h3>", clean)
        self.assertIn("Paragraph 1", clean)

    def test_safe_parse_json(self):
        text = "<think>reasoning</think>```json\n{\"seo\": {\"title\": \"Phone\"}}\n```"
        parsed = safe_parse_json(text)
        self.assertEqual(parsed.get("seo", {}).get("title"), "Phone")

    def test_validate_pipeline_output(self):
        valid = {
            "seo": {"title": "Sample Title", "price": "₹499.00"},
            "generated_variants": [
                {"variant_id": "1"}, {"variant_id": "2"}, {"variant_id": "3"}
            ]
        }
        self.assertEqual(validate_pipeline_output(valid), valid)


class TestPrivacyAgent(unittest.TestCase):
    def test_pure_python_masking(self):
        agent = PrivacyAgent()
        text = "Contact me at 9876543210 or user@example.com for M2 MacBook 8GB"
        sanitized = agent.sanitize(text)
        self.assertNotIn("9876543210", sanitized)
        self.assertNotIn("user@example.com", sanitized)
        self.assertIn("M2 MacBook 8GB", sanitized)


class TestPromptLoader(unittest.TestCase):
    def setUp(self):
        self.loader = PromptLoader()

    def test_load_and_cache(self):
        prompt = self.loader.load("vision")
        self.assertTrue(len(prompt) > 0)
        self.assertIn("vision", self.loader._cache)

    def test_missing_prompt_raises_exception(self):
        with self.assertRaises(PromptNotFoundError):
            self.loader.load("non_existent_prompt_template_xyz")


class TestLLMCache(unittest.TestCase):
    def setUp(self):
        self.cache = LLMCache()
        self.cache.clear()

    def test_sha256_key_generation(self):
        key1 = LLMCache.create_key("modelA", "promptA", "userA", 0.5)
        key2 = LLMCache.create_key("modelA", "promptA", "userA", 0.5)
        key3 = LLMCache.create_key("modelA", "promptA", "userB", 0.5)
        self.assertEqual(key1, key2)
        self.assertNotEqual(key1, key3)
        self.assertEqual(len(key1), 64)

    def test_set_and_get(self):
        key = self.cache.create_key("m", "p", "u", 0.7)
        self.cache.set(key, '{"result": "ok"}', ttl_seconds=10)
        val = self.cache.get(key)
        self.assertEqual(val, '{"result": "ok"}')


if __name__ == "__main__":
    unittest.main()
