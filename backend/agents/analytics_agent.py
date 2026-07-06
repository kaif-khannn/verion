import os
from groq import Groq
import json

class AnalyticsAgent:
    def __init__(self):
        api_key = os.getenv("GROQ_API_KEY")
        if api_key:
            self.client = Groq(api_key=api_key)
            self.model = "llama-3.3-70b-versatile"
        else:
            self.client = None

    def generate_insights(self, chart_data: list, current_stats: dict) -> str:
        if not self.client:
            return "GROQ_API_KEY is not set. Analytics generation unavailable."

        prompt = f"""
        You are an expert e-commerce data analyst and AI business consultant.
        Given the following historical metrics (chart_data) and current overall stats (current_stats) of a user's e-commerce store optimizations, provide a short, highly actionable, and encouraging business insight summary.

        Format your response in Markdown. Use bullet points for key actions. 
        Keep it concise (around 3-4 short paragraphs/bullet points total). Focus on the trend of optimizations, SEO score lift, and time saved.
        Do not use any introductory conversational filler (e.g., "Here is your analysis"). Just start the insights directly.
        IMPORTANT: All pricing, revenue, and financial metrics MUST be formatted in Indian Rupees (₹ / INR), not US Dollars ($).

        Chart Data (last 7 days):
        {json.dumps(chart_data, indent=2)}

        Current Overall Stats:
        {json.dumps(current_stats, indent=2)}
        """

        try:
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert e-commerce data analyst."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                model=self.model,
                temperature=0.7,
                max_tokens=1024,
            )
            return chat_completion.choices[0].message.content
        except Exception as e:
            return f"Error generating analytics insights: {str(e)}"
