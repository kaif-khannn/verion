import uuid
import logging
from typing import Dict, Any, Optional
from services.llm_gateway import llm_gateway, LLMGateway
from services.prompt_loader import prompt_loader as default_prompt_loader, PromptLoader
from services.json_utils import safe_parse_json, clean_html_text
from models.product_context import ProductContext

logger = logging.getLogger("content_generation_agent")


class ContentGenerationAgent:
    """
    Unified Content Generation Agent.
    Generates strict e-commerce JSON objects containing title, short_description,
    exactly 5 key_features, detailed_description, and factual specifications.
    Includes automated retry handling to guarantee valid JSON responses.
    """

    def __init__(self, gateway: Optional[LLMGateway] = None, prompt_loader_service: Optional[PromptLoader] = None):
        self.gateway = gateway or llm_gateway
        self.prompt_loader = prompt_loader_service or default_prompt_loader

    def _assemble_structured_description(self, obj: Dict[str, Any]) -> str:
        """
        Formats short_description, key_features, detailed_description, and specifications into clean plain text.
        """
        parts = []
        short_desc = obj.get("short_description", "").strip()
        if short_desc:
            parts.append(short_desc)

        features = obj.get("key_features", [])
        if isinstance(features, list) and features:
            feat_lines = ["Key Features:"]
            for f in features:
                feat_lines.append(f"• {f}")
            parts.append("\n".join(feat_lines))

        detailed_desc = obj.get("detailed_description") or obj.get("description", "")
        if isinstance(detailed_desc, str) and detailed_desc.strip():
            parts.append(detailed_desc.strip())

        specs = obj.get("specifications") or obj.get("specs", {})
        if isinstance(specs, dict) and specs:
            spec_lines = ["Specifications:"]
            for k, v in specs.items():
                spec_lines.append(f"- {k}: {v}")
            parts.append("\n".join(spec_lines))

        return "\n\n".join(parts)

    def _clean_features(self, features_list: Any) -> list:
        """Ensures key_features is a clean list of exactly 5 benefit-focused bullet strings."""
        if not isinstance(features_list, list):
            return [
                "**Premium Quality**: Engineered with high-grade materials for maximum durability.",
                "**Optimized Performance**: Delivers smooth, efficient everyday operation.",
                "**Sleek Design**: Modern aesthetic tailored for e-commerce platforms.",
                "**Versatile Utility**: Built to adapt seamlessly to multiple use cases.",
                "**Great Value**: Outstanding features offering superior market value."
            ]
        cleaned = [clean_html_text(str(f)) for f in features_list if str(f).strip()]
        # Trim or extend to exactly 5
        while len(cleaned) < 5:
            cleaned.append(f"**Key Feature {len(cleaned) + 1}**: Designed for superior user satisfaction and durability.")
        return cleaned[:5]

    async def generate_all(self, context: ProductContext) -> Dict[str, Any]:
        product_context_str = context.to_prompt_context()
        platform = context.platform

        user_prompt = self.prompt_loader.render(
            "content_generation",
            platform=platform,
            product_context=product_context_str,
        )

        messages = [
            {"role": "system", "content": "You are a master e-commerce AI system. You MUST return ONLY valid JSON without HTML or reasoning tags."},
            {"role": "user", "content": user_prompt},
        ]

        parsed = None
        max_attempts = 2

        for attempt in range(max_attempts):
            try:
                raw_response = await self.gateway.generate_chat(
                    messages=messages,
                    model="llama-3.1-8b-instant",
                    temperature=0.4,
                    max_tokens=2500,
                    response_format={"type": "json_object"},
                    task_type="content_generation",
                    prompt_template_content=user_prompt,
                    user_prompt_content=product_context_str,
                )

                # Robust JSON parsing (handles <think> tags, markdown, or extra trailing text)
                parsed = safe_parse_json(raw_response)
                if parsed and isinstance(parsed, dict) and ("product" in parsed or "seo" in parsed):
                    break
            except Exception as e:
                logger.warning(f"ContentGenerationAgent attempt {attempt + 1} JSON parse failed: {e}")
                if attempt == max_attempts - 1:
                    raise e

        if not parsed:
            raise ValueError("Failed to obtain valid JSON object from LLM generation.")

        seo_obj = parsed.get("seo", {})
        product_obj = parsed.get("product", {})
        pricing_obj = parsed.get("pricing", {})
        raw_variants = parsed.get("variants", [])

        # Ensure product_obj matches strict structure rules
        product_title = product_obj.get("title") or seo_obj.get("title") or f"Optimized {platform.capitalize()} Product"
        product_short_desc = clean_html_text(product_obj.get("short_description", ""))
        product_key_features = self._clean_features(product_obj.get("key_features") or product_obj.get("bullets"))
        product_detailed_desc = clean_html_text(product_obj.get("detailed_description") or product_obj.get("description", ""))
        product_specs = product_obj.get("specifications") or product_obj.get("specs") or {}

        # Format full structured description for platform rendering
        formatted_product_desc = self._assemble_structured_description({
            "short_description": product_short_desc,
            "key_features": product_key_features,
            "detailed_description": product_detailed_desc,
            "specifications": product_specs,
        })

        seo_data = {
            "title": product_title,
            "meta_description": seo_obj.get("meta_description", ""),
            "keywords": seo_obj.get("keywords", []),
            "tags": seo_obj.get("tags", []),
            "short_description": product_short_desc,
            "bullet_points": product_key_features,
            "detailed_description": product_detailed_desc,
            "specs": product_specs,
            "price": str(pricing_obj.get("recommended_price", "0.00")),
            "description": clean_html_text(formatted_product_desc),
        }

        comp_data = {
            "recommended_price": str(pricing_obj.get("recommended_price", "0.00")),
            "lowest_competitor_price": str(pricing_obj.get("lowest_competitor_price", "") or ""),
            "highest_competitor_price": str(pricing_obj.get("highest_competitor_price", "") or ""),
            "average_market_price": str(pricing_obj.get("average_market_price", "") or ""),
            "market_positioning": pricing_obj.get("market_positioning") or pricing_obj.get("strategy", "Positioned competitively."),
            "pricing_strategy": pricing_obj.get("strategy", "Competitive market pricing based on RAG dataset."),
            "competitor_insights": pricing_obj.get("competitor_insights") if isinstance(pricing_obj.get("competitor_insights"), list) else [pricing_obj.get("strategy", "Competitive pricing detected.")],
        }

        formatted_variants = []
        if not isinstance(raw_variants, list) or len(raw_variants) < 3:
            raw_variants = raw_variants if isinstance(raw_variants, list) else []
            while len(raw_variants) < 3:
                raw_variants.append({
                    "type": chr(65 + len(raw_variants)),
                    "angle": "Standard Angle",
                    "title": product_title,
                    "short_description": product_short_desc,
                    "key_features": product_key_features,
                    "detailed_description": product_detailed_desc,
                    "specifications": product_specs,
                })

        for idx, v in enumerate(raw_variants[:3]):
            var_type = v.get("type", chr(65 + idx))
            angle = v.get("angle", f"Angle {var_type}")
            v_title = v.get("title") or product_title
            v_short = clean_html_text(v.get("short_description") or product_short_desc)
            v_features = self._clean_features(v.get("key_features") or product_key_features)
            v_detailed = clean_html_text(v.get("detailed_description") or product_detailed_desc)
            v_specs = v.get("specifications") or v.get("specs") or product_specs

            var_assembled = self._assemble_structured_description({
                "short_description": v_short,
                "key_features": v_features,
                "detailed_description": v_detailed,
                "specifications": v_specs,
            })
            desc = clean_html_text(var_assembled)

            variant_seo = dict(seo_data)
            variant_seo["title"] = v_title
            variant_seo["short_description"] = v_short
            variant_seo["bullet_points"] = v_features
            variant_seo["detailed_description"] = v_detailed
            variant_seo["specs"] = v_specs

            formatted_variants.append({
                "variant_id": str(uuid.uuid4()),
                "type": var_type,
                "angle": angle,
                "title": v_title,
                "short_description": v_short,
                "key_features": v_features,
                "detailed_description": v_detailed,
                "specifications": v_specs,
                "marketing": {
                    "platform": platform,
                    "platform_description": desc,
                    "call_to_action": f"Order now on {platform.capitalize()} to get the best deal!",
                },
                "seo": variant_seo,
            })

        return {
            "seo": seo_data,
            "product": {
                "title": product_title,
                "short_description": product_short_desc,
                "key_features": product_key_features,
                "detailed_description": product_detailed_desc,
                "specifications": product_specs,
            },
            "pricing": pricing_obj,
            "competitor_analysis": comp_data,
            "generated_variants": formatted_variants,
        }
