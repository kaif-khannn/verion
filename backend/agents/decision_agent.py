class DecisionAgent:
    """
    Evaluates the scored variants from COPE and makes autonomous 
    routing decisions (Publish, A/B Test, Regenerate).
    """
    def __init__(self, confidence_threshold=85, min_score_threshold=60, ab_test_margin=5):
        self.confidence_threshold = confidence_threshold
        self.min_score_threshold = min_score_threshold
        self.ab_test_margin = ab_test_margin

    def decide(self, scored_variants: list) -> dict:
        if not scored_variants:
            return {"action": "regenerate", "reason": "No variants provided"}

        # Variants are assumed to be sorted by overall_score descending
        top_variant = scored_variants[0]
        scores = top_variant.get("cope_scores", {})
        overall = scores.get("overall_score", 0)
        confidence = scores.get("confidence_score", 0)

        if overall < self.min_score_threshold:
            return {
                "action": "regenerate",
                "reason": f"Top variant score ({overall}) is below minimum threshold ({self.min_score_threshold})."
            }

        # Check if we should A/B test (top 2 variants are very close)
        if len(scored_variants) > 1:
            second_variant = scored_variants[1]
            second_overall = second_variant.get("cope_scores", {}).get("overall_score", 0)
            
            if (overall - second_overall) <= self.ab_test_margin and confidence < self.confidence_threshold:
                return {
                    "action": "ab_test",
                    "reason": "Top variants are closely scored and confidence is below threshold.",
                    "variants_to_test": [top_variant.get("variant_id"), second_variant.get("variant_id")]
                }

        # Default: Recommend Publish
        return {
            "action": "publish",
            "reason": "Clear winner identified with high confidence.",
            "recommended_variant_id": top_variant.get("variant_id")
        }
