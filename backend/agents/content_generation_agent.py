import uuid
import json
from typing import Dict, Any, List
from services.llm_gateway import llm_gateway
from services.context_builder import ProductContext


class ContentGenerationAgent:
    """
    Unified Content Generation Agent.
    Replaces separate LLM calls for SEOAgent, MarketingAgent, and CompetitorAgent
    by issuing a SINGLE LLM call that returns SEO metadata, pricing strategy,
    competitor insights, and 3 marketing copy variants in a structured JSON schema.
    """

    def __init__(self, gateway=None):
        self.gateway = gateway or llm_gateway

    async def generate_all(self, context: ProductContext) -> Dict[str, Any]:
        product_context_str = context.to_prompt_context()
        platform = context.platform

        # Define platform copy key instruction
        if platform.lower() == "whatsapp":
            marketing_instruction = '"whatsapp": "A highly persuasive, engaging broadcast message with emojis, bullets, and friendly/urgent tone."'
        elif platform.lower() == "instagram":
            marketing_instruction = '"instagram_caption": "An aesthetic, engaging Instagram caption with strong hook, story, line breaks, and hashtags at the bottom."'
        else:
            marketing_instruction = f'"platform_description": "A comprehensive, premium listing description for {platform} (2-3 paragraphs, highlighting features and benefits)."'

        prompt = f"""
        You are an elite, world-class e-commerce growth strategist, SEO specialist, and master copywriter.
        Your task is to generate complete product data, market pricing analysis, and THREE distinct high-converting marketing variants tailored for '{platform}'.

        Given the following product context (which includes vision analysis and RAG market dataset context):

        --- PRODUCT CONTEXT ---
        {product_context_str}
        --- END PRODUCT CONTEXT ---

        CRITICAL INSTRUCTIONS:
        1. All prices, revenue figures, and monetary metrics MUST be in Indian Rupees (₹ / INR). Do not use USD ($).
        2. Use the RAG market dataset context to infer any missing specs (material, brand, dimensions, etc.) if not explicitly provided.
        3. Generate EXACTLY THREE distinct marketing variants (Variant 1, Variant 2, Variant 3) with different copywriting angles (e.g. Angle 1: Feature & Tech Heavy, Angle 2: Emotional & Value Driven, Angle 3: Urgency & Lifestyle Focused).

        Return a single JSON object strictly matching this schema:
        {{
            "seo": {{
                "title": "SEO-optimized product title (max 70 chars)",
                "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5", "keyword6"],
                "bullet_points": ["bullet 1", "bullet 2", "bullet 3", "bullet 4"],
                "price": "numeric price string in INR, e.g. 4999.00",
                "color": "color string or null",
                "condition": "e.g. New, Used - Like New, Refurbished",
                "weight": "weight string e.g. 1.2 kg or null",
                "brand": "brand string or null",
                "material": "material string or null",
                "dimensions": "dimensions string or null",
                "category": "specific product category e.g. Electronics > Smartphones",
                "product_type": "short type label e.g. Smartphone",
                "specs": {{ "spec_name": "spec_value" }}
            }},
            "competitor_analysis": {{
                "market_positioning": "Short positioning statement against competitors",
                "lowest_competitor_price": "numeric price string in INR or null",
                "highest_competitor_price": "numeric price string in INR or null",
                "average_market_price": "numeric price string in INR or null",
                "recommended_price": "numeric recommended price in INR",
                "pricing_strategy": "Explanation of recommended price strategy",
                "competitor_insights": ["insight 1", "insight 2", "insight 3"]
            }},
            "variants": [
                {{
                    "platform": "{platform}",
                    {marketing_instruction},
                    "call_to_action": "Strong, urgent Call to Action sentence."
                }},
                {{
                    "platform": "{platform}",
                    {marketing_instruction},
                    "call_to_action": "Strong, urgent Call to Action sentence."
                }},
                {{
                    "platform": "{platform}",
                    {marketing_instruction},
                    "call_to_action": "Strong, urgent Call to Action sentence."
                }}
            ]
        }}
        """

        messages = [
            {
                "role": "system",
                "content": "You are a master e-commerce AI system. Always return pure valid JSON.",
            },
            {"role": "user", "content": prompt},
        ]

        try:
            raw_response = await self.gateway.generate_chat(
                messages=messages,
                model="llama-3.1-8b-instant",
                temperature=0.6,
                max_tokens=2500,
                response_format={"type": "json_object"},
            )
            data = json.loads(raw_response)

            # Format variants with UUIDs to match expected schema
            formatted_variants = []
            raw_variants = data.get("variants", [])
            if not isinstance(raw_variants, list) or len(raw_variants) < 3:
                # Fallback if LLM returned fewer variants
                raw_variants = raw_variants if isinstance(raw_variants, list) else []
                while len(raw_variants) < 3:
                    raw_variants.append({
                        "platform": platform,
                        "platform_description": "High-quality product offering optimized for customer acquisition.",
                        "call_to_action": "Buy now while stock lasts!",
                    })

            seo_data = data.get("seo", {})
            for v in raw_variants[:3]:
                formatted_variants.append({
                    "variant_id": str(uuid.uuid4()),
                    "marketing": v,
                    "seo": seo_data,
                })

            return {
                "seo": seo_data,
                "competitor_analysis": data.get("competitor_analysis", {}),
                "generated_variants": formatted_variants,
            }

        except Exception as e:
            # Resilient fallback if LLM or parsing fails
            fallback_variant_id = str(uuid.uuid4())
            fallback_seo = {
                "title": f"Optimized {platform.capitalize()} Product Listing",
                "keywords": ["ecommerce", "quality", "bestseller"],
                "bullet_points": ["High quality item", "Fast shipping", "Best value"],
                "price": "0.00",
                "category": "General",
                "product_type": "Product",
                "specs": {},
            }
            fallback_marketing = {
                "platform": platform,
                "platform_description": "Premium product with top-tier features and high durability.",
                "call_to_action": "Order now to get the best deal!",
            }
            return {
                "seo": fallback_seo,
                "competitor_analysis": {
                    "market_positioning": "Standard competitive market positioning.",
                    "recommended_price": "0.00",
                    "pricing_strategy": "Based on standard market rates.",
                    "competitor_insights": ["Competitive pricing detected."],
                },
                "generated_variants": [
                    {"variant_id": str(uuid.uuid4()), "marketing": fallback_marketing, "seo": fallback_seo},
                    {"variant_id": str(uuid.uuid4()), "marketing": fallback_marketing, "seo": fallback_seo},
                    {"variant_id": str(uuid.uuid4()), "marketing": fallback_marketing, "seo": fallback_seo},
                ],
                "error": f"Content generation error: {str(e)}",
            }
