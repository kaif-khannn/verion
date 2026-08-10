import os
from typing import Dict, Any, Optional


class PromptNotFoundError(FileNotFoundError):
    """Raised when a requested prompt template file does not exist on disk."""
    pass


class PromptLoader:
    """
    Service responsible for loading, rendering, and caching external prompt templates from disk.
    """

    def __init__(self, prompts_dir: Optional[str] = None):
        if prompts_dir is None:
            prompts_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "prompts")
        self.prompts_dir = os.path.abspath(prompts_dir)
        self._cache: Dict[str, str] = {}

    def load(self, prompt_name: str) -> str:
        """
        Loads prompt template text from disk and caches it in memory.
        Accepts template name with or without .md extension.
        Raises PromptNotFoundError if the file is missing.
        """
        clean_name = prompt_name[:-3] if prompt_name.endswith(".md") else prompt_name
        filename = f"{clean_name}.md"

        if clean_name in self._cache:
            return self._cache[clean_name]

        filepath = os.path.join(self.prompts_dir, filename)
        if not os.path.exists(filepath):
            raise PromptNotFoundError(f"Prompt template '{filename}' not found at path: {filepath}")

        try:
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
            self._cache[clean_name] = content
            return content
        except Exception as e:
            if isinstance(e, PromptNotFoundError):
                raise
            raise RuntimeError(f"Error reading prompt template file '{filepath}': {e}") from e

    def render(self, prompt_name: str, **kwargs: Any) -> str:
        """
        Loads the prompt template and formats it using keyword arguments.
        """
        template = self.load(prompt_name)
        if kwargs:
            return template.format(**kwargs)
        return template


# Global PromptLoader Singleton
prompt_loader = PromptLoader()
