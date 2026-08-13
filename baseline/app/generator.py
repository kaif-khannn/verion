import time
import logging
from typing import Dict, Any, Optional, List
from pydantic import BaseModel, Field
from groq import Groq
from app.config import settings

logger = logging.getLogger("baseline_generator")

class ProductInput(BaseModel):
    """Input payload model for baseline content generation."""
    product_name: str = Field(..., description="Name of the product")
    brand: Optional[str] = Field(None, description="Brand name")
    description: Optional[str] = Field(None, description="Raw product description")
    specifications: Optional[Dict[str, Any]] = Field(None, description="Key-value product specifications")
    price: Optional[str] = Field(None, description="Product price")
    condition: Optional[str] = Field(None, description="Condition of item e.g. New, Used")
    target_platform: Optional[str] = Field(None, description="E-commerce marketplace e.g. Shopify, Amazon")
    images: Optional[List[str]] = Field(None, description="Image URLs or file paths (ignored by baseline)")

class BaselineResponse(BaseModel):
    """Execution output and metadata model for baseline generation."""
    success: bool
    output: Optional[str] = None
    latency_ms: float
    model: str
    error: Optional[str] = None

class BaselineGenerator:
    """
    Conventional single-LLM generator using Groq API.
    
    Performs exactly ONE LLM call using a fixed baseline prompt.
    Does NOT contain agents, RAG, multi-step workflows, or self-critique.
    """

    def __init__(self):
        self.prompt_template = self._load_prompt_template()

    def _load_prompt_template(self) -> str:
        if not settings.PROMPT_PATH.exists():
            raise FileNotFoundError(f"Baseline prompt file not found at {settings.PROMPT_PATH}")
        with open(settings.PROMPT_PATH, "r", encoding="utf-8") as f:
            return f.read()

    def _format_product_input(self, product: ProductInput) -> str:
        formatted = []
        formatted.append(f"Product Name: {product.product_name}")
        if product.brand:
            formatted.append(f"Brand: {product.brand}")
        if product.price:
            formatted.append(f"Price: {product.price}")
        if product.condition:
            formatted.append(f"Condition: {product.condition}")
        if product.target_platform:
            formatted.append(f"Target Platform: {product.target_platform}")
        if product.description:
            formatted.append(f"Description: {product.description}")
        if product.specifications:
            specs_str = ", ".join(f"{k}: {v}" for k, v in product.specifications.items())
            formatted.append(f"Specifications: {specs_str}")
        
        return "\n".join(formatted)

    def generate(self, product_input: ProductInput) -> BaselineResponse:
        """
        Executes exactly ONE LLM call to generate an e-commerce product listing.
        """
        start_time = time.perf_counter()
        model_name = settings.BASELINE_LLM_MODEL
        api_key = settings.BASELINE_API_KEY

        if not api_key:
            elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)
            return BaselineResponse(
                success=False,
                output=None,
                latency_ms=elapsed_ms,
                model=model_name,
                error="BASELINE_API_KEY / GROQ_API_KEY is not set."
            )

        try:
            # 1. Format input
            formatted_input = self._format_product_input(product_input)
            
            # 2. Insert product info into prompt template
            full_prompt = self.prompt_template.replace("{PRODUCT_INPUT}", formatted_input)

            # 3. Make EXACTLY ONE Groq API call
            client = Groq(api_key=api_key)
            completion = client.chat.completions.create(
                model=model_name,
                messages=[
                    {"role": "user", "content": full_prompt}
                ],
                temperature=settings.BASELINE_TEMPERATURE,
                max_tokens=settings.BASELINE_MAX_TOKENS,
            )

            elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)
            raw_output = completion.choices[0].message.content

            return BaselineResponse(
                success=True,
                output=raw_output,
                latency_ms=elapsed_ms,
                model=model_name,
                error=None
            )

        except Exception as e:
            logger.exception("Error during baseline single-LLM generation")
            elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)
            return BaselineResponse(
                success=False,
                output=None,
                latency_ms=elapsed_ms,
                model=model_name,
                error=str(e)
            )

generator = BaselineGenerator()
