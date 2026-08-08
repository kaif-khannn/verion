import os
import json
import asyncio
from typing import List, Dict, Any
from services.llm_gateway import llm_gateway


class PredictionEngine:
    """
    Conversion Optimization Prediction Engine (COPE) & Neural Persona Engine.
    Evaluates variants using LLM-as-a-judge scoring and runs synthetic 8-persona A/B simulations.
    All calls are routed through LLMGateway asynchronously.
    """

    def __init__(self, gateway=None):
        self.gateway = gateway or llm_gateway
        self.model = "llama-3.1-8b-instant"

    async def score_variants(self, product_context: str, variants: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Scores generated variants on CTR, purchase probability, SEO, brand compliance.
        """
        if not variants:
            return []

        prompt = f"""
        You are a Principal AI E-commerce Optimization Expert. 
        I will provide you with a product context and several generated marketing variants (title + description + SEO).
        You must evaluate and score each variant on its likelihood to convert and drive revenue.
        
        Product Context:
        {product_context}

        Variants to evaluate:
        {json.dumps(variants, indent=2)}

        For each variant, provide a prediction object with EXACTLY these keys:
        - "variant_id": (string) the ID of the variant being scored
        - "overall_score": (int 0-100) Overall optimization score
        - "purchase_probability": (float 0-100) Estimated probability of purchase
        - "expected_ctr": (float 0-100) Expected Click-Through Rate
        - "seo_ranking_potential": (string) "Low", "Medium", or "High"
        - "brand_compliance": (int 0-100) Alignment with brand guidelines
        - "confidence_score": (int 0-100) Your confidence in these predictions

        Return a JSON object containing a "scored_variants" array with the prediction objects.
        """

        messages = [
            {"role": "system", "content": "You are a specialized Conversion Optimization Engine. Always return valid JSON."},
            {"role": "user", "content": prompt},
        ]

        try:
            raw_response = await self.gateway.generate_chat(
                messages=messages,
                model=self.model,
                temperature=0.3,
                max_tokens=2048,
                response_format={"type": "json_object"},
            )
            predictions = json.loads(raw_response)

            scored = []
            pred_map = {str(p.get("variant_id")): p for p in predictions.get("scored_variants", [])}

            for v in variants:
                vid = str(v.get("variant_id"))
                v_copy = dict(v)
                if vid in pred_map:
                    v_copy["cope_scores"] = pred_map[vid]
                else:
                    v_copy["cope_scores"] = {
                        "overall_score": 50,
                        "purchase_probability": 50,
                        "expected_ctr": 2.0,
                        "seo_ranking_potential": "Medium",
                        "brand_compliance": 80,
                        "confidence_score": 50,
                    }
                scored.append(v_copy)

            # Sort by overall score descending
            scored.sort(key=lambda x: x.get("cope_scores", {}).get("overall_score", 0), reverse=True)
            return scored

        except Exception as e:
            # Fallback with baseline scores if call fails
            for v in variants:
                v["cope_scores"] = {
                    "overall_score": 50,
                    "purchase_probability": 50,
                    "expected_ctr": 2.0,
                    "seo_ranking_potential": "Medium",
                    "brand_compliance": 80,
                    "confidence_score": 50,
                }
            return variants

    async def run_synthetic_simulation(self, variants: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        NEURAL PERSONA ENGINE:
        Runs a RAG-based synthetic AI simulation for A/B/C testing using 8 buyer personas
        and e-commerce psychology datasets as context.
        """
        # Load RAG dataset
        rag_context = ""
        dataset_path = os.path.join(os.path.dirname(__file__), "..", "knowledge_base", "ecommerce_insights.txt")
        try:
            loop = asyncio.get_event_loop()
            def _read_file():
                with open(dataset_path, "r", encoding="utf-8") as f:
                    return f.read()
            rag_context = await loop.run_in_executor(None, _read_file)
        except Exception as e:
            print(f"Could not load RAG dataset for simulation: {e}")

        variants_text = ""
        for i, v in enumerate(variants):
            label = chr(65 + i)  # A, B, C...
            seo_title = v.get("seo", {}).get("title", "Unknown Title")
            description = v.get("marketing", {}).get("platform_description", v.get("marketing", {}).get("whatsapp", v.get("marketing", {}).get("instagram_caption", "No description provided")))
            variants_text += f"\nVariant {label} (ID: {v.get('variant_id')}):\nTitle: {seo_title}\nDescription: {description}\n"

        prompt = f"""
        You are a highly advanced Synthetic AI Simulation Engine (Neural Persona Engine).
        Your job is to simulate a live Multivariate Test by instantiating 8 distinct E-commerce Buyer Personas:
        1. The Comparison Shopper (Pragmatic & Analytical)
        2. The Bargain Hunter (Price & Value Driven)
        3. The Impulse Buyer (Emotional & Immediate)
        4. The Skeptic (Risk-Averse & Trust Seeking)
        5. The Brand Loyalist (Aesthetic & Social Driven)
        6. The Need-Based Buyer (Mission-Oriented)
        7. The Ethical Consumer (Values Driven)
        8. The Gifter (Convenience & Presentation Driven)

        Use the following E-Commerce Consumer Psychology rules as your Ground Truth to evaluate the variants:
        ---
        {rag_context}
        ---

        Evaluate these product copy variants:
        {variants_text}

        For each of the 8 personas, carefully read the descriptions and determine which variant they would purchase. 
        You MUST provide a highly realistic and specific reason (2-3 sentences) that directly references the unique phrasing, tone, or specific details in the chosen variant's description that appealed to this persona's psychology. Avoid superficial or default choices.
        
        Return a JSON object strictly in this format:
        {{
            "agent_feed": [
                {{
                    "persona_name": "[Insert Persona Name Here]",
                    "chosen_variant_id": "[Insert Variant ID Here]",
                    "reasoning": "[Insert 2-3 sentences of reasoning here]"
                }}
                // MUST OUTPUT EXACTLY 8 COMPLETE OBJECTS IN THIS ARRAY, ONE FOR EACH PERSONA.
            ]
        }}
        """

        messages = [
            {"role": "system", "content": "You are a specialized Synthetic Simulation Engine. Always return valid JSON."},
            {"role": "user", "content": prompt},
        ]

        try:
            raw_response = await self.gateway.generate_chat(
                messages=messages,
                model=self.model,
                temperature=0.7,
                max_tokens=2048,
                response_format={"type": "json_object"},
            )
            return json.loads(raw_response)
        except Exception as e:
            return {"error": f"Neural Persona Engine Simulation Error: {str(e)}"}
