"""
LLM integration using Featherless.ai (OpenAI-compatible REST API).
"""

from __future__ import annotations
import json
import logging
import os
from typing import Any

from openai import OpenAI

logger = logging.getLogger(__name__)


class LLMEvaluator:
    """
    Wrapper around the Featherless.ai Chat Completions API.
    """

    def __init__(
        self,
        system_prompt: str,
        model_name: str | None = None,
        temperature: float | None = None,
        api_key: str | None = None,
    ) -> None:

        self.system_prompt = system_prompt

        # ⭐ DEFAULT MODEL (Featherless Llama 3.1 70B)
        # This model EXISTS on Featherless and avoids 404 errors
        self.model_name = (
            model_name
            or os.environ.get("LLM_MODEL")
            or "meta-llama/Meta-Llama-3.1-70B-Instruct"
        )

        self.temperature = (
            temperature
            if temperature is not None
            else float(os.environ.get("LLM_TEMPERATURE", 0.1))
        )

        # ⭐ Featherless API key from FEATHERLESS_API_KEY
        self.api_key = api_key or os.environ.get("FEATHERLESS_API_KEY")
        if not self.api_key:
            raise RuntimeError("FEATHERLESS_API_KEY env var is required.")

        # ⭐ OpenAI client pointed at Featherless API
        self._client = OpenAI(
            api_key=self.api_key,
            base_url="https://api.featherless.ai/v1",
        )

    def evaluate(self, user_prompt: str) -> dict[str, Any] | str:
        logger.info("Calling Featherless model %s", self.model_name)

        response = self._client.chat.completions.create(
            model=self.model_name,
            temperature=self.temperature,
            messages=[
                {"role": "system", "content": self.system_prompt},
                {"role": "user", "content": user_prompt},
            ],
        )

        message = response.choices[0].message
        content = message.content.strip() if message.content else ""

        # ⭐ Try to parse output as JSON
        try:
            parsed = json.loads(content)
            logger.info("Featherless returned valid JSON")
            return parsed
        except json.JSONDecodeError:
            logger.warning("Featherless response was not valid JSON. Returning raw text.")
            return content


__all__ = ["LLMEvaluator"]
