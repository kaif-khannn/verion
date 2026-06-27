import os
from groq import Groq

class SEOAgent:
    def __init__(self):
        api_key = os.getenv("GROQ_API_KEY")
        if api_key:
            self.client = Groq(api_key=api_key)
            # Using Llama 3.3 70B for fast, high-quality text generation
            self.model = "llama-3.3-70b-versatile" 
        else:
            self.client = None

    def optimize(self, product_context: str) -> dict:
        if not self.client:
            return {"error": "GROQ_API_KEY is not set."}

        prompt = f"""
        You are an expert e-commerce SEO specialist and product data analyst.
        Given the following product context (which may include vision analysis and similar market products from a RAG database),
        generate a comprehensive, fully-detailed product data object in JSON format.

        IMPORTANT: Use the RAG-retrieved similar products to fill any MISSING specs the user did not mention.
        For example, if the user did not mention material but a similar product in RAG context has it, infer and fill it.

        Return JSON with EXACTLY these keys:
        - "title": SEO-optimized product title (max 70 chars)
        - "keywords": list of 6 high-ranking target keywords (array of strings)
        - "bullet_points": 4-6 engaging bullet points highlighting key features (array of strings)
        - "price": numeric price string in Indian Rupees (INR) (e.g. "4999.00"). Extract from user input or infer from similar RAG products. Ensure realistic Indian market values (do not copy USD numeric values directly). Default "0.00".
        - "color": detected/inferred color (string or null)
        - "condition": product condition e.g. "New", "Used - Like New", "Refurbished" (string or null)
        - "weight": weight with unit e.g. "1.2 kg" (string or null)
        - "brand": brand or manufacturer name (string or null, infer from RAG if needed)
        - "material": primary material e.g. "Stainless Steel", "Cotton" (string or null, infer from RAG if needed)
        - "dimensions": product dimensions e.g. "30 x 20 x 10 cm" (string or null, infer from RAG if needed)
        - "category": specific Shopify product category e.g. "Electronics > Smartphones", "Clothing > T-Shirts" (string)
        - "product_type": short product type label e.g. "Smartphone", "Running Shoes" (string)
        - "specs": an object of additional key-value specification pairs inferred from context and RAG data.
          Examples: {{"RAM": "8GB", "Storage": "256GB", "Battery": "5000mAh", "Screen Size": "6.5 inch"}}
          Include as many relevant specs as possible. Use null if genuinely unknown.

        Product Context:
        {product_context}
        """

        try:
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert e-commerce SEO specialist and data analyst. Always return valid JSON."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                model=self.model,
                temperature=0.4,
                max_tokens=2048,
                response_format={"type": "json_object"}
            )
            import json
            return json.loads(chat_completion.choices[0].message.content)
        except Exception as e:
            return {"error": f"Error during SEO generation: {str(e)}"}
