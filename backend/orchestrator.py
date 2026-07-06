from agents.privacy_agent import PrivacyAgent
from agents.vision_agent import VisionAgent
from agents.seo_agent import SEOAgent
from agents.marketing_agent import MarketingAgent
from agents.competitor_agent import CompetitorAgent
from agents.quality_agent import QualityAgent
from agents.rag_agent import RAGAgent
from scoring.scoring_engine import ScoringEngine
from agents.prediction_engine import PredictionEngine
from agents.decision_agent import DecisionAgent


class Orchestrator:
    def __init__(self):
        # Initialize agents
        self.privacy_agent = PrivacyAgent()
        self.vision_agent = VisionAgent()
        self.seo_agent = SEOAgent()
        self.marketing_agent = MarketingAgent()
        self.competitor_agent = CompetitorAgent()
        self.quality_agent = QualityAgent()
        self.rag_agent = RAGAgent()
        self.scoring_engine = ScoringEngine()
        self.prediction_engine = PredictionEngine()
        self.decision_agent = DecisionAgent()
        
    def process_request(self, raw_input: str, images: list = None, platform: str = "olx"):
        results = {}
        
        # Step 1: PII Detection & Anonymization
        sanitized_input = self.privacy_agent.sanitize(raw_input)
        results["sanitized_input"] = sanitized_input
        
        # Step 2: Vision Analysis (supports multiple images)
        if images:
            vision_result = self.vision_agent.analyze_image(images)
            results["vision_analysis"] = vision_result
            
        # Combine text and vision for downstream agents
        combined_context = f"Text Description:\n{sanitized_input}"
        if images and "vision_analysis" in results:
            combined_context += f"\n\nVision Analysis:\n{results['vision_analysis']}"

        # Step 2.5: RAG Retrieval
        rag_context = self.rag_agent.retrieve_similar_products(combined_context)
        results["rag_context"] = rag_context
        
        # Append RAG to combined context so agents have market data
        combined_context += f"\n\n{rag_context}"

        # Step 3: SEO Optimization (Now with vision & market context)
        seo_result = self.seo_agent.optimize(combined_context)
        results["seo"] = seo_result

        # Step 4: Marketing Content Generation & Variants
        seo_title = seo_result.get("title", "") if isinstance(seo_result, dict) else ""
        
        import uuid
        variants = []
        # Generate 3 variants for COPE
        for i in range(3):
            marketing_result = self.marketing_agent.generate(combined_context, seo_title=seo_title, platform=platform)
            variants.append({
                "variant_id": str(uuid.uuid4()),
                "marketing": marketing_result,
                "seo": seo_result
            })
            
        results["generated_variants"] = variants

        # Step 4.5: COPE Prediction & Decision
        scored_variants = self.prediction_engine.score_variants(combined_context, variants)
        results["scored_variants"] = scored_variants
        
        decision = self.decision_agent.decide(scored_variants)
        results["decision"] = decision
        
        # Determine champion variant
        champion_marketing = scored_variants[0]["marketing"] if scored_variants else variants[0]["marketing"]
        results["marketing"] = champion_marketing # Fallback for old UI

        # Step 5: Competitor Intel
        competitor_result = self.competitor_agent.analyze(sanitized_input)
        results["competitor_analysis"] = competitor_result

        # Step 6: Validation & Quality Scoring
        validation_result = self.quality_agent.validate(seo_result, champion_marketing)
        results["validation"] = validation_result

        # Step 7: Legacy Scoring
        scores = self.scoring_engine.evaluate(seo_result, champion_marketing, sanitized_input)
        results["scores"] = scores

        return {
            "status": "success",
            "message": "Workflow completed",
            "data": results
        }

