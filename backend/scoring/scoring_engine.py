import re

class ScoringEngine:
    def __init__(self):
        pass

    def evaluate(self, seo_result: dict, marketing_result: dict, privacy_result: str) -> dict:
        scores = {}
        feedback_points = []
        
        # 1. Privacy Safety Score (heuristic: check if placeholders like <PHONE_NUMBER> exist)
        privacy_score = 100 if "<" in privacy_result and ">" in privacy_result else 98
        scores["privacy_score"] = privacy_score
        
        # 2. SEO Score (Detailed Heuristics)
        seo_score = 45 # Base score
        if isinstance(seo_result, dict):
            title = seo_result.get("title", "")
            if title:
                # Title length optimal range: 50-60 characters
                if 40 <= len(title) <= 65:
                    seo_score += 20
                else:
                    seo_score += 10
                    feedback_points.append("SEO Title length is sub-optimal.")
                    
            keywords = seo_result.get("keywords", [])
            if keywords:
                if len(keywords) >= 5:
                    seo_score += 20
                else:
                    seo_score += 10
                    
            bullets = seo_result.get("bullet_points", [])
            if bullets and len(bullets) >= 3:
                seo_score += 15
        
        # Cap SEO score
        seo_score = min(max(seo_score, 0), 100)
        scores["seo_score"] = int(seo_score)

        # 3. Marketing Quality Score (Detailed Heuristics)
        marketing_score = 40 # Base score
        if isinstance(marketing_result, dict):
            desc = marketing_result.get("platform_description", "")
            
            # Word count analysis
            words = desc.split()
            word_count = len(words)
            if 150 <= word_count <= 350:
                marketing_score += 20
            elif word_count > 50:
                marketing_score += 15
            else:
                feedback_points.append("Marketing description is too short.")
                
            # Formatting analysis (paragraphs, spacing)
            paragraphs = [p for p in desc.split('\n') if p.strip()]
            if len(paragraphs) >= 3:
                marketing_score += 15
                
            # Call to Action Analysis
            cta = marketing_result.get("call_to_action", "")
            if cta:
                if len(cta.split()) >= 3:
                    marketing_score += 15
                else:
                    marketing_score += 10
            else:
                # Fallback: check if description has action verbs at the end
                if any(word in desc.lower()[-100:] for word in ["buy", "get", "now", "offer", "shop", "discover"]):
                    marketing_score += 15

            # Power Words / Emotional Triggers heuristic
            power_words = {"exclusive", "premium", "innovative", "guarantee", "limited", "free", "best", "ultimate", "essential"}
            power_count = sum(1 for w in words if w.lower().strip('.,!?') in power_words)
            if power_count >= 3:
                marketing_score += 10
        
        # Cap Marketing score
        marketing_score = min(max(marketing_score, 0), 100)
        scores["marketing_score"] = int(marketing_score) # Renamed to fix UI
        
        # Aggregate Overall Score (Weighted)
        overall_score = int((seo_score * 0.4) + (marketing_score * 0.5) + (privacy_score * 0.1))
        scores["overall_score"] = overall_score
        
        # Compile realistic feedback
        if not feedback_points:
            feedback_points.append("Excellent optimization. Copy is highly persuasive and well-structured.")
            
        scores["feedback"] = " ".join(feedback_points)

        return scores
