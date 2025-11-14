"use client";

import * as React from "react";
import { sampleEvaluation } from "@/data/sample-evaluation";
import { RadarSpiderChart } from "@/components/charts/radar-spider-chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { LessonUploadForm, UploadFeedback } from "@/components/lesson-upload-form";
import { EvaluationPayload, DomainScore, DomainScores } from "@/types/evaluation";
import { cn } from "@/lib/utils";
import { Award, BarChart3, Lightbulb, NotebookPen, UploadCloud, Users } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

const scoreColors: Record<string, string> = {
  "4": "text-emerald-600 bg-emerald-50",
  "3": "text-sky-600 bg-sky-50",
  "2": "text-amber-600 bg-amber-50",
  "1": "text-rose-600 bg-rose-50",
  default: "text-slate-600 bg-slate-100"
};

const scoreLabels: Record<number, string> = {
  4: "Exemplary",
  3: "Effective",
  2: "Developing",
  1: "Unsatisfactory"
};

type MetadataRecord = Record<string, unknown> | null;

export default function DashboardPage() {
  const [evaluation, setEvaluation] = React.useState<EvaluationPayload>(sampleEvaluation);
  const [latestTranscript, setLatestTranscript] = React.useState<string>("");
  const [resolvedMetadata, setResolvedMetadata] = React.useState<MetadataRecord>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [feedback, setFeedback] = React.useState<UploadFeedback | null>(null);
  const uploadSectionRef = React.useRef<HTMLDivElement | null>(null);

  const tiles = React.useMemo(() => buildStatTiles(evaluation), [evaluation]);
  const domainEntries = React.useMemo(() => Object.entries(evaluation.domain_scores ?? {}), [evaluation]);
  const radarData = React.useMemo(() => buildRadarData(evaluation.domain_scores), [evaluation]);

  const handleLessonUpload = React.useCallback(async (formData: FormData) => {
    setIsSubmitting(true);
    setFeedback(null);
    try {
      const endpoint = buildApiUrl("/api/evaluate/");
      const response = await fetch(endpoint, {
        method: "POST",
        body: formData
      });

      const payload = await parseResponse(response);
      const normalizedEvaluation = normalizeEvaluation(payload?.evaluation);
      setEvaluation(normalizedEvaluation);
      setLatestTranscript(payload?.transcript ?? "");
      setResolvedMetadata(payload?.metadata ?? null);
      setFeedback({ type: "success", message: "Lesson evaluated successfully." });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unexpected error while sending the lesson.";
      setFeedback({ type: "error", message });
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const scrollToUpload = () => {
    uploadSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <TooltipProvider>
      <AuroraBackground className="!h-auto min-h-screen w-full bg-transparent px-3 py-6 dark:bg-transparent md:px-6 lg:px-8">
        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-8 px-2 py-4 sm:px-4 sm:py-10">
          <header className="rounded-3xl border bg-white px-6 py-6 shadow-sm lg:px-10">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="space-y-3">
                <p className="text-sm uppercase tracking-wider text-muted-foreground">Lesson overview</p>
                <h1 className="text-3xl font-semibold text-slate-900">{evaluation.lesson_overview.teacher_name}</h1>
                <p className="max-w-2xl text-base text-muted-foreground">{evaluation.lesson_overview.overall_impression}</p>
                <div className="flex flex-wrap gap-2 text-sm">
                  <Badge variant="secondary" className="bg-slate-900 text-white">
                    {evaluation.lesson_overview.school_name}
                  </Badge>
                  <Badge variant="outline">{evaluation.lesson_overview.region}</Badge>
                  <Badge variant="outline">{evaluation.lesson_overview.subject}</Badge>
                  <Badge variant="outline">{evaluation.lesson_overview.lesson_type}</Badge>
                </div>
              </div>
              <div className="flex flex-col gap-3 md:items-end">
                <Button className="gap-2 text-base" onClick={scrollToUpload}>
                  <UploadCloud className="h-4 w-4" />
                  Upload lesson
                </Button>
                <p className="text-sm text-muted-foreground">
                  Hits the Django backend at <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">/api/evaluate/</code> using
                  {" "}
                  {API_BASE_URL}.
                </p>
              </div>
            </div>
          </header>

          <div ref={uploadSectionRef}>
            <LessonUploadForm onSubmit={handleLessonUpload} isSubmitting={isSubmitting} feedback={feedback} />
          </div>

          <LatestLessonCard metadata={resolvedMetadata} transcript={latestTranscript} />

          <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {tiles.map((tile) => (
              <Card key={tile.label} className="border-none bg-white shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardDescription className="text-xs uppercase tracking-wide text-muted-foreground">{tile.label}</CardDescription>
                  <tile.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold text-slate-900">{tile.value}</div>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{tile.description}</p>
                </CardContent>
              </Card>
            ))}
          </section>

          <Card className="border-none bg-white shadow-sm">
            <CardHeader className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle>Spider web of rubric scores</CardTitle>
                <CardDescription>Visual snapshot of performance across all domains (scale 1–4).</CardDescription>
              </div>
              <Badge variant="outline" className="text-xs">
                Max score 4
              </Badge>
            </CardHeader>
            <CardContent>
              <RadarSpiderChart data={radarData} />
            </CardContent>
          </Card>

          <Tabs defaultValue="strengths" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3 rounded-2xl bg-slate-100 p-1 text-xs sm:text-sm">
              <TabsTrigger value="strengths">Strengths</TabsTrigger>
              <TabsTrigger value="growth">Growth</TabsTrigger>
              <TabsTrigger value="limits">Audio limits</TabsTrigger>
            </TabsList>

            <TabsContent value="strengths">
              <Card className="border-none bg-white shadow-sm">
                <CardHeader>
                  <CardTitle>Coaching headlines</CardTitle>
                  <CardDescription>Celebrate what is working well.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  {evaluation.global_rating.top_strengths.map((item) => (
                    <ListItem key={item} icon={<Award className="h-5 w-5 text-emerald-600" />} text={item} />
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="growth">
              <Card className="border-none bg-white shadow-sm">
                <CardHeader>
                  <CardTitle>Growth focus</CardTitle>
                  <CardDescription>Pair needs with next steps.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {evaluation.global_rating.priority_areas_for_growth.map((item) => (
                    <ListItem key={item} icon={<Lightbulb className="h-4 w-4 text-amber-600" />} text={item} />
                  ))}
                </CardContent>
                <Separator />
                <CardHeader>
                  <CardTitle>Concrete next steps</CardTitle>
                  <CardDescription>Ready-to-use moves for upcoming lessons.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3">
                  {evaluation.global_rating.concrete_next_steps_for_teacher.map((step, idx) => (
                    <div key={step} className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                      <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                        {idx + 1}
                      </span>
                      <p className="text-sm text-slate-700">{step}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="limits">
              <Card className="border-none bg-white shadow-sm">
                <CardHeader>
                  <CardTitle>Limits of inference</CardTitle>
                  <CardDescription>Contextual reminders from an audio-only capture.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-slate-900">Audio-only constraints</p>
                    <p className="text-sm text-muted-foreground">{evaluation.limits_of_inference.audio_only_constraints}</p>
                  </div>
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-slate-900">Insufficient evidence</p>
                    <ul className="space-y-2">
                      {evaluation.limits_of_inference.insufficient_evidence_domains.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <NotebookPen className="mt-0.5 h-4 w-4 text-slate-400" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Card className="border-none bg-white shadow-sm">
            <CardHeader className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle>Domain evidence & suggestions</CardTitle>
                <CardDescription>Use this table to plan coaching conversations or share targeted feedback.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-[420px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Domain</TableHead>
                      <TableHead className="w-32">Score</TableHead>
                      <TableHead>Evidence</TableHead>
                      <TableHead>Suggestions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {domainEntries.map(([domainKey, domain]) => (
                      <TableRow key={domainKey}>
                        <TableCell className="font-medium text-slate-900">{formatDomainTitle(domainKey)}</TableCell>
                        <TableCell>
                          <ScoreBadge score={domain.score_1_to_4_or_NA} />
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{domain.evidence}</TableCell>
                        <TableCell>
                          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
                            {domain.suggestions.map((suggestion) => (
                              <li key={suggestion}>{suggestion}</li>
                            ))}
                          </ul>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </AuroraBackground>
    </TooltipProvider>
  );
}

const ListItem = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <div className="flex gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
    <div className="mt-1">{icon}</div>
    <p className="text-sm text-slate-700">{text}</p>
  </div>
);

const ScoreBadge = ({ score }: { score: DomainScore["score_1_to_4_or_NA"] }) => {
  if (typeof score !== "number") {
    return (
      <span className={cn("inline-flex min-w-[3.5rem] items-center justify-center rounded-full px-3 py-1 text-xs font-semibold", scoreColors.default)}>
        N/A
      </span>
    );
  }

  const key = score.toFixed(0);
  return (
    <span
      className={cn(
        "inline-flex min-w-[3.5rem] items-center justify-center rounded-full px-3 py-1 text-xs font-semibold",
        scoreColors[key] ?? scoreColors.default
      )}
    >
      {score.toFixed(1)}
    </span>
  );
};

function calculateAverageScore(data: EvaluationPayload) {
  const numericScores = Object.values(data.domain_scores).filter((domain) => typeof domain.score_1_to_4_or_NA === "number") as Array<
    DomainScore & { score_1_to_4_or_NA: number }
  >;
  if (!numericScores.length) {
    return 0;
  }
  const sum = numericScores.reduce((total, domain) => total + domain.score_1_to_4_or_NA, 0);
  return sum / numericScores.length;
}

function buildStatTiles(data: EvaluationPayload) {
  const firstSentence = data.lesson_overview.curriculum_goal_inferred_or_given.split(".")[0] ?? data.lesson_overview.curriculum_goal_inferred_or_given;
  return [
    {
      label: "Overall rating",
      value: data.global_rating.overall_score_average_or_band,
      icon: Award,
      description: "LLM composite judgement"
    },
    {
      label: "Average domain score",
      value: calculateAverageScore(data).toFixed(1),
      icon: BarChart3,
      description: "Across eight rubric domains"
    },
    {
      label: "Learner profile",
      value: data.lesson_overview.age_group,
      icon: Users,
      description: data.lesson_overview.region
    },
    {
      label: "Concept focus",
      value: data.lesson_overview.subject,
      icon: Lightbulb,
      description: firstSentence
    }
  ];
}

function buildRadarData(domainScores: EvaluationPayload["domain_scores"]) {
  return Object.entries(domainScores).map(([key, domain]) => ({
    domain: formatDomainTitle(key),
    score: typeof domain.score_1_to_4_or_NA === "number" ? domain.score_1_to_4_or_NA : 0
  }));
}

function formatDomainTitle(domainKey: string) {
  return domainKey
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function buildApiUrl(path: string) {
  const trimmedBase = API_BASE_URL.endsWith("/") ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  return `${trimmedBase}${path}`;
}

async function parseResponse(response: Response) {
  const text = await response.text();
  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const parsed = JSON.parse(text);
      if (parsed?.error) {
        message = parsed.error;
      }
    } catch {
      /* no-op */
    }
    throw new Error(message);
  }
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    throw new Error("Server returned malformed JSON.");
  }
}

function normalizeEvaluation(raw: unknown): EvaluationPayload {
  if (!raw) {
    return sampleEvaluation;
  }
  if (typeof raw === "string") {
    try {
      return normalizeEvaluation(JSON.parse(raw));
    } catch {
      return sampleEvaluation;
    }
  }
  const candidate = raw as Partial<EvaluationPayload>;
  if (!candidate.lesson_overview || !candidate.domain_scores || !candidate.global_rating || !candidate.limits_of_inference) {
    return sampleEvaluation;
  }
  return {
    lesson_overview: { ...sampleEvaluation.lesson_overview, ...candidate.lesson_overview },
    domain_scores: (candidate.domain_scores as DomainScores) ?? sampleEvaluation.domain_scores,
    global_rating: { ...sampleEvaluation.global_rating, ...candidate.global_rating },
    limits_of_inference: { ...sampleEvaluation.limits_of_inference, ...candidate.limits_of_inference }
  };
}

const LatestLessonCard = ({ metadata, transcript }: { metadata: MetadataRecord; transcript: string }) => {
  if (!metadata && !transcript) {
    return null;
  }

  const metadataEntries = metadata ? expandMetadata(metadata) : [];
  const transcriptPreview = transcript || "No transcript returned for this lesson.";

  return (
    <Card className="border-none bg-white shadow-sm">
      <CardHeader>
        <CardTitle>Latest lesson payload</CardTitle>
        <CardDescription>Resolved metadata & transcript excerpt from the backend.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">
        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-900">Metadata (after defaults)</p>
          {metadataEntries.length ? (
            <ul className="space-y-1 text-sm text-muted-foreground">
              {metadataEntries.map((entry) => (
                <li key={`${entry.label}-${entry.value}`} className="flex items-center justify-between gap-4">
                  <span className="font-medium text-slate-900">{entry.label}</span>
                  <span className="text-right text-slate-600">{entry.value}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Metadata will appear here after you upload a lesson.</p>
          )}
        </div>
        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-900">Transcript</p>
          <ScrollArea className="h-48 rounded-2xl border border-slate-100 p-4">
            <p className="whitespace-pre-wrap text-sm text-slate-700">{transcriptPreview}</p>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};

function expandMetadata(metadata: Record<string, unknown>) {
  const entries: Array<{ label: string; value: string }> = [];
  Object.entries(metadata).forEach(([key, value]) => {
    if (key === "extra_metadata" && value && typeof value === "object") {
      Object.entries(value as Record<string, unknown>).forEach(([extraKey, extraValue]) => {
        entries.push({ label: formatDomainTitle(extraKey), value: formatMetadataValue(extraValue) });
      });
    } else {
      entries.push({ label: formatDomainTitle(key), value: formatMetadataValue(value) });
    }
  });
  return entries;
}

function formatMetadataValue(value: unknown) {
  if (value === null || value === undefined) {
    return "—";
  }
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value.join(", ");
  }
  return JSON.stringify(value);
}
