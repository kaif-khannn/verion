from typing import Optional, List, Any
from models.product_context import ProductContext

__all__ = ["ProductContext", "ContextBuilder"]


class ContextBuilder:
    """
    Builder pattern for assembling an immutable ProductContext object with Context Isolation.
    Fully backwards-compatible with user_input, sanitized_input, and sanitized_text keyword parameters.
    """

    @staticmethod
    def build(
        user_input: Optional[str] = None,
        vision_data: Optional[str] = None,
        market_data: Optional[str] = None,
        platform: str = "olx",
        raw_images: Optional[List[Any]] = None,
        sanitized_input: Optional[str] = None,
        sanitized_text: Optional[str] = None,
        vision_analysis: Optional[str] = None,
        rag_context: Optional[str] = None,
    ) -> ProductContext:
        final_input = user_input or sanitized_input or sanitized_text or ""
        final_vision = vision_data or vision_analysis
        final_market = market_data or rag_context

        return ProductContext(
            user_input=final_input,
            vision_data=final_vision,
            market_data=final_market,
            platform=platform,
            raw_images=raw_images,
        )
