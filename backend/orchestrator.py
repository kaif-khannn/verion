import asyncio
import logging
from typing import Dict, Any, List, Optional
from PIL import Image

from agents.privacy_agent import PrivacyAgent
from agents.vision_agent import VisionAgent
from agents.rag_agent import RAGAgent
from agents.content_generation_agent import ContentGenerationAgent
from agents.prediction_engine import PredictionEngine
from agents.decision_agent import DecisionAgent
from agents.quality_agent import QualityAgent
from scoring.scoring_engine import ScoringEngine
from services.context_builder import ContextBuilder

logger = logging.getLogger("orchestrator")


class Orchestrator:
    """
    Refactored Production Multi-Agent Orchestrator.
    Optimizes LLM API calls down to 3-4 per request while preserving full backward compatibility.
    """

    def __init__(self):
        self.privacy_agent = PrivacyAgent()
        self.vision_agent = VisionAgent()
        self.rag_agent = RAGAgent()
        self.content_gen_agent = ContentGenerationAgent()
        self.prediction_engine = PredictionEngine()
        self.decision_agent = DecisionAgent()
        self.quality_agent = QualityAgent()
        self.scoring_engine = ScoringEngine()

    async def process_request(
        self,
        raw_input: str,
        images: Optional[List[Image.Image]] = None,
        platform: str = "olx",
    ) -> Dict[str, Any]:
        results: Dict[str, Any] = {}

        # ── Step 1: PII Detection & Anonymization (Pure Python / Presidio) ─────
        sanitized_input = self.privacy_agent.sanitize(raw_input)
        results["sanitized_input"] = sanitized_input

        # ── Step 2: Parallel Pre-processing (VisionAgent + RAGAgent) ───────────
        # Build initial query for RAG (text + image flag)
        rag_query = f"Text Description:\n{sanitized_input}"

        vision_task = self.vision_agent.analyze_image(images) if images else asyncio.sleep(0, result=None)
        rag_task = self.rag_agent.retrieve_similar_products(rag_query)

        # Run independent tasks concurrently
        vision_result, rag_context = await asyncio.gather(vision_task, rag_task)

        if vision_result:
            results["vision_analysis"] = vision_result
        results["rag_context"] = rag_context

        # ── Step 3: Build Unified Shared Context ──────────────────────────────
        product_context = ContextBuilder.build(
            sanitized_input=sanitized_input,
            vision_analysis=vision_result,
            rag_context=rag_context,
            platform=platform,
            raw_images=images,
        )

        # ── Step 4: Content Generation (Single LLM Call for SEO + Marketing + Competitor) ──
        gen_output = await self.content_gen_agent.generate_all(product_context)

        seo_result = gen_output.get("seo", {})
        competitor_result = gen_output.get("competitor_analysis", {})
        variants = gen_output.get("generated_variants", [])

        results["seo"] = seo_result
        results["competitor_analysis"] = competitor_result
        results["generated_variants"] = variants

        # ── Step 5: COPE Variant Scoring & Prediction (1 LLM Call) ───────────
        combined_context_str = product_context.to_prompt_context()
        scored_variants = await self.prediction_engine.score_variants(combined_context_str, variants)
        results["scored_variants"] = scored_variants

        # ── Step 6: Decision Routing (Pure Python Rules) ──────────────────────
        decision = self.decision_agent.decide(scored_variants)
        results["decision"] = decision

        champion_marketing = scored_variants[0]["marketing"] if scored_variants else (variants[0]["marketing"] if variants else {})
        results["marketing"] = champion_marketing  # Backward compatibility key

        # ── Step 7: Quality Validation & Legacy Scoring (Pure Python) ──────────
        validation_result = self.quality_agent.validate(seo_result, champion_marketing)
        results["validation"] = validation_result

        scores = self.scoring_engine.evaluate(seo_result, champion_marketing, sanitized_input)
        results["scores"] = scores

        return {
            "status": "success",
            "message": "Workflow completed",
            "data": results,
        }
