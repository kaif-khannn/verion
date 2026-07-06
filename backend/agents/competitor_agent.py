import os
from groq import Groq

class CompetitorAgent:
    def __init__(self):
        api_key = os.getenv("GROQ_API_KEY")
        if api_key:
            self.client = Groq(api_key=api_key)
            self.model = "llama-3.3-70b-versatile"
        else:
            self.client = None

    def analyze(self, product_context: str) -> dict:
        if not self.client:
            return {"error": "GROQ_API_KEY is not set."}
            
        prompt = f"""
        Given the following product context (which may include RAG market data), generate a competitor intelligence analysis in JSON format with the following keys:
        - "market_positioning": A short sentence on how to position this product against competitors based on the provided data.
        - "lowest_competitor_price": The lowest competitor price found in the context (strictly numeric in INR, e.g., "75000"). If none found, return null.
        - "highest_competitor_price": The highest competitor price found in the context (strictly numeric in INR). If none found, return null.
        - "average_market_price": The average competitor price (strictly numeric in INR). If none found, return null.
        - "recommended_price": A strictly numeric price recommendation in INR (e.g. "74500"). Compare all available pricing so far and suggest the absolute best price to win the sale (usually slightly undercutting the lowest competitor price, or matching it with better positioning). Ensure the price reflects realistic Indian market values. If no market context is given, suggest a fair baseline in INR.
        - "pricing_strategy": Explanation of how the recommended_price was calculated by comparing the best available competitor prices, and why it's the winning strategy.
        - "competitor_insights": 2-3 bullet points analyzing typical competitor pricing trends or weaknesses we can exploit.

        Product Context:
        {product_context}
        """
        
        try:
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert e-commerce market analyst. You must always return your response in JSON format."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                model=self.model,
                temperature=0.5,
                max_tokens=1024,
                response_format={"type": "json_object"}
            )
            import json
            return json.loads(chat_completion.choices[0].message.content)
        except Exception as e:
            return {"error": f"Error during Competitor Intel generation: {str(e)}"}
