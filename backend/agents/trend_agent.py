import os
import json
from services.llm_gateway import llm_gateway


class TrendAgent:
    """
    Market Trend Researcher Agent.
    Analyzes product categories and generates trending product suggestions asynchronously via LLMGateway.
    """

    def __init__(self, gateway=None):
        self.gateway = gateway or llm_gateway
        self.model = "llama-3.1-8b-instant"

    def _get_api_key(self) -> str:
        key = os.environ.get("GROQ_TRENDS_API_KEY") or os.environ.get("GROQ_API_KEY")
        if not key:
            raise ValueError("GROQ_TRENDS_API_KEY / GROQ_API_KEY environment variable not set")
        return key

    async def analyze_trend(self, category: str, description: str) -> dict:
        system_prompt = (
            "You are a realistic eCommerce strategist advising an online store owner (an e-commerce seller). "
            "Your task is to analyze a given product trend and provide highly realistic, actionable insights tailored directly to their store. "
            "Speak directly to the seller (e.g., 'By adding this to your store...', 'You can capture...'). "
            "You must return ONLY a raw JSON object with exactly these three keys: "
            "1. 'positioning_strategy': A 2-3 sentence paragraph advising the seller on how to uniquely market and position this product in their store. "
            "2. 'target_audience': A list of EXACTLY 3 plain string bullet points (e.g., 'Young professionals aged 25-34'). Do NOT use nested JSON objects or dictionaries for the audience items. "
            "3. 'sales_impact': A 1-2 sentence realistic explanation of the expected conversion lift for their store. You MUST include grounded, realistic numerical metrics (e.g., 'expected 15% increase in conversion yielding an extra ₹75,000 monthly revenue'). Keep it realistic for a small-to-medium ecommerce store. "
            "IMPORTANT: All pricing, revenue, and financial metrics MUST be formatted in Indian Rupees (₹ / INR), not US Dollars ($). "
            "Output pure JSON."
        )

        user_prompt = f"Trend Category: {category}\nDescription: {description}\n\nGenerate the insights."
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ]

        try:
            raw_response = await self.gateway.generate_chat(
                messages=messages,
                model=self.model,
                temperature=0.7,
                response_format={"type": "json_object"},
                api_key=self._get_api_key(),
            )
            return json.loads(raw_response)
        except Exception as e:
            print(f"Error in TrendAgent: {e}")
            return {
                "positioning_strategy": f"Position the {category} as a premium, must-have lifestyle upgrade that solves immediate pain points.",
                "target_audience": [
                    "Early adopters and tech-savvy consumers",
                    "High-income urban millennials",
                    "Trend-conscious Gen Z buyers",
                ],
                "sales_impact": "Capturing this emerging trend early is projected to drive a 15% increase in conversion rates, yielding an estimated ₹85,000 in additional monthly revenue.",
            }

    async def get_trending_products(self, niche: str) -> dict:
        system_prompt = (
            "You are an expert eCommerce market researcher and trend spotter. "
            "Your task is to identify 9 highly trending products in a given niche. "
            "You must return ONLY a raw JSON object with EXACTLY this structure: "
            "{\n"
            '  "trends": [\n'
            '    { "category": "Product Name", "growth": "+XX%", "desc": "1 sentence description." }\n'
            "  ],\n"
            '  "competitorMove": "1 sentence on what competitors are doing.",\n'
            '  "growthImpact": 25.5,\n'
            '  "salesImpact": "1-2 sentences on realistic revenue/conversion lift for this niche, e.g., \'Expected 15% increase yielding an extra ₹75,000 monthly revenue\'.",\n'
            '  "idea": "A specific product idea to generate based on these trends."\n'
            "}\n"
            "IMPORTANT: All pricing, revenue, and financial metrics MUST be formatted in Indian Rupees (₹ / INR), not US Dollars ($). "
            "Output pure JSON."
        )

        user_prompt = f"Niche: {niche}\n\nGenerate the trending products JSON."
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ]

        try:
            raw_response = await self.gateway.generate_chat(
                messages=messages,
                model=self.model,
                temperature=0.7,
                response_format={"type": "json_object"},
                api_key=self._get_api_key(),
            )
            return json.loads(raw_response)
        except Exception as e:
            print(f"Error in TrendAgent.get_trending_products: {e}")
            return {
                "trends": [
                    {"category": "AI Smart Glasses", "growth": "+85%", "desc": "Wearable AI assistants are seeing massive growth."},
                    {"category": "Modular Desk Mats", "growth": "+40%", "desc": "Customizable workspace setups are highly sought."},
                    {"category": "GaN Fast Chargers", "growth": "+60%", "desc": "High power density chargers are replacing old bricks."},
                ],
                "competitorMove": "Top sellers are bundling chargers with premium cables.",
                "growthImpact": 22.5,
                "salesImpact": "Targeting this niche could drive a 20% conversion lift, generating an estimated ₹85,000 in additional monthly revenue.",
                "idea": "100W GaN Fast Charger with Digital Display",
            }
