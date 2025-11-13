"""LLM integration for generating classroom evaluation JSON."""
from __future__ import annotations

import json
import logging
import os
from typing import Any

logger = logging.getLogger(__name__)


class LLMEvaluator:
    """Thin wrapper around OpenAI's ChatCompletion API."""

    def __init__(
        self,
        system_prompt: str,
        model_name: str | None = None,
        temperature: float | None = None,
        api_key: str | None = None,
    ) -> None:
        self.system_prompt = system_prompt
        self.model_name = model_name or os.environ.get("LLM_MODEL", "gpt-4o-mini")
        self.temperature = temperature if temperature is not None else float(
            os.environ.get("LLM_TEMPERATURE", 0.1)
        )
        self.api_key = api_key or os.environ.get("OPENAI_API_KEY")
        if not self.api_key:
            raise RuntimeError("OPENAI_API_KEY environment variable is required for LLM calls.")

        try:
            import openai
        except ImportError as exc:  # pragma: no cover - runtime feedback
            raise RuntimeError("The openai python package is required. Install it in your environment.") from exc

        openai.api_key = self.api_key
        self._client = openai

    def evaluate(self, user_prompt: str) -> dict[str, Any] | str:
        logger.info("Sending transcript + metadata to LLM model %s", self.model_name)
        response = self._client.ChatCompletion.create(  # type: ignore[attr-defined]
            model=self.model_name,
            temperature=self.temperature,
            messages=[
                {"role": "system", "content": self.system_prompt},
                {"role": "user", "content": user_prompt},
            ],
        )
        content = response["choices"][0]["message"]["content"].strip()

        # Attempt to parse JSON so the caller gets structured data already.
        try:
            parsed = json.loads(content)
            logger.info("LLM returned well-formed JSON")
            return parsed
        except json.JSONDecodeError:
            logger.warning("LLM response was not valid JSON; returning raw text")
            return content


__all__ = ["LLMEvaluator"]
