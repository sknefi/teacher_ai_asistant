"""LLM integration that can talk to OpenAI or Featherless.ai."""

from __future__ import annotations

import json
import logging
import os
from typing import Any

from openai import OpenAI

logger = logging.getLogger(__name__)


class LLMEvaluator:
    """Wrapper around OpenAI-compatible chat completion APIs."""

    def __init__(
        self,
        system_prompt: str,
        model_name: str | None = None,
        temperature: float | None = None,
        api_key: str | None = None,
    ) -> None:
        self.system_prompt = system_prompt
        self.temperature = (
            temperature
            if temperature is not None
            else float(os.environ.get("LLM_TEMPERATURE", 0.1))
        )

        # Determine provider: prefer Featherless if key is present, otherwise OpenAI.
        featherless_key = os.environ.get("FEATHERLESS_API_KEY")
        openai_key = os.environ.get("OPENAI_API_KEY")

        if featherless_key:
            self.provider = "featherless"
            self.api_key = api_key or featherless_key
            self.base_url = os.environ.get(
                "FEATHERLESS_BASE_URL", "https://api.featherless.ai/v1"
            )
            default_model = "meta-llama/Meta-Llama-3.1-70B-Instruct"
        else:
            self.provider = "openai"
            self.api_key = api_key or openai_key
            self.base_url = os.environ.get("OPENAI_BASE_URL")
            default_model = "gpt-4o-mini"

        if not self.api_key:
            raise RuntimeError(
                "Missing API key: set OPENAI_API_KEY or FEATHERLESS_API_KEY in the environment."
            )

        self.model_name = (
            model_name
            or os.environ.get("LLM_MODEL")
            or default_model
        )

        client_kwargs = {"api_key": self.api_key}
        if self.base_url:
            client_kwargs["base_url"] = self.base_url
        self._client = OpenAI(**client_kwargs)

    def evaluate(self, user_prompt: str) -> dict[str, Any] | str:
        logger.info(
            "Calling %s model %s",
            "Featherless" if self.provider == "featherless" else "OpenAI",
            self.model_name,
        )

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

        try:
            parsed = json.loads(content)
            logger.info("LLM returned valid JSON")
            return parsed
        except json.JSONDecodeError:
            logger.warning("LLM response was not valid JSON; returning raw text")
            return content


__all__ = ["LLMEvaluator"]
