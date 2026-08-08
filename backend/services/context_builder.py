from dataclasses import dataclass, field
from typing import Optional, List, Any


@dataclass
class ProductContext:
    """
    Unified product context payload containing sanitized text, vision analysis,
    RAG market data, target platform, and original images.
    """
    sanitized_input: str
    vision_analysis: Optional[str] = None
    rag_context: Optional[str] = None
    platform: str = "olx"
    raw_images: Optional[List[Any]] = field(default_factory=list)

    def to_prompt_context(self) -> str:
        """
        Formats consolidated context into a single string for downstream LLM prompts.
        """
        context = f"Text Description:\n{self.sanitized_input}"
        if self.vision_analysis:
            context += f"\n\nVision Analysis:\n{self.vision_analysis}"
        if self.rag_context:
            context += f"\n\n{self.rag_context}"
        return context


class ContextBuilder:
    """
    Builder pattern for assembling a unified ProductContext object.
    """

    @staticmethod
    def build(
        sanitized_input: str,
        vision_analysis: Optional[str] = None,
        rag_context: Optional[str] = None,
        platform: str = "olx",
        raw_images: Optional[List[Any]] = None,
    ) -> ProductContext:
        return ProductContext(
            sanitized_input=sanitized_input,
            vision_analysis=vision_analysis,
            rag_context=rag_context,
            platform=platform,
            raw_images=raw_images or [],
        )
