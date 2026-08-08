import os
import base64
import io
import asyncio
from typing import List, Any
from services.llm_gateway import llm_gateway


class VisionAgent:
    """
    Vision Agent for analyzing product images using Groq's multimodal Llama 4 Scout model.
    Routed through LLMGateway for async execution, retry handling, and metrics tracking.
    """

    def __init__(self, gateway=None):
        self.gateway = gateway or llm_gateway
        self.model = "meta-llama/llama-4-scout-17b-16e-instruct"

    def _encode_image_to_base64(self, img: Any) -> str:
        buffered = io.BytesIO()
        if hasattr(img, "mode") and img.mode != "RGB":
            img = img.convert("RGB")
        img.save(buffered, format="JPEG")
        return base64.b64encode(buffered.getvalue()).decode("utf-8")

    async def analyze_image(self, images: List[Any], prompt: str = "") -> str:
        if not images:
            return ""

        vision_api_key = os.getenv("GROQ_VISION_API_KEY") or os.getenv("GROQ_API_KEY")
        if not vision_api_key:
            return "Error: GROQ_VISION_API_KEY / GROQ_API_KEY is not set."

        if not prompt:
            prompt = (
                "You are a product analyst. Analyze all the provided product images carefully. "
                "Describe the product's condition, visible features, colors, materials, any scratches or damage, "
                "and any text/labels visible. Be concise and factual."
            )

        try:
            # Build content payload (text prompt + base64 images)
            content: List[dict] = [{"type": "text", "text": prompt}]

            loop = asyncio.get_event_loop()
            for img in images:
                # Offload base64 encoding if needed to avoid blocking thread
                base64_image = await loop.run_in_executor(None, self._encode_image_to_base64, img)
                content.append({
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/jpeg;base64,{base64_image}"
                    }
                })

            messages = [{"role": "user", "content": content}]

            analysis_result = await self.gateway.generate_chat(
                messages=messages,
                model=self.model,
                temperature=0.2,
                max_tokens=1024,
                api_key=vision_api_key,
            )
            return analysis_result

        except Exception as e:
            return f"Error analyzing image with Groq Vision: {str(e)}"
