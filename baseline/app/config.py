import os
from pathlib import Path
from dotenv import load_dotenv

# Base paths
BASE_DIR = Path(__file__).resolve().parent.parent
PROJECT_ROOT = BASE_DIR.parent

# Load environment variables from baseline/.env if present, or root backend/.env as fallback
baseline_env = BASE_DIR / ".env"
backend_env = PROJECT_ROOT / "backend" / ".env"

if baseline_env.exists():
    load_dotenv(dotenv_path=baseline_env)
elif backend_env.exists():
    load_dotenv(dotenv_path=backend_env)
else:
    load_dotenv()

class Settings:
    """Configuration settings for the conventional single-LLM baseline."""
    
    # LLM Settings
    BASELINE_LLM_MODEL: str = os.getenv("BASELINE_LLM_MODEL", "llama-3.1-8b-instant")
    BASELINE_API_KEY: str = os.getenv("BASELINE_API_KEY") or os.getenv("GROQ_API_KEY", "")
    BASELINE_TEMPERATURE: float = float(os.getenv("BASELINE_TEMPERATURE", "0.7"))
    BASELINE_MAX_TOKENS: int = int(os.getenv("BASELINE_MAX_TOKENS", "1024"))

    # Server Settings
    HOST: str = os.getenv("BASELINE_HOST", "0.0.0.0")
    PORT: int = int(os.getenv("BASELINE_PORT", "8001"))

    # Prompt Template Path
    PROMPT_PATH: Path = BASE_DIR / "prompts" / "baseline_prompt.txt"

settings = Settings()
