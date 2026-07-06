import os
from groq import Groq

class MarketingAgent:
    def __init__(self):
        api_key = os.getenv("GROQ_API_KEY")
        if api_key:
            self.client = Groq(api_key=api_key)
            self.model = "llama-3.3-70b-versatile"
        else:
            self.client = None

    def generate(self, product_context: str, seo_title: str, platform: str) -> dict:
        if not self.client:
            return {"error": "GROQ_API_KEY is not set."}
            
        # Determine the correct key and style based on the platform so we only get ONE output
        if platform.lower() == 'whatsapp':
            content_key = '"whatsapp": "A highly persuasive, engaging, and detailed WhatsApp broadcast message. Include emojis, bullet points for readability, and a friendly but urgent tone."'
        elif platform.lower() == 'instagram':
            content_key = '"instagram_caption": "A lengthy, aesthetic, and highly engaging Instagram caption. Start with a strong hook, tell a story about the product, use line breaks, and include a block of relevant hashtags at the bottom."'
        else:
            content_key = f'"platform_description": "A comprehensive, premium, and persuasive listing description tailored for {platform}. It should be 2-3 paragraphs long, highlighting key features, benefits, and reasons to buy immediately."'

        prompt = f"""
        You are an elite, world-class e-commerce copywriter known for writing high-converting, premium marketing copy.
        Your task is to write detailed marketing copy tailored specifically for the '{platform}' platform.
        The output MUST be comprehensive and not just a short summary. Make the product sound incredibly desirable.
        
        Given the following product context and SEO title, generate the copy in valid JSON format with exactly these keys:
        - "platform": "{platform}"
        - {content_key}
        - "call_to_action": "A strong, urgent, and compelling Call to Action (CTA) sentence."

        IMPORTANT: If you mention any prices, discounts, or revenue, MUST format them in Indian Rupees (₹ / INR), not US Dollars ($).

        Product Context:
        {product_context}

        SEO Title:
        {seo_title}
        """
        
        try:
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": "You are a master copywriter. Always return your response in valid JSON format."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                model=self.model,
                temperature=0.7,
                max_tokens=1024,
                response_format={"type": "json_object"}
            )
            import json
            return json.loads(chat_completion.choices[0].message.content)
        except Exception as e:
            return {"error": f"Error during Marketing Content generation: {str(e)}"}
