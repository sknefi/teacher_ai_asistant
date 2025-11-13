"""Typed helpers for lesson metadata shared with the LLM."""
from __future__ import annotations

from dataclasses import dataclass, field, asdict
from typing import Any, Mapping


@dataclass(slots=True)
class LessonContext:
    teacher_name: str = "Unknown Teacher"
    school_name: str = "Unknown School"
    region: str = "Unspecified Region"
    age_group: str = "Upper primary (9–11 years)"
    subject: str = "General Studies"
    lesson_type: str = "Practice / consolidation"
    curriculum_goal: str | None = None
    language_of_instruction: str = "Czech"

    extra_metadata: dict[str, Any] = field(default_factory=dict)

    @classmethod
    def from_payload(cls, payload: Mapping[str, Any] | None) -> "LessonContext":
        payload = payload or {}
        known = {k: payload.get(k) for k in {
            "teacher_name",
            "school_name",
            "region",
            "age_group",
            "subject",
            "lesson_type",
            "curriculum_goal",
            "language_of_instruction",
        }}
        filtered = {k: v for k, v in known.items() if v}
        extra = {k: v for k, v in payload.items() if k not in known}
        return cls(**filtered, extra_metadata=extra)

    def to_prompt_payload(self) -> dict[str, Any]:
        base = asdict(self)
        base.pop("extra_metadata", None)
        base["extra_metadata"] = self.extra_metadata
        return base

    def to_placeholder_mapping(self) -> dict[str, Any]:
        return {
            "TEACHER_NAME": self.teacher_name,
            "SCHOOL_NAME": self.school_name,
            "REGION": self.region,
            "AGE_GROUP": self.age_group,
            "SUBJECT": self.subject,
            "LESSON_TYPE": self.lesson_type,
            "CURRICULUM_GOAL": self.curriculum_goal or "Not provided",
            "LANGUAGE": self.language_of_instruction,
        }


__all__ = ["LessonContext"]
