import os
import base64
import io
from groq import Groq

class VisionAgent:
    def __init__(self):
        # Configure Groq API using the exclusive vision key
        api_key = os.getenv("GROQ_VISION_API_KEY")
        if api_key:
            self.client = Groq(api_key=api_key)
            # Using Groq's brand new Llama 4 Scout multimodal model
            self.model = "meta-llama/llama-4-scout-17b-16e-instruct"

        else:
            self.client = None

    def _encode_image_to_base64(self, img) -> str:
        buffered = io.BytesIO()
        # Convert to RGB to ensure JPEG compatibility
        if img.mode != "RGB":
            img = img.convert("RGB")
        img.save(buffered, format="JPEG")
        return base64.b64encode(buffered.getvalue()).decode('utf-8')

    def analyze_image(self, images: list, prompt: str = "") -> str:
        if not self.client:
            return "Error: GROQ_VISION_API_KEY is not set."

        if not prompt:
            prompt = (
                "You are a product analyst. Analyze all the provided product images carefully. "
                "Describe the product's condition, visible features, colors, materials, any scratches or damage, "
                "and any text/labels visible. Be concise and factual."
            )

        try:
            content = [{"type": "text", "text": prompt}]
            
            # Add all images
            for img in images:
                base64_image = self._encode_image_to_base64(img)
                content.append({
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/jpeg;base64,{base64_image}"
                    }
                })

            response = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "user",
                        "content": content
                    }
                ],
                model=self.model,
                temperature=0.2,
                max_tokens=1024
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"Error analyzing image with Groq: {str(e)}"
