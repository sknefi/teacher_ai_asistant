export type LessonOverview = {
  teacher_name: string;
  school_name: string;
  region: string;
  age_group: string;
  subject: string;
  lesson_type: string;
  curriculum_goal_inferred_or_given: string;
  overall_impression: string;
};

export type DomainScore = {
  score_1_to_4_or_NA: number | "NA";
  evidence: string;
  suggestions: string[];
  subject_specific_notes?: string;
};

export type DomainScores = Record<string, DomainScore>;

export type GlobalRating = {
  overall_score_average_or_band: string;
  top_strengths: string[];
  priority_areas_for_growth: string[];
  concrete_next_steps_for_teacher: string[];
};

export type LimitsOfInference = {
  audio_only_constraints: string;
  insufficient_evidence_domains: string[];
};

export type EvaluationPayload = {
  lesson_overview: LessonOverview;
  domain_scores: DomainScores;
  global_rating: GlobalRating;
  limits_of_inference: LimitsOfInference;
};
