import json
from typing import Optional, List, Dict, Any
from services.llm_gateway import llm_gateway, LLMGateway
from services.prompt_loader import prompt_loader as default_prompt_loader, PromptLoader


class AnalyticsAgent:
    """
    Analytics Agent for generating business growth insights asynchronously via LLMGateway.
    """

    def __init__(self, gateway: Optional[LLMGateway] = None, prompt_loader_service: Optional[PromptLoader] = None):
        self.gateway = gateway or llm_gateway
        self.prompt_loader = prompt_loader_service or default_prompt_loader
        self.model = "llama-3.1-8b-instant"

    async def generate_insights(self, chart_data: list, current_stats: dict) -> str:
        system_prompt = self.prompt_loader.load("analytics_system")
        user_prompt = self.prompt_loader.render(
            "analytics",
            chart_data=json.dumps(chart_data, indent=2),
            current_stats=json.dumps(current_stats, indent=2),
        )

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ]

        try:
            return await self.gateway.generate_chat(
                messages=messages,
                model=self.model,
                temperature=0.7,
                max_tokens=1024,
                task_type="analytics",
                prompt_template_content=system_prompt,
                user_prompt_content=user_prompt,
            )
        except Exception as e:
            return f"Error generating analytics insights: {str(e)}"
