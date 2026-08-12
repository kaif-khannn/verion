import os
import base64
import io
import asyncio
import hashlib
from typing import List, Any, Optional
from services.llm_gateway import llm_gateway, LLMGateway
from services.prompt_loader import prompt_loader as default_prompt_loader, PromptLoader
from services.json_utils import strip_think_tags


class VisionAgent:
    """
    Vision Agent for analyzing product images using Groq's multimodal Qwen 3.6 27B model.
    Routed through LLMGateway for async execution, caching, retry handling, and metrics tracking.
    """

    def __init__(self, gateway: Optional[LLMGateway] = None, prompt_loader_service: Optional[PromptLoader] = None):
        self.gateway = gateway or llm_gateway
        self.prompt_loader = prompt_loader_service or default_prompt_loader
        self.model = "qwen/qwen3.6-27b"

    def _encode_image_to_base64(self, img: Any) -> str:
        buffered = io.BytesIO()
        if hasattr(img, "mode") and img.mode != "RGB":
            img = img.convert("RGB")
        img.save(buffered, format="JPEG")
        return base64.b64encode(buffered.getvalue()).decode("utf-8")

    async def analyze_image(self, images: List[Any], prompt: str = "") -> str:
        if not images:
            return ""

        # Groq vision models support up to 3 images maximum per request
        images = images[:3]

        vision_api_key = os.getenv("GROQ_VISION_API_KEY") or os.getenv("GROQ_API_KEY")
        if not vision_api_key:
            return "Error: GROQ_VISION_API_KEY / GROQ_API_KEY is not set."

        prompt_text = prompt or self.prompt_loader.load("vision")

        try:
            # Build content payload (text prompt + base64 images)
            content: List[dict] = [{"type": "text", "text": prompt_text}]
            image_hashes = []

            loop = asyncio.get_event_loop()
            for img in images:
                base64_image = await loop.run_in_executor(None, self._encode_image_to_base64, img)
                content.append({
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/jpeg;base64,{base64_image}"
                    }
                })
                image_hashes.append(hashlib.md5(base64_image.encode("utf-8")).hexdigest())

            messages = [{"role": "user", "content": content}]
            user_prompt_content = f"Image hashes: {image_hashes}"

            analysis_result = await self.gateway.generate_chat(
                messages=messages,
                model=self.model,
                temperature=0.2,
                max_tokens=1024,
                api_key=vision_api_key,
                task_type="vision",
                prompt_template_content=prompt_text,
                user_prompt_content=user_prompt_content,
            )

            # Strip any reasoning <think>...</think> tags
            clean_result = strip_think_tags(analysis_result)
            return clean_result

        except Exception as e:
            return f"Error analyzing image with Groq Vision: {str(e)}"
