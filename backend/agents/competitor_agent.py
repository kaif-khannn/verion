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
        Given the following product context, generate a competitor intelligence analysis in JSON format with the following keys:
        - "market_positioning": A short sentence on how to position this product against competitors based on the provided RAG market data.
        - "recommended_price": A strictly numeric price recommendation in Indian Rupees (INR) (e.g. "80000"). Ensure the price reflects realistic Indian market values (e.g., high-end electronics should be tens of thousands of INR, not just a direct USD numerical copy). If no market context is given, suggest a fair baseline in INR.
        - "pricing_strategy": Explanation of why you chose this recommended_price.
        - "competitor_insights": 2-3 bullet points analyzing typical competitor weaknesses or pricing trends we can exploit.

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
