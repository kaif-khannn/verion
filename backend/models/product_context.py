from dataclasses import dataclass, field
from typing import Optional, List, Any


@dataclass(frozen=True)
class ProductContext:
    """
    Shared immutable ProductContext object with Context Isolation.
    Maintains strict separation between user_input, vision_data, and market_data.
    """
    user_input: str
    vision_data: Optional[str] = None
    market_data: Optional[str] = None
    platform: str = "olx"
    raw_images: Optional[List[Any]] = field(default=None, repr=False)

    @property
    def sanitized_text(self) -> str:
        """Alias for backward compatibility."""
        return self.user_input

    @property
    def sanitized_input(self) -> str:
        """Alias for backward compatibility."""
        return self.user_input

    @property
    def vision_analysis(self) -> Optional[str]:
        """Alias for backward compatibility."""
        return self.vision_data

    @property
    def rag_context(self) -> Optional[str]:
        """Alias for backward compatibility."""
        return self.market_data

    def to_prompt_context(self) -> str:
        """
        Formats isolated context blocks for downstream LLM prompts.
        """
        context = f"--- USER INPUT ---\n{self.user_input}"
        if self.vision_data:
            context += f"\n\n--- VISION DATA ---\n{self.vision_data}"
        if self.market_data:
            context += f"\n\n--- MARKET DATA ---\n{self.market_data}"
        return context
