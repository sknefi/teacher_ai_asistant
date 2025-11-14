import { EvaluationPayload } from "@/types/evaluation";

export const sampleEvaluation: EvaluationPayload = {
  lesson_overview: {
    teacher_name: "Jana Nováková",
    school_name: "ZŠ Komenského",
    region: "Prague, Czech Republic",
    age_group: "Upper primary (9–11 years)",
    subject: "Mathematics",
    lesson_type: "Introduction of new concept",
    curriculum_goal_inferred_or_given:
      "Students will understand the concept of equivalent fractions and be able to identify and represent them using visual models and numerical notation.",
    overall_impression:
      "In this Mathematics lesson, Jana Nováková at ZŠ Komenského in Prague, Czech Republic provided a generally clear explanation of equivalent fractions and maintained a positive, orderly classroom climate. Many students had chances to respond, though there were missed opportunities to deepen reasoning and involve a wider range of voices."
  },
  domain_scores: {
    instructional_clarity_and_structure: {
      score_1_to_4_or_NA: 3,
      evidence:
        'At the start, the teacher stated, "Dnes se budeme učit o zlomcích, které jsou stejné, i když vypadají jinak," and then modeled several examples (1/2 = 2/4 = 4/8). Instructions for the worksheet were mostly understood; only one student asked for clarification.',
      suggestions: [
        "End the lesson with a short verbal summary or exit question to explicitly revisit the main idea of equivalent fractions.",
        "Before starting independent work, ask one or two students to restate the task in their own words to confirm understanding."
      ]
    },
    student_cognitive_engagement: {
      score_1_to_4_or_NA: 3,
      evidence:
        'Multiple students volunteered answers like "dvě čtvrtiny je to samé jako jedna polovina" and a few explained why. However, several exchanges were limited to the teacher asking, "Kolik je to?" and students giving only the final number without explanation.',
      suggestions: [
        'More frequently prompt students to explain how they know (e.g., "Proč to tak je?", "Jak jsi na to přišel?").',
        "Include at least one short pair-share where all students briefly explain their reasoning to a partner before answering aloud."
      ]
    },
    classroom_management_and_pacing: {
      score_1_to_4_or_NA: 4,
      evidence:
        'Transitions were smooth: when the teacher said, "Teď si vezměte prosím pracovní list," rustling was brief and students were ready within about 10 seconds. Two instances of side talk were addressed calmly with, "Teď potřebuju, abyste poslouchali," and learning resumed immediately.',
      suggestions: [
        "Maintain the same calm tone and clear directions as complexity of tasks increases in future lessons.",
        "Consider building in a brief mid-lesson stretch or quick game if you notice energy dropping during longer explanation segments."
      ]
    },
    classroom_climate_and_tone: {
      score_1_to_4_or_NA: 4,
      evidence:
        'The teacher consistently used polite forms ("prosím", "děkuju") and responded to an incorrect answer with, "To je zajímavý nápad, pojďme se na to podívat společně," rather than dismissing it. Students laughed with the teacher during a light moment about cutting a pizza into "sto kousků," indicating comfort and rapport.',
      suggestions: [
        "Continue normalizing mistakes as part of learning, explicitly saying that errors help the whole class understand fractions better.",
        'Occasionally name the positive climate for students (e.g., "Líbí se mi, že se nebojíte zkusit odpovědět, i když si nejste jistí.").'
      ]
    },
    questions_feedback_and_checks: {
      score_1_to_4_or_NA: 2,
      evidence:
        'The teacher frequently asked recall-style questions like "Kolik je tohle?" and often accepted a single correct answer before moving on. Feedback was mostly evaluative ("Ano, správně") with few follow-up questions probing reasoning.',
      suggestions: [
        'After a correct answer, follow up with a "why" question (e.g., "Proč je 2/4 stejné jako 1/2?") to deepen understanding.',
        'Use quick whole-class checks such as "Zvedněte ruku, pokud si myslíte, že tyto dva zlomky jsou stejné" to see how many students understand before continuing.'
      ]
    },
    equity_and_student_voice: {
      score_1_to_4_or_NA: 2,
      evidence:
        "The same three students (voices identified as at least two boys and one girl) answered most questions. The teacher occasionally said, \"Někdo jiný?\", but often accepted the first volunteer. No explicit invitations were made to quieter students or to call on different groups.",
      suggestions: [
        "Intentionally vary participation by sometimes calling on students who have not yet spoken (e.g., drawing names, using random sticks).",
        "Use think-pair-share so all students verbalize ideas in pairs before inviting a few to share with the whole class."
      ]
    },
    age_appropriateness_of_language: {
      score_1_to_4_or_NA: 4,
      evidence:
        'The teacher used concrete examples such as sharing a chocolate bar and pizza to illustrate fractions and avoided overly technical terms. When introducing "ekvivalentní zlomky," she immediately paraphrased: "To znamená zlomky, které ukazují stejný kus, jen jiným způsobem."',
      suggestions: [
        "Continue pairing new terminology with simple restatements and real-life examples.",
        "Ask students to generate their own everyday examples of equivalent fractions to further connect to their experience."
      ]
    },
    subject_specific_pedagogy: {
      score_1_to_4_or_NA: 3,
      evidence:
        "The teacher connected visual fraction strips to numeric representations (1/2, 2/4, 4/8) and asked why they represent the same quantity. However, most practice tasks involved straightforward matching of equivalent fractions without open-ended problem-solving.",
      subject_specific_notes:
        "For upper primary mathematics, the lesson included core fraction concepts and some conceptual linking between visuals and symbols. There was limited opportunity for students to reason about non-trivial cases or to create their own examples.",
      suggestions: [
        "Add at least one task where students must decide which of several fractions are equivalent and explain their reasoning in words.",
        "Include a challenge problem (e.g., 'Vymysli tři různé zlomky, které jsou stejné jako 3/6') to promote deeper mathematical thinking for advanced students."
      ]
    }
  },
  global_rating: {
    overall_score_average_or_band: "Effective (average ≈ 3.0 / 4)",
    top_strengths: [
      "Maintains a warm, respectful classroom climate where students appear comfortable answering and making mistakes.",
      "Manages time and behavior effectively, keeping the lesson moving with minimal loss of learning time."
    ],
    priority_areas_for_growth: [
      "Increase the depth and variety of questions to elicit more student reasoning about equivalent fractions.",
      "Broaden participation so that more than the same few students regularly contribute ideas aloud."
    ],
    concrete_next_steps_for_teacher: [
      "In the next fractions lesson, plan three specific follow-up prompts (e.g., 'Jak to víš?', 'Můžeš to vysvětlit jinak?') to use after correct answers.",
      "Introduce a simple participation routine, such as think-pair-share, at least once per lesson to give all students time to talk.",
      "Over the next 4–6 weeks, gradually add more open problems where students must justify which fractions are or are not equivalent, and share solutions in pairs or small groups before whole-class discussion."
    ]
  },
  limits_of_inference: {
    audio_only_constraints:
      "From audio alone it is not possible to evaluate the quality of written work, visual fraction representations on the board, seating arrangement, or whether all students are following along silently. Non-verbal cues such as facial expressions and hand-raising cannot be observed.",
    insufficient_evidence_domains: [
      "No evidence was available about how student written work was checked or marked during the lesson (assessment of individual worksheets).",
      "It is not clear from audio only how many students were off-task visually (e.g., drawing, looking away) during explanations."
    ]
  }
};
