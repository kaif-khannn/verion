import uvicorn
from fastapi import FastAPI, HTTPException, status
from app.config import settings
from app.generator import ProductInput, BaselineResponse, generator

app = FastAPI(
    title="Verion AI Baseline - Conventional Single-LLM",
    description="Minimal conventional single-LLM reference implementation for experimental comparison.",
    version="1.0.0"
)

@app.get("/", tags=["Health"])
@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "baseline-single-llm",
        "model": settings.BASELINE_LLM_MODEL
    }

@app.post("/generate", response_model=BaselineResponse, tags=["Generation"])
def generate_listing(product_input: ProductInput) -> BaselineResponse:
    """
    Generate basic e-commerce product listing using a single fixed prompt and a single LLM call.
    """
    response = generator.generate(product_input)
    if not response.success:
        # Still return 200 with success=False or return response directly as per Section 10 schema requirement
        return response
    return response

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True
    )
